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

            responce.tracks && searchItems.push(createTracksItem());
            responce.albums && searchItems.push(createAlbumsItem());
            responce.playlists && searchItems.push(createPlayListsItem());
            responce.artists && searchItems.push(createArtistsItem());

            return searchItems;
        }

        if (element.id === tracksItemId) {
            return responce.tracks.results.map(item => new TrackTreeItem(this.store, item, SEARCH_TRACKS_PLAYLIST_ID));
        }

        if (element.id === albumsItemId) {
            return responce.albums.results.map(item => new AlbumTreeItem(item));
        }

        if (element.id === playListsItemId) {
            return responce.playlists.results.map(item => new PlayListTreeItem(item));
        }

        if (element.id === artistsItemId) {
            return responce.artists.results.map(item => new ArtistTreeItem(this.store, item));
        }

        if (element instanceof AlbumTreeItem || element instanceof PlayListTreeItem || element instanceof ArtistTreeItem) {
            return getChildren(this.store, element);
        }

        return [];
    }
}

const tracksItemId = 'search-tracks-item';
const albumsItemId = 'search-albums-item';
const playListsItemId = 'search-playlists-item';
const artistsItemId = 'search-artists-item'; 

function createTracksItem() {
    const tracksItem = new vscode.TreeItem('Треки', vscode.TreeItemCollapsibleState.Expanded);
    tracksItem.id = tracksItemId;
    tracksItem.iconPath = getThemeIcon("track.svg");
    return tracksItem;
}

function createAlbumsItem() {
    const albumsItem = new vscode.TreeItem('Альбомы', vscode.TreeItemCollapsibleState.Expanded);
    albumsItem.id = albumsItemId;
    albumsItem.iconPath = getThemeIcon("playlist.svg");
    return albumsItem;
}

function createPlayListsItem() {
    const playListsItem = new vscode.TreeItem('Плейлисты', vscode.TreeItemCollapsibleState.Expanded);
    playListsItem.id = playListsItemId;
    playListsItem.iconPath = getThemeIcon("playlist.svg");
    return playListsItem;
}

function createArtistsItem() {
    const artistsItem = new vscode.TreeItem('Исполнители', vscode.TreeItemCollapsibleState.Expanded);
    artistsItem.id = artistsItemId;
    artistsItem.iconPath = new vscode.ThemeIcon("organization");
    return artistsItem;
}