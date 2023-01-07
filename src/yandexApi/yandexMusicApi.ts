import axios, { AxiosResponse } from "axios";
import { Playlist, VisibilityEnum, GeneratedPlaylist, TrackDownloadInfo, Album } from "yandex-music-api-client";
import { createHash } from "crypto";

import {
  InitResponse,
  GetPlayListsOptions,
  DownloadInfo,
  LikedTracksResponse,
  GetTracksResponse,
  YandexMusicResponse,
} from "./interfaces";
import { createTrackAlbumIds } from "./apiUtils";
import { IYandexMusicAuthData } from "../settings";
const querystring = require("querystring");

export interface Config {
  ouath_code: {
    CLIENT_ID: string;
    CLIENT_SECRET: string;
  };
  fake_device: {
    DEVICE_ID: string;
    UUID: string;
    PACKAGE_NAME: string;
  };
  user: {
    TOKEN?: string;
    UID?: number;
  };
}

export interface ICredentials {
  username: string;
  password: string;
}

export interface Response<T> {
  invocationInfo: {
    "exec-duration-millis": number;
    hostname: string;
    "req-id": number;
  };
  result: T;
}

// Some API will not work without this header if you are not logged in
// It is how Win App works
const winAppHeader = {
  "X-Yandex-Music-Device": "os=unknown; os_version=unknown; manufacturer=unknown; model=unknown; clid=; device_id=unknown; uuid=unknown",
};

export class YandexMusicApi {
  private apiClient = axios.create({
    baseURL: `https://api.music.yandex.net:443`,
  });
  private authClient = axios.create({
    baseURL: `https://oauth.yandex.ru`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  get isAutorized(): boolean {
    return this._config.user.TOKEN != null && this._config.user.UID != null;
  }

  _config: Config = {
    ouath_code: {
      CLIENT_ID: "23cabbbdc6cd418abb4b39c32c41195d",
      CLIENT_SECRET: "53bc75238f0c4d08a118e51fe9203300",
    },

    fake_device: {
      DEVICE_ID: "377c5ae26b09fccd72deae0a95425559",
      UUID: "3cfccdaf75dcf98b917a54afe50447ba",
      PACKAGE_NAME: "ru.yandex.music",
    },

    user: {
      TOKEN: undefined,
      UID: undefined,
    },
  };

  constructor() { }

  private _getAuthHeader() {
    return this.isAutorized ? { Authorization: "OAuth " + this._config.user.TOKEN } : undefined;
  }

  private getHeaders(additionalHeaders: { [key: string]: any }): { [key: string]: any } {
    return {
      ...this._getAuthHeader(),
      ...additionalHeaders,
    };
  }

  /**
   * Applies provided configuration
   * 
   * @param config credentials information
   */
  setup(config?: IYandexMusicAuthData) {
    this._config.user.TOKEN = config?.token;
    this._config.user.UID = config?.userId;
  }

  /**
   * Requests token
   * 
   * @param credentials credentials information
   */
  authenticate(credentials: ICredentials): Promise<AxiosResponse<InitResponse>> {
    return this.authClient.post(
      `token`,
      querystring.stringify({
        grant_type: "password",
        client_id: this._config.ouath_code.CLIENT_ID,
        client_secret: this._config.ouath_code.CLIENT_SECRET,
        username: credentials.username,
        password: credentials.password,
      })
    );
  }

  /**
   * Returns album by id.
   * Podcasts represent album as well, so you can use this method to get podcast as well.
   * @param albumId Album id
   * @param withTracks whether to include tracks in the response
   */
  getAlbum(albumId: number, withTracks: boolean): Promise<AxiosResponse<YandexMusicResponse<Album>>> {
    return this.apiClient.get(`/albums/${albumId}/${withTracks ? `with-tracks` : ``}`, {
      headers: this._getAuthHeader(),
    });
  }

  // getAlbums(ids: number[]): Promise<AxiosResponse<YandexMusicResponse<Album[]>>> {
  //   return this.apiClient.post(
  //     `/albums`,
  //     querystring.stringify({
  //       "album-ids": ids.join(","),
  //     }),
  //     {
  //       headers: {
  //         "Content-Type": "application/x-www-form-urlencoded",
  //       },
  //     }
  //   );
  // }

  /**
   * GET: /users/[user_id]/playlists/list
   * Get a user's playlists.
   * @param   {String} userId The user ID, if null then equal to current user id
   * @returns {Promise}
   */
  getAllUserPlaylists(userId?: string): Promise<AxiosResponse<YandexMusicResponse<Playlist[]>>> {
    return this.apiClient.get<YandexMusicResponse<Playlist[]>>(`/users/${userId || this._config.user.UID}/playlists/list`, {
      headers: this._getAuthHeader(),
    });
  }

  /**
   * GET: /users/[user_id]/playlists/[playlist_kind]
   * Get a playlist without tracks
   * @param   {String} userId       The user ID, if null then equal to current user id
   * @param   {String} playlistKind The playlist ID.
   * @returns {Promise}
   */
  getPlaylist(userId: number | string | undefined, playlistKind: string | number): Promise<AxiosResponse<Response<GeneratedPlaylist>>> {
    return this.apiClient.get(`/users/${userId || this._config.user.UID}/playlists/${playlistKind}`, {
      headers: this.isAutorized ? this._getAuthHeader() : winAppHeader,
    });
  }

  /**
   * GET: /users/[user_id]/playlists
   * Get an array of playlists with tracks
   * @param   {String} userId       The user ID, if null then equal to current user id
   * @param   {String} playlistKind The playlist ID.
   * @param   {Object} [options]    Options: mixed {Boolean}, rich-tracks {Boolean}
   * @returns {Promise}
   */
  getUserPlaylists(userId: string | undefined, playlists: string[], options: GetPlayListsOptions): Promise<AxiosResponse<any[]>> {
    const opts = options || {};

    return this.apiClient.get(`/users/${userId || this._config.user.UID}/playlists`, {
      headers: this._getAuthHeader(),
      params: {
        kinds: playlists.join(),
        mixed: opts["mixed"] || false,
        "rich-tracks": opts["rich-tracks"] || false,
      },
    });
  }

  /**
   * POST: /users/[user_id]/playlists/create
   * Create a new playlist
   * @param   {String} name      The name of the playlist
   * @param   {Object} [options] Options: visibility {String} (public|private)
   * @returns {Promise}
   */
  createPlaylist(name: string, options: { visibility: VisibilityEnum }) {
    const opts = options || {};

    return this.apiClient.post(`/users/${this._config.user.UID}/playlists/create`, {
      data: {
        title: name,
        visibility: opts.visibility || "private",
      },
    });
  }

  /**
   * POST: /users/[user_id]/playlists/[playlist_kind]/delete
   * Remove a playlist
   * @param   {String} userId       The user ID, if null then equal to current user id
   * @param   {String} playlistKind The playlist ID.
   * @returns {Promise}
   */
  removePlaylist(playlistKind: string) {
    return this.apiClient.post(
      `/users/${this._config.user.UID}/playlists/${playlistKind}/delete`,
      {},
      {
        headers: this._getAuthHeader(),
      }
    );
  }

  /**
   * POST: /users/[user_id]/playlists/[playlist_kind]/name
   * Change playlist name
   * @param   {String} playlistKind The playlist ID.
   * @param   {String} name         New playlist name.
   * @returns {Promise}
   */
  renamePlaylist(playlistKind: string, name: string) {
    return this.apiClient.post(
      `/users/${this._config.user.UID}/playlists/${playlistKind}/name`,
      {
        value: name,
      },
      {
        headers: this._getAuthHeader(),
      }
    );
  }

  /**
     * POST: /users/[user_id]/playlists/[playlist_kind]/change-relative
     * Add tracks to the playlist
     * @param   {String}   playlistKind The playlist's ID.
     * @param   {Object[]} tracks       An array of objects containing a track info:
                                        track id and album id for the track.
                                        Example: [{id:'20599729', albumId:'2347459'}]
     * @param   {String}   revision     Operation id for that request
     * @param   {Object}   [options]    Options: at {Int}
     * @returns {Promise}
     */
  addTracksToPlaylist(playlistKind: string, tracks: Array<{ id: string; albumId: string }>, revision: string, options: { at: number }) {
    const opts = options || {};

    return this.apiClient.post(
      `/users/${this._config.user.UID}/playlists/${playlistKind}/change-relative`,
      {
        diff: JSON.stringify([
          {
            op: "insert",
            at: opts.at || 0,
            tracks: tracks,
          },
        ]),
        revision: revision,
      },
      {
        headers: this._getAuthHeader(),
      }
    );
  }

  /**
     * POST: /users/[user_id]/playlists/[playlist_kind]/change-relative
     * Remove tracks from the playlist
     * @param   {String}   playlistKind The playlist's ID.
     * @param   {Object[]} tracks       An array of objects containing a track info:
                                        track id and album id for the track.
                                        Example: [{id:'20599729', albumId:'2347459'}]
     * @param   {String}   revision     Operation id for that request
     * @param   {Object}   [options]    Options: from {Int},
                                                 to {Int}
     * @returns {Promise}
     */

  removeTracksFromPlaylist(
    playlistKind: string,
    tracks: Array<{ id: string; albumId: string }>,
    revision: string,
    options: { from: number; to: number }
  ) {
    const opts = options || {};

    return this.apiClient.post(
      `/users/${this._config.user.UID}/playlists/${playlistKind}/change-relative`,
      {
        diff: JSON.stringify([
          {
            op: "delete",
            from: opts["from"] || 0,
            to: opts["to"] || tracks.length,
            tracks: tracks,
          },
        ]),
        revision: revision,
      },
      {
        headers: this._getAuthHeader(),
      }
    );
  }

  async likeAction(objectType: 'track' | 'artist' | 'playlist' | 'album', ids: number | string | number[] | string[], remove = false): Promise<any> {
    const action = remove ? 'remove' : 'add-multiple';
    const result = await this.apiClient.post<GetTracksResponse>(`/users/${this._config.user.UID}/likes/${objectType}s/${action}`,
      querystring.stringify({
        [`${objectType}-ids`]: Array.isArray(ids) ? ids.join(",") : ids,
      }),
      {
        headers: this.getHeaders({
          "Content-Type": "application/x-www-form-urlencoded",
        }),
      }
    );

    return result;
  }

  async getTracks(trackIds: string[], withPositions?: boolean): Promise<GetTracksResponse> {
    try {
      const tracks = await this.apiClient.post<GetTracksResponse>(
        `/tracks/`,
        querystring.stringify({
          "track-ids": trackIds.join(","),
          "with-positions": withPositions || false,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return tracks.data;
    } catch (error) {
      console.error(error);
      return {} as any;
    }
  }
}
