import { Playlist, GeneratedPlaylistLandingBlock } from "yandex-music-api-client";

import { LandingBlock } from "./landing/block";
import { Album } from "./album/album";
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

export interface FeedResponse {
  canGetMoreEvents: boolean;
  days: any[];
  generatedPlaylists: GeneratedPlaylistLandingBlock[];
  headlines: any[];
  isWizardPassed: boolean;
  pumpkin: boolean;
  today: string;
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

export interface Track {
  albums: Album[];
  artists: Artist[];
  available: boolean;
  availableForPremiumUsers: boolean;
  availableFullWithoutPermission: boolean;
  /**
   * Cover uri template. To get cover uri with specified size use "getCoverUri" method
   */
  coverUri: string;
  durationMs: number;
  fileSize: number;
  id: string;
  lyricsAvailable: boolean;
  major: {
    id: number;
    name: string;
  };
  normalization: {
    gain: number;
    peak: number;
  };
  ogImage: string;
  previewDurationMs: number;
  realId: string;
  rememberPosition: boolean;
  storageDir: string;
  title: string;
  type: string; //music
}

export interface Cover {
  custom: boolean;
  /**
   * Exists when @field type = "pic"
   */
  dir?: string;
  type: "pic" | "mosaic";
  /**
   * Exists when @field type = "mosaic"
   */
  itemsUri?: string[];
  /**
   * Exists when @field type = "pic"
   */
  uri?: string;
  version?: string;
}

export interface Owner {
  login: string;
  name: string;
  sex: string;
  uid: number;
  verified: boolean;
}

export interface TrackDownloadInfo {
  bitrateInKbps: number;
  codec: 'mp3' | 'aac';
  gain: boolean;
  preview: boolean;
  downloadInfoUrl: string;
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

export interface SearchResponse extends YandexMusicResponse<SearchResult> { }

export interface SearchResult {
  misspellCorrected: boolean;
  nocorrect: boolean;
  searchRequestId: string;
  text: string;
  /**
   * The best result
   */
  best: any;
  videos: any;
  tracks: SearchTypeResult<Track>;
  playlists: SearchTypeResult<Playlist>;
  albums: SearchTypeResult<Album>;
  artists: SearchTypeResult<Artist>;
  podcasts: SearchTypeResult<any>;
}


/**
 * Represents search result for tracks, playlists, albums, ...
 */
export interface SearchTypeResult<T> {
  /**
   * Results count
   */
  total: number;
  /**
   * Maximum results count on the page
   */
  perPage: number;
  /**
   * Block position
   */
  order: number;
  /**
   * Search results
   */
  results: T[];
}

export interface ArtistPopularTracksResponce extends YandexMusicResponse<{
  artist: Artist;
  tracks: string[];
}> { }
