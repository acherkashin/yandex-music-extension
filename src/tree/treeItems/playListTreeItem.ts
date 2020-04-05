import * as vscode from "vscode";
import { getThemeIcon } from "../../utils";
import { PlayList } from "../../yandexApi/playlist/playList";

export class PlayListTreeItem extends vscode.TreeItem {
  constructor(public readonly playList: PlayList) {
    super(playList.title, vscode.TreeItemCollapsibleState.Collapsed);

    this.iconPath = getThemeIcon("playlist.svg");
  }
}