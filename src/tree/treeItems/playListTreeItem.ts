import * as vscode from "vscode";
import { Playlist } from "yandex-music-client";
import { getPlayListIcon } from "../../utils/iconUtils";
import { getCoverUri } from "../../yandexApi/apiUtils";

export class PlayListTreeItem extends vscode.TreeItem {
  constructor(public readonly playList: Playlist) {
    super(playList.title, vscode.TreeItemCollapsibleState.Collapsed);

    this.description = playList.description;
    this.tooltip = `${playList.title}. ${playList.description}`;

    if (playList.cover?.uri) {
      const uri = getCoverUri(playList.cover.uri, 50);
      this.iconPath = vscode.Uri.parse(uri);
    } else {
      this.iconPath = getPlayListIcon(playList);
    }
  }
}