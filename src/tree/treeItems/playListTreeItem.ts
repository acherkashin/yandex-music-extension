import * as vscode from "vscode";
import { getThemeIcon, getResourceIcon } from "../../utils";
import { PlayList } from "../../yandexApi/playlist/playList";
import { GeneratedPlayList } from "../../yandexApi/feed/generatedPlayList";

export class PlayListTreeItem extends vscode.TreeItem {
  constructor(public readonly playList: PlayList) {
    super(playList.title, vscode.TreeItemCollapsibleState.Collapsed);

    if ("generatedPlaylistType" in playList) {
      const playListType = (playList as GeneratedPlayList).generatedPlaylistType;
      if (playListType === "playlistOfTheDay") {
        this.iconPath = getResourceIcon("playLists/playlistOfTheDay.png");
      } else if (playListType === "recentTracks") {
        this.iconPath = getResourceIcon("playLists/recentTracks.png");
      } else if (playListType === "neverHeard") {
        this.iconPath = getResourceIcon("playLists/neverHeard.png");
      } else if (playListType === "podcasts") {
        this.iconPath = getResourceIcon("playLists/podcasts.png");
      } else if (playListType === "missedLikes") {
        this.iconPath = getResourceIcon("playLists/missedLikes.png");
      } else if (playListType === "origin") {
        this.iconPath = getResourceIcon("playLists/origin.png");
      }
    } else {
      this.iconPath = getThemeIcon("playlist.svg");
    }
  }
}