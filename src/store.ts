import * as vscode from "vscode";
import { observable, autorun, computed } from "mobx";
import * as open from "open";
import { Playlist, GeneratedPlaylistLandingBlock, Search, Track, ChartItem, LandingBlock, LandingBlockItem } from "yandex-music-client";

import { PlayerBarItem } from "./statusbar/playerBarItem";
import { RewindBarItem } from "./statusbar/rewindBarItem";
import { YandexMusicApi } from "./YandexMusicApi/YandexMusicApi";
import { ElectronPlayer } from "./players/electronPlayer";
import { IYandexMusicAuthData } from "./settings";
import { generatePlayId, getAlbums, getArtists, getCoverUri } from "./YandexMusicApi/ApiUtils";
import { defaultTraceSource } from "./logging/TraceSource";
import { RadioPlaylist } from "./players/RadioPlaylist";
import { TracksPlaylist } from './players/TracksPlaylist';
import { logError } from "./logging/ErrorLogger";

export interface UserCredentials {
  username: string | undefined;
  password: string | undefined;
}

export const LIKED_TRACKS_PLAYLIST_ID = "LIKED_TRACKS_PLAYLIST_ID";
export const LIKED_PODCASTS_PLAYLIST_ID = "LIKED_PODCASTS_PLAYLIST_ID";
export const CHART_TRACKS_PLAYLIST_ID = "CHART_TRACKS_PLAYLIST_ID";
export const NEW_RELEASES_PLAYLIST_ID = "NEW_RELEASES_PLAYLIST_ID";
export const SEARCH_TRACKS_PLAYLIST_ID = "SEARCH_TRACKS_PLAYLIST_ID";

export class Store {
  private player = new ElectronPlayer();
  private playerControlPanel = new PlayerBarItem(this, vscode.StatusBarAlignment.Left, 2001);
  private rewindPanel = new RewindBarItem(this, vscode.StatusBarAlignment.Left, 2000);
  private landingBlocks: LandingBlock[] = [];
  private totalPlayedSeconds: number = -1;
  @observable isPlaying = false;
  @observable playLists = new Map<string, TracksPlaylist>();
  @observable private currentTrackIndex: number | undefined;
  //TODO add "type PlayListId = string | number | undefined;"
  @observable private currentPlayListId: string | undefined;
  private searchText = '';
  @observable searchResult: Search | undefined;
  /**
   * Уникальный идентификатор проигрывания. Необходимо отправлять один и тот же id в начале и конце проигрывания трека.
   */
  private playId = '';

  // TODO create abstraction around "YandexMusicApi" which will be called "PlayListLoader" or "PlayListProvider" 
  // where we will be able to hide all logic about adding custom identifiers like we have in searchTree
  private _api: YandexMusicApi;

  get api(): YandexMusicApi {
    return this._api;
  }

  isAuthorized(): boolean {
    return this._api.isAuthorized;
  }

  @observable currentTrack: Track | null | undefined = null;
  @observable nextTrack: Track | null | undefined = null;
  @observable prevTrack: Track | null | undefined = null;

  @computed get hasNextTrack(): boolean {
    return this.nextTrack != null;
  }

  @computed get hasPrevTrack(): boolean {
    return this.prevTrack != null;
  }

  @computed get hasCurrentTrack(): boolean {
    return this.currentTrack != null;
  }

  constructor(api: YandexMusicApi) {
    this._api = api;
  }

  /**
   * Downloads (if necessary) and runs electron to play music
   */
  async initPlayer() {
    await this.player.init();

    this.player.on("message", (message) => {
      switch (message.command) {
        case 'nexttrack': this.next(message.reason); break;
        case 'previoustrack': this.prev(); break;
        case 'paused': this.isPlaying = false; break;
        case 'resumed': this.isPlaying = true; break;
        case 'timeupdate': this.totalPlayedSeconds = message.currentTime; break;
      }
    });

    this.player.on("error", (error: { message: string, stack: string }) => {
      vscode.window.showErrorMessage(JSON.stringify(error));
      console.error(error);
      defaultTraceSource.error(error.stack);
    });
  }

  async init(authData?: IYandexMusicAuthData): Promise<void> {
    this._api.setup(authData);

    if (authData != null) {
      this.landingBlocks = await this.api.getLandingBlocks();

      // Need fetch liked tracks to show like/dislike button correctly
      await this.refreshLikedTracks();
    }

    vscode.commands.executeCommand("setContext", "yandexMusic.isAuthorized", this.isAuthorized());

    autorun(() => {
      vscode.commands.executeCommand("setContext", "yandexMusic.isPlaying", this.isPlaying);
    });
  }

  async doSearch(searchText: string) {
    try {
      this.searchText = searchText;
      const resp = await this.api.search(this.searchText);
      this.searchResult = resp.result;
      vscode.commands.executeCommand("setContext", "yandexMusic.hasSearchResult", true);
      if (this.searchResult.tracks) {
        this.saveTrackPlaylist(SEARCH_TRACKS_PLAYLIST_ID, this.searchResult.tracks.results);
      } else {
        this.removePlaylist(SEARCH_TRACKS_PLAYLIST_ID);
      }
    } catch (e) {
      vscode.window
        .showErrorMessage("Не удалось выполнить поиск.");
      console.error(e);
      defaultTraceSource.error(`Не удалось выполнить поиск: ${e?.toString()}`);
    }
  }

  clearSearchResult() {
    this.searchResult = undefined;
    vscode.commands.executeCommand("setContext", "yandexMusic.hasSearchResult", false);
  }

  getLandingBlock(type: string) {
    return this.landingBlocks.find((item) => item.type === type);
  }

  getGeneratedPlayLists(): Playlist[] {
    const block = this.getLandingBlock("personal-playlists");
    const playLists = (block?.entities ?? []) as LandingBlockItem[];

    return playLists.map((item) => (item.data as GeneratedPlaylistLandingBlock).data);
  }

  async getChart(): Promise<ChartItem[]> {
    const { tracks, chartItems } = await this.api.getChartTracks();
    this.saveTrackPlaylist(CHART_TRACKS_PLAYLIST_ID, tracks);

    return chartItems;
  }

  async getAlbumTracks(albumId: number): Promise<Track[]> {
    const tracks = await this.api.getAlbumTracks(albumId);
    this.saveTrackPlaylist(albumId, tracks);

    return tracks;
  }

  async getArtistTracks(artistId: string): Promise<Track[]> {
    const tracks = await this.api.getArtistTracks(artistId);
    this.saveTrackPlaylist(artistId, tracks);

    return tracks;
  }

  async getTracks(userId: number, playListId: number) {
    const result = await this.api.getPlaylistTracks(userId, playListId);
    this.saveTrackPlaylist(playListId, result);

    return result;
  }

  async startRadio(radioId: string) {
    await this.api.startRadio(radioId);
    const radio = new RadioPlaylist(this, radioId);
    this.saveRadioPlaylist(radio);
    await radio.loadNextBatch();

    this.play({ itemId: radio.tracks[0].id, playListId: radioId });
  }

  getLikedTracks() {
    return this.getLikedTracksInternal(LIKED_TRACKS_PLAYLIST_ID);
  }

  getLikedPodcasts() {
    return this.getLikedTracksInternal(LIKED_PODCASTS_PLAYLIST_ID);
  }

  private async getLikedTracksInternal(playlistId: string) {
    const tracks = this.playLists.get(playlistId)?.tracks ?? [];
    if (tracks.length > 0) {
      return Promise.resolve(tracks);
    }

    await this.refreshLikedTracks();

    return this.playLists.get(playlistId)?.tracks ?? [];
  }

  private likesPromise: ReturnType<typeof this.api.getLikedTracks> | null = null;
  async refreshLikedTracks(): Promise<void> {
    if (this.likesPromise) {
      await this.likesPromise;
      return;
    }

    try {
      const result = await (this.likesPromise = this.api.getLikedTracks());
      const podcasts = result.filter(item => item.type === 'podcast-episode');
      const tracks = result.filter(item => item.type === 'music');
      this.saveTrackPlaylist(LIKED_PODCASTS_PLAYLIST_ID, podcasts);
      this.saveTrackPlaylist(LIKED_TRACKS_PLAYLIST_ID, tracks);
    }
    catch (ex) {
      defaultTraceSource.error(`Error while refreshing liked tracks: ${ex?.toString()}`);
    }
    finally {
      this.likesPromise = null;
    }
  }

  play(track?: { itemId: string; playListId: string }) {
    if (track) {
      const playlist = this.playLists.get(track.playListId);
      if (playlist) {
        const index = playlist.getTrackIndex(track.itemId);
        if (index !== -1) {
          this.currentPlayListId = track.playListId;
          this.internalPlay(index);
        }
      } else {
        defaultTraceSource.error(`playlist ${track?.itemId} is not found`);
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

  async toggleLikeTrack(track: Track): Promise<void> {
    try {
      this.api.likeAction(track, this.isLikedTrack(track.id, track.type) ? 'remove-like' : 'like');
    } catch (_ex) {
      const ex = _ex as ({ response: { status: number } });
      if (ex.response.status === 401) {
        vscode.window
          .showErrorMessage(
            "Добавлять трек в раздел \"Моя коллекция\" могут только авторизованные пользователи", {
            title: 'Авторизоваться'
          })
          .then((action) => {
            if (action?.title === "Авторизоваться") {
              vscode.commands.executeCommand("yandexMusic.signIn");
            }
          });
      } else {
        vscode.window.showErrorMessage("Неизвестная ошибка ошибка");
        console.error(ex);
      }
    }
  }

  async toggleLikeCurrentTrack(): Promise<void> {
    if (this.currentTrack != null) {
      return this.toggleLikeTrack(this.currentTrack);
    }
  }

  rewind(sec: number) {
    this.player.rewind(sec);
  }

  async next(reason: 'skip' | 'track-finished') {
    if (reason === 'skip' && this.currentPlayListId && this.currentTrack) {
      const playlist = this.playLists.get(this.currentPlayListId);

      if (this.currentTrack && playlist instanceof RadioPlaylist && playlist.batchId) {
        await this.api.skipTrack(this.currentTrack, playlist.id, playlist.batchId, this.totalPlayedSeconds);
      }
    }

    this.internalPlay((this.currentTrackIndex ?? 0) + 1);
  }

  async prev() {
    if (this.currentPlayListId && this.currentTrack) {
      const playlist = this.playLists.get(this.currentPlayListId);

      if (this.currentTrack && playlist instanceof RadioPlaylist && playlist.batchId) {
        await this.api.skipTrack(this.currentTrack, playlist.id, playlist.batchId, this.totalPlayedSeconds);
      }
    }

    this.internalPlay((this.currentTrackIndex ?? 0) - 1);
  }

  isLikedTrack(id: string, trackType: string): boolean {
    let playlist: TracksPlaylist | undefined = undefined;
    if (this.playLists.has(LIKED_TRACKS_PLAYLIST_ID) && trackType === 'music') {
      playlist = this.playLists.get(LIKED_TRACKS_PLAYLIST_ID);
    } else if (this.playLists.has(LIKED_PODCASTS_PLAYLIST_ID) && trackType === 'podcast-episode') {
      playlist = this.playLists.get(LIKED_PODCASTS_PLAYLIST_ID);
    }

    if (playlist == null) {
      return false;
    }

    const track = playlist.getById(id);

    return track != null;
  }

  isLikedCurrentTrack(): boolean {
    return this.currentTrack != null && this.isLikedTrack(this.currentTrack.id, this.currentTrack.type);
  }

  async downloadTrack(track: Track) {
    const url = await this._api.getTrackUrl(track.id);
    open(url);
  }

  /**
   * Plays track in current playlist by index
   * 
   * @param index Song index of current playList
   */
  private async internalPlay(index: number) {
    if (!this.currentPlayListId) {
      return;
    }

    try {
      const playlist = this.playLists.get(this.currentPlayListId);

      if (playlist == null) {
        return;
      }

      const track = await playlist.getByIndex(index);
      if (track == null) {
        return;
      }

      this.currentTrackIndex = index;

      this.currentTrack = track;

      if (this.currentTrack && this.playId && playlist instanceof RadioPlaylist && playlist.batchId) {
        try {
          await this.api.finishPlayAudio(this.playId, this.currentTrack, playlist.id, playlist.batchId);
        } catch (ex) {
          // sometimes 502 error may happen for some reason. It happens sometimes in official yandex app as well
          logError(ex);
        }
      }

      this.prevTrack = await playlist.getByIndex(index - 1);
      this.nextTrack = await playlist.getByIndex(index + 1);

      this.playId = generatePlayId();

      if (this.currentTrack && this.playId && playlist instanceof RadioPlaylist && playlist.batchId) {
        try {
          await this.api.startPlayAudio(this.playId, this.currentTrack, playlist.id, playlist.batchId);
        } catch (ex) {
          // sometimes 502 error may happen for some reason. It happens sometimes in official yandex app as well
          logError(ex);
        }
      }

      const url = await this._api.getTrackUrl(track.id);
      this.player.play({
        url,
        album: getAlbums(track),
        artist: getArtists(track),
        title: track.title,
        coverUri: getCoverUri(track.coverUri, 200),
      });
      this.isPlaying = true;

    } catch (ex) {
      logError(ex as any);
    }
  }

  private saveTrackPlaylist(playListId: string | number, tracks: Track[]) {
    const strId = playListId.toString();
    this.playLists.set(strId, new TracksPlaylist(strId, tracks));
  }

  private saveRadioPlaylist(playlist: RadioPlaylist) {
    this.playLists.set(playlist.id, playlist);
  }

  private removePlaylist(playListId: string) {
    this.playLists.delete(playListId);
  }

  dispose() {
    this.player?.dispose();
  }
}
