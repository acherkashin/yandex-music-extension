import * as vscode from "vscode";
import { getPlayListIcon } from "../../utils/iconUtils";
import { PlayList } from "../../yandexApi/playlist/playList";

export class PlayListTreeItem extends vscode.TreeItem {
  constructor(public readonly playList: PlayList) {
    super(playList.title, vscode.TreeItemCollapsibleState.Collapsed);

    this.description = playList.description;
    this.tooltip = `${playList.title}. ${playList.description}`;
    // TODO load playlist icon
    this.iconPath = getPlayListIcon(playList);
  }
}