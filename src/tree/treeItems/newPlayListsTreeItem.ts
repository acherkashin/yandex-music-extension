import * as vscode from "vscode";
import { getThemeIcon } from "../../utils/iconUtils";
import { Store } from "../../store";

export class NewPlayListsTreeItem extends vscode.TreeItem {
  constructor(private store: Store) {
    super("New Play Lists", vscode.TreeItemCollapsibleState.Collapsed);

    const newPlaylists = store.getLandingBlock('new-playlists');

    if (newPlaylists) {
      this.label = newPlaylists.title;
      this.description = newPlaylists.description;
      this.tooltip = `${newPlaylists.title}. ${newPlaylists.description}`;
    }

    //TODO: change icon
    this.iconPath = getThemeIcon("playlist.svg");
  }
}