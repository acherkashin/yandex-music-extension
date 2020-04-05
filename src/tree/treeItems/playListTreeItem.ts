import * as vscode from "vscode";
import { getPlayListIcon } from "../../utils";
import { PlayList } from "../../yandexApi/playlist/playList";

export class PlayListTreeItem extends vscode.TreeItem {
  constructor(public readonly playList: PlayList) {
    super(playList.title, vscode.TreeItemCollapsibleState.Collapsed);

    this.iconPath = getPlayListIcon(playList);
  }
}