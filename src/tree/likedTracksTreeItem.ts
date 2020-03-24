import * as vscode from "vscode";

export class LikedTracksTreeItem extends vscode.TreeItem {
  constructor() {
    super("Мне нравится", vscode.TreeItemCollapsibleState.Collapsed);
  }
}