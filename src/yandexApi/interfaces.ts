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

export interface PlayList {
  available: boolean;
  collective: boolean;
  cover: Cover;
  created: string;
  durationMs: number;
  isBanner: boolean;
  isPremiere: boolean;
  kind: number;
  modified: string;
  ogImage: string;
  owner: Owner;
  prerolls: any[];
  revision: number;
  snapshot: number;
  tags: any[];
  title: string;
  trackCount: number;
  uid: number;
  visibility: Visibility;
  tracks: Track[];
}

export interface GeneratedPlayList extends PlayList {
  animatedCoverUri: string;
  coverWithoutText: Cover;
  description: string;
  descriptionFormatted: string;
  everPlayed: boolean;
  generatedPlaylistType: string;
  idForFrom: string;
  madeFor: any;
  ogTitle: string;
  playCounter: any;
  uid: number;
  urlPart: string;
}

export interface GeneratedPlayListItem {
  data: GeneratedPlayList;
  notify: boolean;
  ready: boolean;
  type: "playlistOfTheDay";
}

export type Visibility = "public" | "private";

//TODO: rename Track -> TrackItem; TrackInfo -> Track
export interface Track {
  id: number;
  recent: boolean;
  timestamp: string;
  /**
   * Null when tracks are not riched
   */
  track?: TrackInfo;
}

export interface TrackInfo {
  albums: any[];
  artists: any[];
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

export interface LikedTracksResponse {
  invocationInfo: InvocationInfo;
  result: {
    library: {
      uid: number;
      revision: number;
      tracks: LikedTrack[];
    };
  };
}

export interface GetTracksResponse {
  invocationInfo: InvocationInfo;
  result: TrackInfo[];
}
