import { Playlist, Album, Track, LandingBlock } from "yandex-music-client";
import { getToken } from 'yandex-music-client/token';
import { YandexMusicClient } from 'yandex-music-client/YandexMusicClient';

import { ALL_LANDING_BLOCKS } from "./interfaces";
import { IYandexMusicAuthData } from "../settings";
import { createAlbumTrackId, createTrackURL, getDownloadInfo, getPlayListsIds, Headers } from "./apiUtils";

export interface Config {
  user: {
    TOKEN?: string;
    UID?: number;
  };
}

export class YandexMusicApi {
  private newApi: YandexMusicClient | undefined;
  private headers: Headers | undefined;

  get isAutorized(): boolean {
    return !!this.newApi;
  }

  _config: Config = {
    user: {
      TOKEN: undefined,
      UID: undefined,
    },
  };

  constructor() { }

  private _getAuthHeader() {
    return this.isAutorized ? { Authorization: "OAuth " + this._config.user.TOKEN } : undefined;
  }

  /**
   * Applies provided configuration
   * 
   * @param config credentials information
   */
  setup(config?: IYandexMusicAuthData) {
    this._config.user.TOKEN = config?.token;
    this._config.user.UID = config?.userId;

    if (config) {
      this.headers = {
        'Authorization': `OAuth ${config.token}`
      };
      this.newApi = new YandexMusicClient({
        BASE: "https://api.music.yandex.net:443",
        HEADERS: this.headers,
      });
    }
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
    return this.newApi!.playlists.getPlayLists(this._config!.user.UID!);
  }

  async likeAction(track: Track, action: 'like' | 'remove-like') {
    if (action === 'remove-like') {
      this.newApi!.tracks.removeLikedTracks(this._config.user!.UID!, {
        "track-ids": [createAlbumTrackId({
          id: track.id,
          albumId: track.albums[0].id,
        })]
      });
    } else {
      await this.newApi!.tracks.likeTracks(this._config.user!.UID!, {
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

  // async likeAction(objectType: 'track' | 'artist' | 'playlist' | 'album', ids: number | string | number[] | string[], remove = false): Promise<any> {
  //   const action = remove ? 'remove' : 'add-multiple';
  //   const result = await this.apiClient.post<GetTracksResponse>(`/users/${this._config.user.UID}/likes/${objectType}s/${action}`,
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
