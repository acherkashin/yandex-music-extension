import * as vscode from "vscode";
import { Store } from "../../store";
import { Artist } from "../../yandexApi/interfaces";
import { TrackTreeItem } from "./trackTreeItem";

export class ArtistTreeItem extends vscode.TreeItem {
    constructor(private store: Store, public readonly artist: Artist) {
        super(artist.name, vscode.TreeItemCollapsibleState.Collapsed);

        // TODO: add artist icon
        //  this.iconPath = "";
    }

    getChildren() {
        if (!this.artist.popularTracks) {
            return [];
        }

        // TODO: trackes will not be played as they are not added to the store.playlists
        return this.artist.popularTracks.map(item => new TrackTreeItem(this.store, item, ''));
    }
}