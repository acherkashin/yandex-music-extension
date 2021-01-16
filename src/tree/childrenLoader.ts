import * as vscode from 'vscode';
import { NewPlayListsTreeItem, PlayListTreeItem, TrackTreeItem, NewReleasesTreeItem, AlbumTreeItem, LikedTracksTreeItem } from './treeItems';
import { Store, LIKED_TRACKS_PLAYLIST_ID } from '../store';
import { Track } from '../yandexApi/interfaces';
import { ActualPodcastsTreeItem } from './treeItems/actualPodcastsTreeItem';
import { ArtistTreeItem } from './treeItems/artistTreeItem';

export function getChildren(store: Store, element?: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem[]> {
    if (element instanceof NewPlayListsTreeItem) {
        return store.getNewPlayLists().then((playLists) => {
            return playLists.map((item) => new PlayListTreeItem(item));
        });
    }

    if (element instanceof PlayListTreeItem) {
        return store.getTracks(element.playList.owner.uid, element.playList.kind).then((resp) => {
            return resp.data.result.tracks.map((item) => new TrackTreeItem(store, <Track>item.track, element.playList.kind));
        });
    }

    if (element instanceof NewReleasesTreeItem) {
        return store.getNewReleases().then((albums) => {
            return albums.map((item) => new AlbumTreeItem(item));
        });
    }

    if (element instanceof AlbumTreeItem) {
        return store.getAlbumTracks(element.album.id).then((tracks) => {
            return tracks.map((item) => new TrackTreeItem(store, item, element.album.id));
        });
    }

    if (element instanceof LikedTracksTreeItem) {
        return store.getLikedTracks().then((tracks) => {
            return tracks.map((item) => new TrackTreeItem(store, <Track>item, LIKED_TRACKS_PLAYLIST_ID));
        });
    }

    if (element instanceof ActualPodcastsTreeItem) {
        return store.getActualPodcasts().then((albums) => {
            return albums.map((item) => new AlbumTreeItem(item));
        });
    }

    if(element instanceof ArtistTreeItem) {
        return element.getChildren();
    }

    return null;
}