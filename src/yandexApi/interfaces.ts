import { Cover, Track } from "yandex-music-api-client";

import { LandingBlock } from "./landing/block";
import { InvocationInfo, LandingBlockType } from "yandex-music-api-client";

export interface GetPlayListsOptions {
  mixed?: boolean;
  "rich-tracks"?: boolean;
}

export interface InitResponse {
  access_token: string;
  expires_in?: number;
  token_type?: string;
  uid: number;
}


export interface LandingResult {
  pumpkin: boolean;
  contentId: string;
  blocks: LandingBlock[];
}

export interface LandingResponse extends YandexMusicResponse<LandingResult> { }

export interface Artist {
  composer: boolean;
  cover?: Cover;
  decomposed?: any[];
  genres: any[];
  // TODO: when use "yandexApi.search" id is "number", but when use "yandexApi.getPopularTracks" it is "string" 
  id: string | number;
  name: string;
  various: boolean;
  popularTracks?: Track[];
  /**
   * Имеются ли в продаже билеты на концерт
   */
  ticketsAvailable?: boolean;
  regions?: string[];
}

export interface DownloadInfo {
  s: string;
  ts: string;
  path: string;
  host: string;
}

export interface LikedTrack {
  id: string;
  albumId: string;
  timespan: string;
}

export interface LikedTracksResponse
  extends YandexMusicResponse<{
    library: {
      uid: number;
      revision: number;
      tracks: LikedTrack[];
    };
  }> { }

export interface GetTracksResponse extends YandexMusicResponse<Track[]> { }

export interface YandexMusicResponse<T> {
  invocationInfo: InvocationInfo;
  result: T;
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

export interface ISearchOptions {
  type?: 'artist' | 'album' | 'track' | 'podcast' | 'all';
  page?: number;
  nococrrect?: boolean;
}

export interface ArtistPopularTracksResponce extends YandexMusicResponse<{
  artist: Artist;
  tracks: string[];
}> { }
