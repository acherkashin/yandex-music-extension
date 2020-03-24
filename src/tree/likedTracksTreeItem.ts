import * as vscode from "vscode";
import { getThemeIcon } from "../utils";

export class LikedTracksTreeItem extends vscode.TreeItem {
  constructor() {
    super("Мне нравится", vscode.TreeItemCollapsibleState.Collapsed);

    this.iconPath = getThemeIcon("heart-filled.svg");
  }
}