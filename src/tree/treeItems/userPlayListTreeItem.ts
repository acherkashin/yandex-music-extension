import { Playlist } from "yandex-music-client";
import { PlayListTreeItem } from "./playListTreeItem";

export class UserPlayListTreeItem extends PlayListTreeItem {
    constructor(playList: Playlist) {
      super(playList);
  
      this.contextValue = [this.contextValue, 'user-playlist'].join(',');
    }
  }