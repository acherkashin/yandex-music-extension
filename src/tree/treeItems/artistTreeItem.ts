import * as vscode from "vscode";
import { Store } from "../../store";
import { Artist } from "../../yandexApi/interfaces";

export class ArtistTreeItem extends vscode.TreeItem {
    constructor(private store: Store, public readonly artist: Artist) {
        super(artist.name, vscode.TreeItemCollapsibleState.Collapsed);

        // TODO: add artist icon
        //  this.iconPath = "";
    }
}