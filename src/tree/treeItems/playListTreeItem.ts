import * as vscode from "vscode";
import { Playlist } from "yandex-music-client";
import { getPlayListIcon } from "../../utils/iconUtils";
import { getCoverUri } from "../../YandexMusicApi/ApiUtils";

export class PlayListTreeItem extends vscode.TreeItem {
  constructor(public playList: Playlist) {
    super('');
    this.update(playList);
  }

  update(playList: Playlist) {
    this.playList = playList;
    this.label = playList.title;
    this.description = playList.description;
    this.tooltip = [playList.title, playList.description].join('. ');
    this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;

    if (playList.cover?.uri) {
      const uri = getCoverUri(playList.cover.uri, 50);
      this.iconPath = vscode.Uri.parse(uri);
    } else {
      this.iconPath = getPlayListIcon(playList);
    }

    this.contextValue = 'playlist';
  }
}
