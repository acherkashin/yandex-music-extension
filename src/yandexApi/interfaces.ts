import { LandingBlockType } from "yandex-music-client";

export interface DownloadInfo {
  s: string;
  ts: string;
  path: string;
  host: string;
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
