import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  InitResponse,
  FeedResponse,
  PlayList,
  GeneratedPlayList,
  GetPlayListsOptions,
  Visibility,
  DownloadInfo,
  Track,
  LikedTracksResponse,
  TrackItem,
  GetTracksResponse,
  YandexMusicResponse,
} from "./interfaces";
import { createHash } from "crypto";
import { createTrackAlbumIds } from "./apiUtils";
const querystring = require("querystring");

export interface Config {
  ouath_code: {
    CLIENT_ID: string;
    CLIENT_SECRET: string;
  };
  oauth_token: {
    CLIENT_ID: string;
    CLIENT_SECRET: string;
  };
  fake_device: {
    DEVICE_ID: string;
    UUID: string;
    PACKAGE_NAME: string;
  };
  user: {
    USERNAME: string | null;
    PASSWORD: string | null;
    TOKEN: string | null;
    UID: number | null;
  };
}

export interface Response<T> {
  invocationInfo: {
    "exec-duration-millis": number;
    hostname: string;
    "req-id": number;
  };
  result: T;
}

export class YandexMusicApi {
  private apiClient: AxiosInstance;
  private authClient: AxiosInstance;
  private storageClient: AxiosInstance;

  _config: Config = {
    ouath_code: {
      CLIENT_ID: "0618394846eb4d9589a602f80ce013d6",
      CLIENT_SECRET: "c13b3de8d9f5492caf321467c3520358",
    },

    oauth_token: {
      CLIENT_ID: "23cabbbdc6cd418abb4b39c32c41195d",
      CLIENT_SECRET: "53bc75238f0c4d08a118e51fe9203300",
    },

    fake_device: {
      DEVICE_ID: "377c5ae26b09fccd72deae0a95425559",
      UUID: "3cfccdaf75dcf98b917a54afe50447ba",
      PACKAGE_NAME: "ru.yandex.music",
    },

    user: {
      USERNAME: null,
      PASSWORD: null,
      TOKEN: null,
      UID: null,
    },
  };

  constructor() {
    this.apiClient = axios.create({
      baseURL: `https://api.music.yandex.net:443`,
    });

    this.authClient = axios.create({
      baseURL: `https://oauth.mobile.yandex.net:443`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    this.storageClient = axios.create({
      baseURL: `https://storage.mds.yandex.net`,
    });
  }

  private _getAuthHeader() {
    return { Authorization: "OAuth " + this._config.user.TOKEN };
  }

  init(config: { username: string; password: string; access_token?: string; uid?: number }): Promise<InitResponse> {
    // Skip authorization if access_token and uid are present
    if (config.access_token && config.uid) {
      this._config.user.TOKEN = config.access_token;
      this._config.user.UID = config.uid;

      return Promise.resolve({
        access_token: config.access_token,
        uid: config.uid,
      });
    }

    this._config.user.USERNAME = config.username;
    this._config.user.PASSWORD = config.password;

    return this.authClient
      .post(
        `1/token`,
        querystring.stringify({
          grant_type: "password",
          username: this._config.user.USERNAME,
          password: this._config.user.PASSWORD,
          client_id: this._config.ouath_code.CLIENT_ID,
          client_secret: this._config.ouath_code.CLIENT_SECRET,
        })
      )
      .then((resp) => {
        return this.authClient
          .post(
            `1/token`,
            querystring.stringify({
              grant_type: "x-token",
              access_token: resp.data.access_token,
              client_id: this._config.oauth_token.CLIENT_ID,
              client_secret: this._config.oauth_token.CLIENT_SECRET,
            }),
            {
              params: {
                device_id: this._config.fake_device.DEVICE_ID,
                uuid: this._config.fake_device.UUID,
                package_name: this._config.fake_device.PACKAGE_NAME,
              },
            }
          )
          .then((resp) => {
            // Store user token and uid for other requests
            this._config.user.TOKEN = resp.data.access_token;
            this._config.user.UID = resp.data.uid;

            return resp.data;
          });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  /**
   * GET: /account/status
   * Get account status for curren user
   * @returns {Promise}
   */
  getAccountStatus() {
    return this.apiClient.get("/account/status", {
      headers: this._getAuthHeader(),
    });
  }

  /**
   * GET: /feed
   * Get the user's feed
   * @returns {Promise}
   */
  getFeed(): Promise<AxiosResponse<Response<FeedResponse>>> {
    return this.apiClient.get(`/feed`, {
      headers: this._getAuthHeader(),
    });
  }

  /**
   * GET: /genres
   * Get a list of music genres
   * @returns {Promise}
   */
  getGenres(): Promise<AxiosResponse<any>> {
    return this.apiClient.get(`/genres`, {
      headers: this._getAuthHeader(),
    });
  }

  /**
     * GET: /search
     * Search artists, tracks, albums.
     * @param   {String} query     The search query.
     * @param   {Object} [options] Options: type {String} (artist|album|track|all),
                                            page {Int},
                                            nococrrect {Boolean}
     * @returns {Promise}
     */
  search(query, options) {
    const opts = options || {};

    return this.apiClient.get(`/search`, {
      params: {
        type: opts["type"] || "all",
        text: query,
        page: opts["page"] || 0,
        nococrrect: opts["nococrrect"] || false,
      },
      headers: this._getAuthHeader(),
    });
  }

  /**
   * GET: /users/[user_id]/playlists/list
   * Get a user's playlists.
   * @param   {String} userId The user ID, if null then equal to current user id
   * @returns {Promise}
   */
  getUserPlaylists(userId?: string): Promise<AxiosResponse<YandexMusicResponse<PlayList[]>>> {
    return this.apiClient.get<YandexMusicResponse<PlayList[]>>(`/users/${userId || this._config.user.UID}/playlists/list`, {
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
  getPlaylist(userId: number | string | undefined, playlistKind: string | number): Promise<AxiosResponse<Response<GeneratedPlayList>>> {
    return this.apiClient.get(`/users/${userId || this._config.user.UID}/playlists/${playlistKind}`, {
      headers: this._getAuthHeader(),
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
  getPlaylists(userId: string | undefined, playlists: string[], options: GetPlayListsOptions): Promise<AxiosResponse<any[]>> {
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
  createPlaylist(name: string, options: { visibility: Visibility }) {
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

  async getLikedTracksIds(): Promise<LikedTracksResponse> {
    try {
      const results = await this.apiClient.get<LikedTracksResponse>(`/users/${this._config.user.UID}/likes/tracks`);

      return results.data;
    } catch (error) {
      return error;
    }
  }

  async getLikedTracks(): Promise<GetTracksResponse> {
    const result = await this.getLikedTracksIds();
    const ids = createTrackAlbumIds(result.result.library.tracks);
    const tracks = await this.getTracks(ids);

    return tracks;
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
      return error;
    }
  }

  async getTrackUrl(storageDir: string): Promise<string> {
    try {
      const downloadInfo = await this.getDownloadInfo(storageDir);
      const url = await this.createTrackURL(downloadInfo);
      return url;
    } catch (error) {
      return error;
    }
  }

  async getDownloadInfo(storageDir: string): Promise<DownloadInfo> {
    try {
      const response = await this.storageClient.get<DownloadInfo>(`/download-info/${storageDir}/2?format=json`);

      return response.data;
    } catch (error) {
      return error;
    }
  }

  async createTrackURL(info: DownloadInfo) {
    const trackUrl = `XGRlBW9FXlekgbPrRHuSiA${info.path.substr(1)}${info.s}`;

    const hashedUrl = createHash("md5")
      .update(trackUrl)
      .digest("hex");

    const link = `https://${info.host}/get-mp3/${hashedUrl}/${info.ts}${info.path}`;

    return link;
  }
}
