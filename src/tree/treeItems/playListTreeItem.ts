import * as vscode from "vscode";
import { getPlayListIcon } from "../../utils/iconUtils";
import { getCoverUri } from "../../yandexApi/apiUtils";
import { PlayList } from "../../yandexApi/playlist/playList";

export class PlayListTreeItem extends vscode.TreeItem {
  constructor(public readonly playList: PlayList) {
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