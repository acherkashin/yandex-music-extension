import { Playlist, Album, Track, LandingBlock, ChartItem, LandingBlockType } from "yandex-music-client";
import { getToken } from 'yandex-music-client/token';
import { getTrackUrl } from 'yandex-music-client/trackUrl';
import { YandexMusicClient } from 'yandex-music-client/YandexMusicClient';

import { IYandexMusicAuthData } from "../settings";
import { createAlbumTrackId, createTrackAlbumIds, exposeTracks, getPlayListsIds } from "./apiUtils";

export class YandexMusicApi {
  private client: YandexMusicClient | undefined;
  private userId: number | undefined;

  get isAuthorized(): boolean {
    return !!this.client;
  }

  constructor() { }

  /**
   * Applies provided configuration
   * 
   * @param config credentials information
   */
  setup(config?: IYandexMusicAuthData) {
    if (!config) {
      this.client = undefined;
      return;
    }

    this.userId = config.userId;

    this.client = new YandexMusicClient({
      BASE: "https://api.music.yandex.net:443",
      HEADERS: {
        'Authorization': `OAuth ${config.token}`
      },
    });
  }

  getToken = getToken;

  async getTrackUrl(trackId: string) {
    return getTrackUrl(this.client!, trackId);
  }

  async getNewReleases(): Promise<Album[]> {
    const resp = await this.client!.landing.getNewReleases();
    const albumIds = resp.result.newReleases.join(",");
    const albums = await this.client!.albums.getByIds({ 'album-ids': albumIds });

    return albums.result;
  }

  async getNewPlayLists(): Promise<Playlist[]> {
    const resp = await this.client!.landing.getNewPlaylists();
    const ids = getPlayListsIds(resp.result.newPlaylists);
    const playListsResp = await this.client!.playlists.getByIds({ playlistIds: ids });

    return playListsResp.result;
  }

  async getActualPodcasts(): Promise<Album[]> {
    const resp = await this.client!.landing.getNewPodcasts();
    const albumIds = resp.result.podcasts.join(",");
    //TODO: need to limit amount of podcasts we receive, 100 at maximum. Currently we load 6000+ podcasts at time.
    const podcasts = await this.client!.albums.getByIds({ 'album-ids': albumIds });

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

  async getLikedTracks() {
    const result = await this.client!.tracks.getLikedTracksIds(this.userId!);
    const ids = createTrackAlbumIds(result.result.library.tracks);
    const tracks = await this.client!.tracks.getTracks({ "track-ids": ids });

    return tracks;
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