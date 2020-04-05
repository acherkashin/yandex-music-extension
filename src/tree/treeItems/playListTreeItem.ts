import * as vscode from "vscode";
import { getPlayListIcon } from "../../utils";
import { PlayList } from "../../yandexApi/playlist/playList";

export class PlayListTreeItem extends vscode.TreeItem {
  constructor(public readonly playList: PlayList) {
    super(playList.title, vscode.TreeItemCollapsibleState.Collapsed);

    this.description = playList.description;
    this.tooltip = `${playList.title}. ${playList.description}`;
    this.iconPath = getPlayListIcon(playList);
  }
}