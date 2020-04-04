import * as vscode from 'vscode';
import { Store } from '../store';
import { NewReleasesTreeItem } from './newReleasesTreeItem';
import { AlbumTreeItem } from './albumTreeItem';
import { TrackNodeTreeItem } from './trackNodeTreeItem';
import { NewPlayListsTreeItem } from './newPlayListsTreeItem';
import { PlayListTreeItem as PlayListTreeItem } from './playListTreeItem';
import { Track } from '../yandexApi/interfaces';

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
                new NewPlayListsTreeItem(),
            ];
        }

        if (element instanceof NewPlayListsTreeItem) {
            return this.store.getNewPlayLists().then((playLists) => {
                return playLists.map((item) => new PlayListTreeItem(item));
            });
        }

        if (element instanceof PlayListTreeItem) {
            return this.store.getTracks(element.playList.owner.uid, element.playList.kind).then((resp) => {
                return resp.data.result.tracks.map((item) => new TrackNodeTreeItem(<Track>item.track, element.playList.kind));
            });
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