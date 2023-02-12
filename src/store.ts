import * as vscode from "vscode";
import { observable, autorun, computed } from "mobx";
import * as open from "open";
import { Playlist, GeneratedPlaylistLandingBlock, Search, Track, ChartItem, LandingBlock, LandingBlockItem } from "yandex-music-client";

import { PlayerBarItem } from "./statusbar/playerBarItem";
import { RewindBarItem } from "./statusbar/rewindBarItem";
import { YandexMusicApi } from "./YandexMusicApi/YandexMusicApi";
import { ElectronPlayer } from "./players/electronPlayer";
import { IYandexMusicAuthData } from "./settings";
import { getAlbums, getArtists, getCoverUri } from "./YandexMusicApi/ApiUtils";
import { defaultTraceSource } from "./logging/TraceSource";

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
  @observable isPlaying = false;
  // TODO: implement PlayList class which will implement "loadMore" function
  @observable playLists = new Map<string, Track[]>();
  @observable private currentTrackIndex: number | undefined;
  //TODO add "type PlayListId = string | number | undefined;"
  @observable private currentPlayListId: string | undefined;
  private searchText = '';
  @observable searchResult: Search | undefined;

  // TODO create abstraction around "YandexMusicApi" which will be called "PlayListLoader" or "PlayListProvider" 
  // where we will be able to hide all logic about adding custom identifiers like we have in searchTree
  private _api: YandexMusicApi;

  get api(): YandexMusicApi {
    return this._api;
  }

  isAuthorized(): boolean {
    return this._api.isAuthorized;
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
        case 'nexttrack': this.next(); break;
        case 'previoustrack': this.prev(); break;
        case 'paused': this.isPlaying = false; break;
        case 'resumed': this.isPlaying = true; break;
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
        this.savePlaylist(SEARCH_TRACKS_PLAYLIST_ID, this.searchResult.tracks.results);
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
    this.savePlaylist(CHART_TRACKS_PLAYLIST_ID, tracks);

    return chartItems;
  }

  async getAlbumTracks(albumId: number): Promise<Track[]> {
    const tracks = await this.api.getAlbumTracks(albumId);
    this.savePlaylist(albumId, tracks);

    return tracks;
  }

  async getArtistTracks(artistId: string): Promise<Track[]> {
    const tracks = await this.api.getArtistTracks(artistId);
    this.savePlaylist(artistId, tracks);

    return tracks;
  }

  async getTracks(userId: number, playListId: number) {
    const result = await this.api.getPlaylistTracks(userId, playListId);
    this.savePlaylist(playListId, result);

    return result;
  }

  async getLikedTracks(): Promise<Track[]> {
    if (this.playLists.has(LIKED_TRACKS_PLAYLIST_ID) && (this.playLists.get(LIKED_TRACKS_PLAYLIST_ID)?.length ?? 0) > 0) {
      return Promise.resolve(this.playLists.get(LIKED_TRACKS_PLAYLIST_ID) ?? []);
    }

    await this.refreshLikedTracks();

    return this.playLists.get(LIKED_TRACKS_PLAYLIST_ID) ?? [];
  }

  async getLikedPodcasts(): Promise<Track[]> {
    if (this.playLists.has(LIKED_PODCASTS_PLAYLIST_ID) && (this.playLists.get(LIKED_PODCASTS_PLAYLIST_ID)?.length ?? 0) > 0) {
      return Promise.resolve(this.playLists.get(LIKED_PODCASTS_PLAYLIST_ID) ?? []);
    }

    await this.refreshLikedTracks();

    return this.playLists.get(LIKED_PODCASTS_PLAYLIST_ID) ?? [];
  }

  private likesPromise: ReturnType<typeof this.api.getLikedTracks> | null = null;
  async refreshLikedTracks(): Promise<void> {
    if (this.likesPromise) {
      await this.likesPromise;
      return;
    }

    const { result } = await (this.likesPromise = this.api.getLikedTracks());
    const podcasts = result.filter(item => item.type === 'podcast-episode');
    const tracks = result.filter(item => item.type === 'music');
    this.savePlaylist(LIKED_PODCASTS_PLAYLIST_ID, podcasts);
    this.savePlaylist(LIKED_TRACKS_PLAYLIST_ID, tracks);

    this.likesPromise = null;
  }

  play(track?: { itemId: string; playListId: string }) {
    if (track) {
      const tracks = this.playLists.get(track.playListId);
      if (tracks) {
        const index = tracks.findIndex((item) => item.id === track?.itemId);
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
      this.api.likeAction(track, this.isLikedTrack(track.id) ? 'remove-like' : 'like');
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

  next() {
    this.internalPlay((this.currentTrackIndex ?? 0) + 1);
  }

  prev() {
    this.internalPlay((this.currentTrackIndex ?? 0) - 1);
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
    const url = await this._api.getTrackUrl(track.id);
    open(url);
  }

  /**
   *
   * @param index Song index of current playList
   */
  private async internalPlay(index: number) {
    if (!this.currentPlayListId) {
      return;
    }

    const playlist = this.playLists.get(this.currentPlayListId);

    if (playlist != null && index >= 0 && index <= playlist.length) {
      this.currentTrackIndex = index;
      const track = playlist?.[index];

      if (track) {
        const url = await this._api.getTrackUrl(track.id);
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

  private savePlaylist(playListId: string | number, tracks: Track[]) {
    this.playLists.set(playListId.toString(), tracks);
  }

  private removePlaylist(playListId: string) {
    this.playLists.delete(playListId);
  }

  private getTrack(playListId: string, index: number): Track | null {
    const tracks = this.playLists.get(playListId);

    if (tracks == null) {
      return null;
    }

    return tracks[index];
  }

  dispose() {
    this.player?.dispose();
  }
}
