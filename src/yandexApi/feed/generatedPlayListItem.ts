import { GeneratedPlayList } from "./generatedPlayList";

export interface GeneratedPlayListItem {
    data: GeneratedPlayList;
    notify: boolean;
    ready: boolean;
    type: "playlistOfTheDay";
  }
  