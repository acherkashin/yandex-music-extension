import * as vscode from "vscode";
import { observable, autorun, computed } from "mobx";
import * as open from "open";
import { Playlist, TrackItem, GeneratedPlaylistLandingBlock, Search, Album, Track } from "yandex-music-api-client";
import { YandexMusicClient } from 'yandex-music-api-client/YandexMusicClient';

import { ALL_LANDING_BLOCKS, GetTracksResponse } from "./yandexApi/interfaces";
import { PlayerBarItem } from "./statusbar/playerBarItem";
import { RewindBarItem } from "./statusbar/rewindBarItem";
import { YandexMusicApi } from "./yandexApi/yandexMusicApi";
import { LandingBlock } from "./yandexApi/landing/block";
import { LandingBlockEntity } from "./yandexApi/landing/blockentity";
import { ElectronPlayer } from "./players/electronPlayer";
import { IYandexMusicAuthData } from "./settings";
import { ChartItem } from "./yandexApi/landing/chartitem";
import { getAlbums, getArtists, getCoverUri, createAlbumTrackId, getPlayListsIds, Headers, getDownloadInfo, createTrackURL, createTrackAlbumIds } from "./yandexApi/apiUtils";
import { defaultTraceSource } from "./logging/TraceSource";

export interface UserCredentials {
  username: string | undefined;
  password: string | undefined;
}

export const LIKED_TRACKS_PLAYLIST_ID = "LIKED_TRACKS_PLAYLIST_ID";
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
  private api: YandexMusicApi;
  private newApi: YandexMusicClient | undefined;
  private headers: Headers | undefined;
  private authData: IYandexMusicAuthData | undefined;

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

  constructor(api: YandexMusicApi) {
    this.api = api;
  }

  /**
   * Downloads (if necessary) and runs electron to play music
   */
  async initPlayer() {
    await this.player.init();
  }

  async init(authData?: IYandexMusicAuthData): Promise<void> {
    this.api.setup(authData);

    if (authData) {
      this.authData = authData;
      this.headers = {
        'Authorization': `OAuth ${authData.token}`
      };
      this.newApi = new YandexMusicClient({
        BASE: "https://api.music.yandex.net:443",
        HEADERS: this.headers,
      });
    }

    if (authData != null) {
      const allBlocks = ALL_LANDING_BLOCKS.join(",");
      await this.newApi!.landing.getLandingBlocks(allBlocks).then((resp) => {
        //TODO: remove any
        this.landingBlocks = resp?.result?.blocks as any ?? [];
      });

      // Need fetch liked tracks to show like/dislike button correctly
      await this.refreshLikedTracks();
    }

    vscode.commands.executeCommand("setContext", "yandexMusic.isAuthorized", this.isAuthorized());

    autorun(() => {
      vscode.commands.executeCommand("setContext", "yandexMusic.isPlaying", this.isPlaying);
    });

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

  async doSearch(searchText: string) {
    try {
      this.searchText = searchText;
      const resp = (await this.newApi!.search.search(this.searchText, 0, 'all'));
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
    const playLists = (block?.entities ?? []) as LandingBlockEntity<GeneratedPlaylistLandingBlock>[];

    return playLists.map(
      (item) => item.data.data
    );
  }

  async getUserPlaylists() {
    return this.newApi!.playlists.getPlayLists(this.authData!.userId);
  }

  getChart(): Promise<ChartItem[]> {
    return this.newApi!.landing.getChart("russia").then((resp) => {
      const chartItems = resp.result.chart.tracks as ChartItem[];
      const tracks = this.exposeTracks(chartItems);
      this.savePlaylist(CHART_TRACKS_PLAYLIST_ID, tracks);

      return chartItems;
    });
  }

  async getNewReleases(): Promise<Album[]> {
    const resp = await this.newApi!.landing.getNewReleases();
    const albumIds = resp.result.newReleases.join(",");
    const albums = await this.newApi!.albums.getByIds({ 'album-ids': albumIds });

    return albums.result;
  }

  async getNewPlayLists(): Promise<Playlist[]> {
    const resp = await this.newApi!.landing.getNewPlaylists();
    const ids = getPlayListsIds(resp.result.newPlaylists).join(",");
    const playListsResp = await this.newApi!.playlists.getByIds(ids);

    return playListsResp.result;
  }

  async getActualPodcasts(): Promise<Album[]> {
    const resp = await this.newApi!.landing.getNewPodcasts();
    const albumIds = resp.result.podcasts.join(",");
    // https://github.com/ferdikoomen/openapi-typescript-codegen/issues/1000
    //TODO: need to limit amount of podcasts we receive, 100 at maximum. Currently we load 6000+ podcasts at time.
    const podcasts = await this.newApi!.albums.getByIds({ 'album-ids': albumIds });

    return podcasts.result;
  }

  getAlbumTracks(albumId: number): Promise<Track[]> {
    return this.newApi!.albums.getAlbumsWithTracks(albumId).then((resp) => {
      const tracks = (resp.result.volumes || []).reduce((a, b) => a.concat(b));
      this.savePlaylist(albumId.toString(), tracks);

      return tracks;
    });
  }

  async getArtistTracks(artistId: string): Promise<Track[]> {
    const { artist, tracks: trackIds } = (await this.newApi!.artists.getPopularTracks(artistId)).result;
    const tracks = (await this.newApi!.tracks.getTracks({ "track-ids": trackIds })).result;
    this.savePlaylist(artist.id.toString(), tracks);
    return tracks;
  }

  getTracks(userId: number, playListId: number) {
    return this.newApi!.playlists.getPlaylistById(userId, playListId).then((result) => {
      this.savePlaylist(playListId.toString(), this.exposeTracks(result.result.tracks));

      return result;
    });
  }

  async getLikedTracks(): Promise<Track[]> {
    if (this.playLists.has(LIKED_TRACKS_PLAYLIST_ID) && (this.playLists.get(LIKED_TRACKS_PLAYLIST_ID)?.length ?? 0) > 0) {
      return Promise.resolve(this.playLists.get(LIKED_TRACKS_PLAYLIST_ID) ?? []);
    }

    return this.refreshLikedTracks();
  }

  async refreshLikedTracks(): Promise<Track[]> {
    const result = await this.newApi!.tracks.getLikedTracksIds(this.authData!.userId);
    const ids = createTrackAlbumIds(result.result.library.tracks);
    const tracks = await this.newApi!.tracks.getTracks({ "track-ids": ids });

    this.savePlaylist(LIKED_TRACKS_PLAYLIST_ID, tracks.result);

    return tracks.result;
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
        console.error(`playlist ${track?.itemId} is not found`);
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
      await this.api.likeAction('track', createAlbumTrackId({
        id: track.id,
        albumId: track.albums[0].id,
      }), this.isLikedTrack(track.id));
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

  async getTrackUrl(trackId: string) {
    const trackInfo = await this.newApi!.tracks.getDownloadInfo(trackId);
    const downloadInfo = await getDownloadInfo(trackInfo.result, this.headers);
    const url = createTrackURL(downloadInfo);

    return url;
  }

  async downloadTrack(track: Track) {
    const url = await this.getTrackUrl(track.id);
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
        const url = await this.getTrackUrl(track.id);
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

  private savePlaylist(playListId: string, tracks: Track[]) {
    this.playLists.set(playListId, tracks);
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
