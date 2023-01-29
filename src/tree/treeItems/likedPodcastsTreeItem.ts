import * as vscode from "vscode";
import { getThemeIcon } from "../../utils/iconUtils";

export class LikedPodcastsTreeItem extends vscode.TreeItem {
  constructor() {
    super("Любимые выпуски", vscode.TreeItemCollapsibleState.Collapsed);

    this.iconPath = getThemeIcon("microphone.svg");
  }
}