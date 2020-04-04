import { LandingBlock } from "./landing/block";
import { GeneratedPlayListItem } from "./feed/generatedPlayListItem";

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
  generatedPlaylists: GeneratedPlayListItem[];
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


export type Visibility = "public" | "private";

export interface TrackItem {
  id: number;
  recent: boolean;
  timestamp: string;
  /**
   * Null when tracks are not riched
   */
  track?: Track;
}

export interface Artist {
  composer: boolean;
  cover: Cover;
  decomposed?: any[];
  genres: any[];
  id: number;
  name: string;
  various: boolean;
}

export interface Track {
  albums: any[];
  artists: Artist[];
  available: boolean;
  availableForPremiumUsers: boolean;
  availableFullWithoutPermission: boolean;
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

export interface DownloadInfo {
  s: string;
  ts: string;
  path: string;
  host: string;
}

export interface InvocationInfo {
  hostname: string;
  "req-id": string;
  "exec-duration-mills": string;
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

export type LandingBlockType = 'personalplaylists' | 'promotions' | 'new-releases' | 'new-playlists' | 'mixes' |
  'chart' | 'artists' | 'albums' | 'playlists' | 'play_contexts' | 'podcasts';

export const ALL_LANDING_BLOCKS: LandingBlockType[] = ['personalplaylists', 'promotions', 'new-releases', 'new-playlists', 'mixes',
  'chart', 'artists', 'albums', 'playlists', 'play_contexts', 'podcasts'];