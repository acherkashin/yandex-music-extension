import * as vscode from 'vscode';
import { Store } from '../store';
import { NewReleasesTreeItem } from './newReleasesTreeItem';
import { AlbumTreeItem } from './albumTreeItem';
import { TrackNodeTreeItem } from './trackNodeTreeItem';

export class RecommendationTree implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(private store: Store) { }

    refresh(item?: vscode.TreeItem): void {
        this._onDidChangeTreeData.fire(item);
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        //TODO: figure out when this method is called
        return element;
    }

    getChildren(element?: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem[]> {
        if (!element) {
            return [
                new NewReleasesTreeItem(),
            ];
        }

        if (element instanceof NewReleasesTreeItem) {
            return this.store.getNewReleases().then((albums) => {
                return albums.map((item) => new AlbumTreeItem(item));
            });
        }

        if (element instanceof AlbumTreeItem) {
            return this.store.getAlbumTracks(element.album.id).then((tracks) => {
                return tracks.map((item) => new TrackNodeTreeItem(item, element.album.id));
            });
        }

        return null;
    }
}