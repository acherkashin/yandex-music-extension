import * as vscode from "vscode";
import { PlayList } from "../yandexApi/interfaces";
import { getThemeIcon } from "../utils";

export class PlayListTreeItem extends vscode.TreeItem {
  constructor(public readonly playList: PlayList) {
    super(playList.title, vscode.TreeItemCollapsibleState.Collapsed);

    this.iconPath = getThemeIcon("playlist.svg");
  }
}