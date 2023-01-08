import { Playlist, Album, Track, LandingBlock, ChartItem } from "yandex-music-client";
import { getToken } from 'yandex-music-client/token';
import { YandexMusicClient } from 'yandex-music-client/YandexMusicClient';

import { ALL_LANDING_BLOCKS } from "./interfaces";
import { IYandexMusicAuthData } from "../settings";
import { createAlbumTrackId, createTrackAlbumIds, createTrackURL, exposeTracks, getDownloadInfo, getPlayListsIds, Headers } from "./apiUtils";

export class YandexMusicApi {
  private newApi: YandexMusicClient | undefined;
  private headers: Headers | undefined;
  private token: string | undefined;
  private userId: number | undefined;

  get isAutorized(): boolean {
    return !!this.newApi;
  }

  constructor() { }

  private _getAuthHeader() {
    return this.isAutorized ? { Authorization: "OAuth " + this.token } : undefined;
  }

  /**
   * Applies provided configuration
   * 
   * @param config credentials information
   */
  setup(config?: IYandexMusicAuthData) {
    if (!config) {
      return;
    }

    this.token = config.token;
    this.userId = config.userId;

    this.headers = {
      'Authorization': `OAuth ${config.token}`
    };
    this.newApi = new YandexMusicClient({
      BASE: "https://api.music.yandex.net:443",
      HEADERS: this.headers,
    });
  }

  getToken = getToken;

  async getTrackUrl(trackId: string) {
    const trackInfo = await this.newApi!.tracks.getDownloadInfo(trackId);
    const downloadInfo = await getDownloadInfo(trackInfo.result, this._getAuthHeader());
    const url = createTrackURL(downloadInfo);

    return url;
  }

  async getNewReleases(): Promise<Album[]> {
    const resp = await this.newApi!.landing.getNewReleases();
    const albumIds = resp.result.newReleases.join(",");
    const albums = await this.newApi!.albums.getByIds({ 'album-ids': albumIds });

    return albums.result;
  }

  async getNewPlayLists(): Promise<Playlist[]> {
    const resp = await this.newApi!.landing.getNewPlaylists();
    const ids = getPlayListsIds(resp.result.newPlaylists);
    const playListsResp = await this.newApi!.playlists.getByIds({ playlistIds: ids });

    return playListsResp.result;
  }

  async getActualPodcasts(): Promise<Album[]> {
    const resp = await this.newApi!.landing.getNewPodcasts();
    const albumIds = resp.result.podcasts.join(",");
    //TODO: need to limit amount of podcasts we receive, 100 at maximum. Currently we load 6000+ podcasts at time.
    const podcasts = await this.newApi!.albums.getByIds({ 'album-ids': albumIds });

    return podcasts.result;
  }

  async getUserPlaylists() {
    return this.newApi!.playlists.getPlayLists(this.userId!);
  }

  async likeAction(track: Track, action: 'like' | 'remove-like') {
    if (action === 'remove-like') {
      this.newApi!.tracks.removeLikedTracks(this.userId!, {
        "track-ids": [createAlbumTrackId({
          id: track.id,
          albumId: track.albums[0].id,
        })]
      });
    } else {
      await this.newApi!.tracks.likeTracks(this.userId!, {
        "track-ids": [createAlbumTrackId({
          id: track.id,
          albumId: track.albums[0].id,
        })]
      });
    }
  }

  async getLandingBlocks(): Promise<LandingBlock[]> {
    const allBlocks = ALL_LANDING_BLOCKS.join(",");
    const resp = await this.newApi!.landing.getLandingBlocks(allBlocks);
    return resp.result.blocks ?? [];
  }

  async getLikedTracks() {
    const result = await this.newApi!.tracks.getLikedTracksIds(this.userId!);
    const ids = createTrackAlbumIds(result.result.library.tracks);
    const tracks = await this.newApi!.tracks.getTracks({ "track-ids": ids });

    return tracks;
  }

  async getArtistTracks(artistId: string) {
    const { tracks: trackIds } = (await this.newApi!.artists.getPopularTracks(artistId)).result;
    const tracks = (await this.newApi!.tracks.getTracks({ "track-ids": trackIds })).result;

    return tracks;
  }

  async getAlbumTracks(albumId: number) {
    const resp = await this.newApi!.albums.getAlbumsWithTracks(albumId);
    const tracks = (resp.result.volumes || []).reduce((a, b) => a.concat(b));

    return tracks;
  }

  async getChartTracks() {
    const resp = await this.newApi!.landing.getChart("russia");
    const chartItems = resp.result.chart.tracks as ChartItem[];
    const tracks = exposeTracks(chartItems);

    return { tracks, chartItems };
  }

  async search(text: string) {
    return this.newApi!.search.search(text, 0, 'all');
  }

  async getPlaylistTracks(userId: number, playListId: number) {
    const resp = await this.newApi!.playlists.getPlaylistById(userId, playListId);
    const tracks = resp.result.tracks;

    return exposeTracks(tracks);
  }
  // async likeAction(objectType: 'track' | 'artist' | 'playlist' | 'album', ids: number | string | number[] | string[], remove = false): Promise<any> {
  //   const action = remove ? 'remove' : 'add-multiple';
  //   const result = await this.apiClient.post<GetTracksResponse>(`/users/${this.userId}/likes/${objectType}s/${action}`,
  //     querystring.stringify({
  //       [`${objectType}-ids`]: Array.isArray(ids) ? ids.join(",") : ids,
  //     }),
  //     {
  //       headers: this.getHeaders({
  //         "Content-Type": "application/x-www-form-urlencoded",
  //       }),
  //     }
  //   );

  //   return result;
  // }
}
