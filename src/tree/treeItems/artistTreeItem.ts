import * as vscode from "vscode";
import { Store } from "../../store";
import { getCoverUri } from "../../yandexApi/apiUtils";
import { Artist } from "../../yandexApi/interfaces";

export class ArtistTreeItem extends vscode.TreeItem {
    constructor(private store: Store, public readonly artist: Artist) {
        super(artist.name, vscode.TreeItemCollapsibleState.Collapsed);

        if (artist.cover?.uri) {
            const uri = getCoverUri(artist.cover.uri, 50);
            this.iconPath = vscode.Uri.parse(uri);
        } else {
            this.iconPath = new vscode.ThemeIcon("person");
        }
    }
}