import * as vscode from "vscode";
import { getThemeIcon } from "../../utils";
import { Store } from "../../store";

export class ActualPodcastsTreeItem extends vscode.TreeItem {
  constructor(store: Store) {
    super("Actual podcasts", vscode.TreeItemCollapsibleState.Collapsed);

    const podcasts = store.getLandingBlock('podcasts');

    if (podcasts) {
      this.label = podcasts.title;
      this.description = podcasts.description;
      this.tooltip = `${podcasts.title}. ${podcasts.description}`;
    }

    //TODO: change icon
    this.iconPath = getThemeIcon("playlist.svg");
  }
}