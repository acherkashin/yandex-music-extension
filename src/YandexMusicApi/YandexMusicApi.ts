import axios from "axios";
import { URLSearchParams } from "url";
import { Playlist, Album, Track, LandingBlock, ChartItem, LandingBlockType } from "yandex-music-client";
import { getToken } from 'yandex-music-client/token';
import { getTrackUrl } from 'yandex-music-client/trackUrl';
import { YandexMusicClient } from 'yandex-music-client/YandexMusicClient';

import { IYandexMusicAuthData } from "../settings";
import { createAlbumTrackId, createTrackAlbumIds, exposeTracks, getPlayListsIds } from "./ApiUtils";

export class YandexMusicApi {
  private axiosClient = axios.create({
    baseURL: `https://api.music.yandex.net:443`,
  });
  private client = new YandexMusicClient({
    BASE: "https://api.music.yandex.net:443",
    HEADERS: {
      'Accept-Language': 'ru'
    },
  });
  private userId: number | undefined;
  private token: string | undefined;

  get isAuthorized(): boolean {
    return !!this.token;
  }

  constructor() { }

  /**
   * Applies provided configuration
   * 
   * @param config credentials information
   */
  setup(config?: IYandexMusicAuthData) {
    if (!config) {
      this.userId = undefined;
      this.token = undefined;
      return;
    }

    this.userId = config.userId;
    this.token = config.token;

    this.client = new YandexMusicClient({
      BASE: "https://api.music.yandex.net:443",
      HEADERS: {
        'Authorization': `OAuth ${config.token}`,
        'Accept-Language': 'ru'
      },
    });
  }

  async setupByToken(token: string) {
    if (!token) {
      this.userId = undefined;
      this.token = undefined;
      return;
    }

    this.token = token;

    this.client = new YandexMusicClient({
      BASE: "https://api.music.yandex.net:443",
      HEADERS: {
        'Authorization': `OAuth ${token}`,
        'Accept-Language': 'ru'
      },
    });

    const status = await this.client.account.getAccountStatus();
    this.userId = status.result.account?.uid;

    return status;
  }

  getToken = getToken;

  async getTrackUrl(trackId: string) {
    return getTrackUrl(this.client!, trackId);
  }

  async getNewReleases(): Promise<Album[]> {
    const resp = await this.client!.landing.getNewReleases();
    const albumIds = resp.result.newReleases.join(",");
    const albums = await this.client!.albums.getAlbumsByIds({ 'album-ids': albumIds });

    return albums.result;
  }

  async getNewPlayLists(): Promise<Playlist[]> {
    const resp = await this.client!.landing.getNewPlaylists();
    const ids = getPlayListsIds(resp.result.newPlaylists);
    const playListsResp = await this.client!.playlists.getPlaylistsByIds({ playlistIds: ids });

    return playListsResp.result;
  }

  async getActualPodcasts(): Promise<Album[]> {
    const resp = await this.client!.landing.getNewPodcasts();
    const albumIds = resp.result.podcasts.join(",");
    //TODO: need to limit amount of podcasts we receive, 100 at maximum. Currently we load 6000+ podcasts at time.
    const podcasts = await this.client!.albums.getAlbumsByIds({ 'album-ids': albumIds });

    return podcasts.result;
  }

  async getUserPlaylists() {
    return this.client!.playlists.getPlayLists(this.userId!);
  }

  async likeAction(track: Track, action: 'like' | 'remove-like') {
    if (action === 'remove-like') {
      this.client!.tracks.removeLikedTracks(this.userId!, {
        "track-ids": [createAlbumTrackId({
          id: track.id,
          albumId: track.albums[0].id,
        })]
      });
    } else {
      await this.client!.tracks.likeTracks(this.userId!, {
        "track-ids": [createAlbumTrackId({
          id: track.id,
          albumId: track.albums[0].id,
        })]
      });
    }
  }

  async getLandingBlocks(): Promise<LandingBlock[]> {
    const allBlocks = ALL_LANDING_BLOCKS.join(",");
    const resp = await this.client!.landing.getLandingBlocks(allBlocks);
    return resp.result.blocks ?? [];
  }

  async getLikedTracks(): Promise<Track[]> {
    const likedTracksResp = await this.client!.tracks.getLikedTracksIds(this.userId!);
    const ids = createTrackAlbumIds(likedTracksResp.result.library.tracks);
    const tracksResp = await this.client!.tracks.getTracks({ "track-ids": ids });

    return tracksResp.result;
  }

  async getArtistTracks(artistId: string) {
    const { tracks: trackIds } = (await this.client!.artists.getPopularTracks(artistId)).result;
    const tracks = (await this.client!.tracks.getTracks({ "track-ids": trackIds })).result;

    return tracks;
  }

  async getAlbumTracks(albumId: number) {
    const resp = await this.client!.albums.getAlbumsWithTracks(albumId);
    const tracks = (resp.result.volumes || []).reduce((a, b) => a.concat(b));

    return tracks;
  }

  async getChartTracks() {
    const resp = await this.client!.landing.getChart("russia");
    const chartItems = resp.result.chart.tracks as ChartItem[];
    const tracks = exposeTracks(chartItems);

    return { tracks, chartItems };
  }

  async search(text: string) {
    return this.client!.search.search(text, 0, 'all');
  }

  async getPlaylistTracks(userId: number, playListId: number) {
    const resp = await this.client!.playlists.getPlaylistById(userId, playListId);
    const tracks = resp.result.tracks;

    return exposeTracks(tracks);
  }

  async getRadioTracks(radioId: string) {
    //TODO: add typings for the result
    return ((await this.client!.rotor.getStationTracks(radioId, true)).result);
  }

  //TODO: in generated API form-data is used and it breaks api for some reason, so currently self-written methods are used to add/remove track from playlist
  // async addTrackToPlaylist(kingPlaylist: number, revision: number, track: Track) {
  //   // const payload = `{\"op\":\"insert\",\"at\":0,\"tracks\":[{\"id\":\"${track.id}\",\"albumId\":${track.albums[0].id}}]}`;
  //   // const payload = JSON.stringify({ "op": "insert", "at": 0, "tracks": [{ "id": track.id, "albumId": track.albums[0].id }] });
  //   const payload = { "op": "insert", "at": 0, "tracks": [{ "id": track.id, "albumId": track.albums[0].id }] } as any;
  //   return this.client!.playlists.changePlaylistTracks(this.userId!, kingPlaylist, {
  //     diff: payload,
  //     revision: revision.toString(),
  //   });
  // }

  addTrackToPlaylist(playlist: Playlist, track: Track) {
    const params = new URLSearchParams({
      'diff': JSON.stringify([
        {
          op: "insert",
          at: 0,
          tracks: [{
            id: track.id,
            albumId: track.albums[0].id
          }],
        },
      ]),
      'revision': playlist.revision.toString()
    });
    return this.axiosClient.post(
      `/users/${this.userId}/playlists/${playlist.kind}/change-relative`,
      params,
      {
        headers: {
          'Authorization': `OAuth ${this.token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
  }

  removeTracksFromPlaylist(playlist: Playlist, track: Track, index: number) {
    const params = new URLSearchParams({
      'diff': JSON.stringify([
        {
          op: "delete",
          from: index,
          to: index + 1,
          tracks: [{
            id: track.id,
            // It seems it is not necessary to pass albumId
            // albumId: track.albums[0].id,
          }],
        },
      ]),
      'revision': playlist.revision.toString()
    });
    return this.axiosClient.post(
      `/users/${this.userId}/playlists/${playlist.kind}/change-relative`,
      params,
      {
        headers: {
          'Authorization': `OAuth ${this.token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
  }

  renamePlaylist(playListKind: number, newName: string) {
    return this.client!.playlists.renamePlaylist(this.userId!, playListKind, {
      value: newName
    });
  }

  deletePlaylist(playListKind: number) {
    return this.client!.playlists.deletePlaylist(this.userId!, playListKind);
  }

  createPlaylist(name: string) {
    return this.client!.playlists.createPlaylist(this.userId!, {
      title: name,
      visibility: 'private'
    });
  }

  skipTrack(track: Track, radioId: string, batchId: string, totalPlayedSeconds: number) {
    const now = new Date().toISOString();

    return this.client!.rotor.sendStationFeedback(radioId, {
      type: 'skip',
      timestamp: now,
      trackId: track.id,
      totalPlayedSeconds,
    }, batchId);
  }

  startRadio(radioId: string) {
    return this.client!.rotor.sendStationFeedback(radioId, {
      type: "radioStarted",
      timestamp: new Date().toISOString(),
      from: "vscode-extension"
    });
  }

  async startPlayAudio(playId: string, track: Track, radioId?: string, batchId?: string) {
    const now = new Date().toISOString();

    await this.client!.tracks.playAudio({
      "play-id": playId,
      from: "vscode-extension",
      'track-id': track.id,
      'client-now': now,
      'album-id': track.albums[0].id.toString(),
      'from-cache': false,
      "track-length-seconds": track.durationMs / 1000,
      "end-position-seconds": 0,
      "total-played-seconds": 0,
      timestamp: now,
      uid: this.userId
    });

    if (radioId) {
      await this.client!.rotor.sendStationFeedback(radioId, {
        type: 'trackStarted',
        timestamp: now,
        trackId: track.id,
      }, batchId);
    }
  }

  async finishPlayAudio(playId: string, track: Track, radioId?: string, batchId?: string) {
    const now = new Date().toISOString();
    const playedSeconds = track.durationMs / 1000;

    await this.client!.tracks.playAudio({
      "play-id": playId,
      from: "vscode-extension",
      'track-id': track.id,
      'client-now': now,
      'album-id': track.albums[0].id.toString(),
      'from-cache': false,
      "track-length-seconds": playedSeconds,
      "end-position-seconds": playedSeconds,
      "total-played-seconds": playedSeconds,
      timestamp: now,
      uid: this.userId
    });

    if (radioId) {
      await this.client!.rotor.sendStationFeedback(radioId, {
        type: 'trackFinished',
        timestamp: now,
        trackId: track.id,
        totalPlayedSeconds: playedSeconds,
      }, batchId);
    }
  }
}

export const ALL_LANDING_BLOCKS: LandingBlockType[] = [
  "personalplaylists",
  "promotions",
  "new-releases",
  "new-playlists",
  "mixes",
  "chart",
  "artists",
  "albums",
  "playlists",
  "play_contexts",
  "podcasts",
];