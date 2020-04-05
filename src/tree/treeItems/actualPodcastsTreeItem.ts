import * as vscode from "vscode";
import { getThemeIcon } from "../../utils";

export class ActualPodcastsTreeItem extends vscode.TreeItem {
  constructor() {
    super("Actual podcasts", vscode.TreeItemCollapsibleState.Collapsed);

    //TODO: change icon
    this.iconPath = getThemeIcon("playlist.svg");
  }
}