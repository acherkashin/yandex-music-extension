import * as vscode from "vscode";
import { getThemeIcon } from "../../utils";

export class NewPlayListsTreeItem extends vscode.TreeItem {
  constructor() {
    super("New Play Lists", vscode.TreeItemCollapsibleState.Collapsed);

    //TODO: change icon
    this.iconPath = getThemeIcon("playlist.svg");
  }
}