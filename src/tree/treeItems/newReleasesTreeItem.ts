import * as vscode from "vscode";
import { getThemeIcon } from "../../utils";

export class NewReleasesTreeItem extends vscode.TreeItem {
  constructor() {
    super("New Releases", vscode.TreeItemCollapsibleState.Collapsed);

    //TODO: change icon
    this.iconPath = getThemeIcon("playlist.svg");
  }
}