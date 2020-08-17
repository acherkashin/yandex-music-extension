import * as vscode from "vscode";
import { TrackItem, Track, ALL_LANDING_BLOCKS } from "./yandexApi/interfaces";
import { observable, autorun, computed } from "mobx";
import { PlayerBarItem } from "./statusbar/playerBarItem";
import { RewindBarItem } from "./statusbar/rewindBarItem";
import { YandexMusicApi } from "./yandexApi/yandexMusicApi";
import * as open from "open";
import { Album } from "./yandexApi/album/album";
import { PlayList } from "./yandexApi/playlist/playList";
import { LandingBlock } from "./yandexApi/landing/block";
import { LandingBlockEntity } from "./yandexApi/landing/blockentity";
import { GeneratedPlayListItem } from "./yandexApi/feed/generatedPlayListItem";
import { ElectronPlayer } from "./players/electronPlayer";
import { YandexMusicSettings } from "./settings";
import { ChartItem } from "./yandexApi/landing/chartitem";
import { getAlbums, getArtists, getCoverUri, createAlbumTrackId } from "./yandexApi/apiUtils";

export interface UserCredentials {
  username: string | undefined;
  password: string | undefined;
}

export const LIKED_TRACKS_PLAYLIST_ID = "LIKED_TRACKS_PLAYLIST_ID";
export const CHART_TRACKS_PLAYLIST_ID = "CHART_TRACKS_PLAYLIST_ID";
export const NEW_RELEASES_PLAYLIST_ID = "NEW_RELEASES_PLAYLIST_ID";
export class Store {
  private player = new ElectronPlayer();
  private playerControlPanel = new PlayerBarItem(this, vscode.StatusBarAlignment.Left, 2001);
  private rewindPanel = new RewindBarItem(this, vscode.StatusBarAlignment.Left, 2000);
  private landingBlocks: LandingBlock[] = [];
  @observable isPlaying = false;
  private playLists = new Map<string | number, Track[]>();
  @observable private currentTrackIndex: number | undefined;
  //TODO add "type PlayListId = string | number | undefined;"
  @observable private currentPlayListId: string | number | undefined;

  api = new YandexMusicApi();

  isAuthorized(): boolean {
    return this.api.isAutorized;
  }

  @computed get currentTrack(): Track | null {
    if (this.currentPlayListId == null || this.currentTrackIndex == null) {
      return null;
    }
    return this.getTrack(this.currentPlayListId, this.currentTrackIndex);
  }

  @computed get nextTrack(): Track | null {
    if (this.currentPlayListId == null || this.currentTrackIndex == null) {
      return null;
    }

    return this.getTrack(this.currentPlayListId, this.currentTrackIndex + 1);
  }

  @computed get prevTrack(): Track | null {
    if (this.currentPlayListId == null || this.currentTrackIndex == null) {
      return null;
    }

    return this.getTrack(this.currentPlayListId, this.currentTrackIndex - 1);
  }

  @computed get hasNextTrack(): boolean {
    return this.nextTrack != null;
  }

  @computed get hasPrevTrack(): boolean {
    return this.prevTrack != null;
  }

  @computed get hasCurrentTrack(): boolean {
    return this.currentTrack != null;
  }

  constructor() { }

  async init(): Promise<void> {
    if (YandexMusicSettings.instance.isAuthValid()) {
      try {
        /**
         * TODO: need to add mechanism to refresh token
         */
        try {
          const initData = await this.api.init(YandexMusicSettings.instance.authConfig);
          YandexMusicSettings.instance.accessToken = initData.access_token;
          YandexMusicSettings.instance.userId = initData.uid;

          await this.api.getLanding(...ALL_LANDING_BLOCKS).then((resp) => {
            this.landingBlocks = resp.data.result.blocks;
          });

          // Need fetch liked tracks to show like/dislike button correctly
          await this.refreshLikedTracks();
        } catch (e) {
          vscode.window
            .showErrorMessage("Не удалось войти в Yandex аккаунт. Проверьте правильность логина и пароля.", "Изменить логин и пароль")
            .then(() => {
              vscode.commands.executeCommand("yandexMusic.signIn");
            });
        }

        this.player.on("ended", () => {
          this.next();
        });

        this.player.on("error", (error) => {
          vscode.window.showErrorMessage(JSON.stringify(error));
        });

        autorun(() => {
          vscode.commands.executeCommand("setContext", "yandexMusic.isPlaying", this.isPlaying);
        });
      } catch (ex) {
        vscode.window.showErrorMessage(`Unknown exception: ${JSON.stringify(ex)}`);
      }
    }

    return await Promise.resolve();
  }

  getLandingBlock(type: string) {
    return this.landingBlocks.find((item) => item.type === type);
  }

  getGeneratedPlayLists(): PlayList[] {
    return (this.getLandingBlock("personal-playlists")?.entities as LandingBlockEntity<GeneratedPlayListItem>[]).map(
      (item) => item.data.data
    );
  }

  async getUserPlaylists() {
    return this.api.getAllUserPlaylists();
  }

  getChart(): Promise<ChartItem[]> {
    return this.api.getAllChartTracks("russia").then((resp) => {
      const chartItems = resp.data.result.chart.tracks as ChartItem[];
      const tracks = this.exposeTracks(chartItems);
      this.savePlaylist(CHART_TRACKS_PLAYLIST_ID, tracks);

      return chartItems;
    });
  }

  getNewReleases(): Promise<Album[]> {
    return this.api.getAllNewReleases().then((resp) => {
      return resp.data.result;
    });
  }

  getNewPlayLists(): Promise<PlayList[]> {
    return this.api.getAllNewPlayLists().then((resp) => {
      return resp.data.result;
    });
  }

  getActualPodcasts(): Promise<Album[]> {
    return this.api.getActualPodcasts().then((resp) => {
      return resp.data.result;
    });
  }

  getAlbumTracks(albumId: number): Promise<Track[]> {
    return this.api.getAlbum(albumId, true).then((resp) => {
      const tracks = (resp.data.result.volumes || []).reduce((a, b) => a.concat(b));
      this.savePlaylist(albumId, tracks);

      return tracks;
    });
  }

  getTracks(userId: string | number | undefined, playListId: string | number) {
    return this.api.getPlaylist(userId, playListId).then((result) => {
      this.savePlaylist(playListId, this.exposeTracks(result.data.result.tracks));

      return result;
    });
  }

  async getLikedTracks(): Promise<Track[]> {
    if (this.playLists.has(LIKED_TRACKS_PLAYLIST_ID) && (this.playLists.get(LIKED_TRACKS_PLAYLIST_ID)?.length ?? 0) > 0) {
      return Promise.resolve(this.playLists.get(LIKED_TRACKS_PLAYLIST_ID) ?? []);
    }

    return this.refreshLikedTracks();
  }

  async refreshLikedTracks() {
    const resp = await this.api.getLikedTracks();
    this.savePlaylist(LIKED_TRACKS_PLAYLIST_ID, resp.result);

    return resp.result;
  }

  play(track?: { itemId: string; playListId: string | number }) {
    if (track) {
      const tracks = this.playLists.get(track.playListId);
      if (tracks) {
        const index = tracks.findIndex((item) => item.id === track?.itemId);
        if (index !== -1) {
          this.currentPlayListId = track.playListId;
          this.internalPlay(index);
        }
      } else {
        console.error(`playlist ${track?.itemId}`);
      }
      // update current song
    } else {
      this.player.play();
      this.isPlaying = true;
    }
  }

  pause() {
    this.player.pause();
    this.isPlaying = false;
  }

  async toggleLikeTrack(track: Track) {
    await this.api.likeAction('track', createAlbumTrackId({
      id: track.id,
      albumId: track.albums[0].id,
    }), this.isLikedTrack(track.id));
  }

  async toggleLikeCurrentTrack() {
    if (this.currentTrack != null) {
      return this.toggleLikeTrack(this.currentTrack);
    }
  }

  rewind(sec: number) {
    this.player.rewind(sec);
  }

  next() {
    this.internalPlay((this.currentTrackIndex ?? 0) + 1);
  }

  prev() {
    this.internalPlay((this.currentTrackIndex ?? 1) - 1);
  }

  isLikedTrack(id: string): boolean {
    if (this.playLists.has(LIKED_TRACKS_PLAYLIST_ID)) {
      const tracks = this.playLists.get(LIKED_TRACKS_PLAYLIST_ID) ?? [];
      const track = tracks.find((track) => track.id === id);

      return track != null;
    }

    return false;
  }

  isLikedCurrentTrack(): boolean {
    return this.currentTrack != null && this.isLikedTrack(this.currentTrack.id);
  }

  async downloadTrack(track: Track) {
    const url = await this.api.getTrackUrl(track.storageDir);
    open(url);
  }

  /**
   *
   * @param index Song index of current playList
   */
  private async internalPlay(index: number) {
    this.currentTrackIndex = index;

    if (this.currentPlayListId) {
      const track = this.playLists.get(this.currentPlayListId)?.[index];

      if (track) {
        const url = await this.api.getTrackUrl(track.storageDir);
        this.player.play({
          url,
          album: getAlbums(track),
          artist: getArtists(track),
          title: track.title,
          coverUri: getCoverUri(track.coverUri, 200),
        });
        this.isPlaying = true;
      }
    }
  }

  private exposeTracks(tracks: TrackItem[]): Track[] {
    return tracks.map((item) => <Track>item.track);
  }

  private savePlaylist(playListId: number | string, tracks: Track[]) {
    this.playLists.set(playListId, tracks);
  }

  private getTrack(playListId: number | string, index: number): Track | null {
    const tracks = this.playLists.get(playListId);

    if (tracks == null) {
      return null;
    }

    return tracks[index];
  }
}
