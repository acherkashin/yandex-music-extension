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

export interface Promotion {
  promoId: string;
  title: string;
  subtitle: string;
  heading: string;
  urlScheme: string;
  url: string;
  textColor: string;
  gradient: string;
  image: string;
}

export interface Chart {
  position: number;
  progress: string;
  listeners: number;
  shift: number;
}

export interface ChartItem {
  track: Track;
  chart: Chart;
}

export interface LandingBlockEntity<T> {
  id: string;
  type: LandingBlockType;
  data: T;
}

export interface LandingBlock {
  id: string;
  title: string;
  type: LandingBlockType;
  /**
   * Where block was got from
   */
  typeForFrom: LandingBlockType;
  description: string | undefined;
  entities: LandingBlockEntity<Promotion | Album | PlayList | ChartItem>;
}

export interface LandingResult {
  pumpkin: boolean;
  contentId: string;
  blocks: LandingBlock[];
}

export interface LandingResponse extends YandexMusicResponse<LandingResult> { }

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
  tracks: TrackItem[];
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

export interface TrackItem {
  id: number;
  recent: boolean;
  timestamp: string;
  /**
   * Null when tracks are not riched
   */
  track?: Track;
}

export interface Album {
  id: number;
  title: string;
  type: "single" | string;
  metaType: "single" | string;
  year: number;
  releaseDate: string;
  coverUri: string;
  ogImage: string;
  genre: string;
  buy: any[];
  trackCount: number;
  recent: boolean;
  /**
   * Whether albom is popular for listeners
   */
  veryImportant: boolean;
  artists: Artist[];
  labels: Array<{ id: number, name: string }>;
  available: boolean;
  availableForPremiumUsers: boolean;
  availableForMobile: boolean;
  availablePartially: boolean;
  /**
   * of the best tracks ids
   */
  bests: number[];
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