import { observe } from 'mobx';
import * as vscode from 'vscode';
import { SEARCH_TRACKS_PLAYLIST_ID, Store } from '../store';
import { getThemeIcon } from '../utils/iconUtils';
import { getChildren } from './childrenLoader';
import { AlbumTreeItem, PlayListTreeItem, TrackTreeItem } from './treeItems';
import { ArtistTreeItem } from './treeItems/artistTreeItem';

export class SearchTree implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(private store: Store) {
        observe(store, "searchResponse", () => {
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
        if (!this.store.searchResponse) {
            return;
        }

        const responce = this.store.searchResponse;

        if (!element) {
            const searchItems: vscode.TreeItem[] = [];

            if (responce.tracks) {
                const tracksItem = new vscode.TreeItem('Треки', vscode.TreeItemCollapsibleState.Expanded);
                tracksItem.id = 'search-tracks-item';
                tracksItem.iconPath = getThemeIcon("track.svg");
                searchItems.push(tracksItem);
            }

            if (responce.albums) {
                const albumsItem = new vscode.TreeItem('Альбомы', vscode.TreeItemCollapsibleState.Expanded);
                albumsItem.id = 'search-albums-item';
                albumsItem.iconPath = getThemeIcon("playlist.svg");
                searchItems.push(albumsItem);
            }

            if (responce.playlists) {
                const playListsItem = new vscode.TreeItem('Плейлисты', vscode.TreeItemCollapsibleState.Expanded);
                playListsItem.id = 'search-playlists-item';
                playListsItem.iconPath = getThemeIcon("playlist.svg");
                searchItems.push(playListsItem);
            }

            if (responce.artists) {
                const artistsItem = new vscode.TreeItem('Исполнители', vscode.TreeItemCollapsibleState.Expanded);
                artistsItem.iconPath = new vscode.ThemeIcon("organization");
                artistsItem.id = 'search-artists-item';
                searchItems.push(artistsItem);
            }

            return searchItems;
        }

        if (element.id === 'search-tracks-item') {
            const items = responce.tracks.results.map(item => new TrackTreeItem(this.store, item, SEARCH_TRACKS_PLAYLIST_ID));
            return items;
        }

        if (element.id === 'search-albums-item') {
            const items = responce.albums.results.map(item => new AlbumTreeItem(item));
            return items;
        }

        if (element.id === 'search-playlists-item') {
            const items = responce.playlists.results.map(item => new PlayListTreeItem(item));
            return items;
        }

        if (element.id === 'search-artists-item') {
            const items = responce.artists.results.map(item => new ArtistTreeItem(this.store, item));
            return items;
        }

        if (element instanceof AlbumTreeItem || element instanceof PlayListTreeItem || element instanceof ArtistTreeItem) {
            return getChildren(this.store, element);
        }

        return [];
    }
}