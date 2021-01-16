import { autorun, observable, observe } from 'mobx';
import * as vscode from 'vscode';
import { Store } from '../store';
import { getChildren } from './childrenLoader';
import { AlbumTreeItem, PlayListTreeItem, TrackTreeItem } from './treeItems';

export class SearchTree implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(private store: Store) {
        observe(store, "searchText", () => {
            this.refresh();
        });
    }

    refresh(item?: vscode.TreeItem): void {
        this._onDidChangeTreeData.fire(item);
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    async getChildren(element?: vscode.TreeItem) {
        if (!this.store.searchText) {
            return;
        }

        if (!element) {
            const tracksItem = new vscode.TreeItem('Треки', vscode.TreeItemCollapsibleState.Expanded);
            tracksItem.id = 'search-tracks-item';

            const albumsItem = new vscode.TreeItem('Альбомы', vscode.TreeItemCollapsibleState.Expanded);
            albumsItem.id = 'search-albums-item';

            const playListsItem = new vscode.TreeItem('Плейлисты', vscode.TreeItemCollapsibleState.Expanded);
            playListsItem.id = 'search-playlists-item';

            return [
                tracksItem,
                albumsItem,
                playListsItem,
            ];
        }

        if (element.id === 'search-tracks-item') {
            // TODO: no need to make request, need to refactor
            const responce = await this.store.api.search(this.store.searchText);
            const items = responce.data.result.tracks.results.map(item => new TrackTreeItem(this.store, item, ''));
            return items;
        }

        if (element.id === 'search-albums-item') {
            // TODO: no need to make request, need to refactor
            const responce = await this.store.api.search(this.store.searchText);
            const items = responce.data.result.albums.results.map(item => new AlbumTreeItem(item));
            return items;
        }

        if (element.id === 'search-playlists-item') {
            // TODO: no need to make request, need to refactor
            const responce = await this.store.api.search(this.store.searchText);
            const items = responce.data.result.playlists.results.map(item => new PlayListTreeItem(item));
            return items;
        }

        if (element instanceof AlbumTreeItem || element instanceof PlayListTreeItem) {
            return getChildren(this.store, element);
        }

        return [];
    }
}