import * as vscode from 'vscode';
import { Track } from 'yandex-music-client';
import { NewPlayListsTreeItem, PlayListTreeItem, TrackTreeItem, NewReleasesTreeItem, AlbumTreeItem, LikedTracksTreeItem } from './treeItems';
import { Store, LIKED_TRACKS_PLAYLIST_ID, LIKED_PODCASTS_PLAYLIST_ID } from '../store';
import { ActualPodcastsTreeItem } from './treeItems/actualPodcastsTreeItem';
import { ArtistTreeItem } from './treeItems/artistTreeItem';
import { UserPlayListTreeItem, UserTrackTreeItem, LikedPodcastsTreeItem } from './treeItems';

export function getChildren(store: Store, element?: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem[]> {
    if (element instanceof NewPlayListsTreeItem) {
        return store.api.getNewPlayLists().then((playLists) => {
            return playLists.map((item) => new PlayListTreeItem(item));
        });
    }

    if (element instanceof UserPlayListTreeItem) {
        const playlist = element.playList;
        return store.getTracks(playlist.owner.uid, playlist.kind).then((tracks) => {
            return tracks.map((track, index) => new UserTrackTreeItem(store, track, playlist, index));
        });
    }

    if (element instanceof PlayListTreeItem) {
        return store.getTracks(element.playList.owner.uid, element.playList.kind).then((tracks) => {
            return tracks.map((track) => new TrackTreeItem(store, <Track>track, element.playList.kind));
        });
    }

    if (element instanceof NewReleasesTreeItem) {
        return store.api.getNewReleases().then((albums) => {
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

    if (element instanceof LikedPodcastsTreeItem) {
        return store.getLikedPodcasts().then((tracks) => {
            return tracks.map((item) => new TrackTreeItem(store, <Track>item, LIKED_PODCASTS_PLAYLIST_ID));
        });
    }

    if (element instanceof ActualPodcastsTreeItem) {
        return store.api.getActualPodcasts().then((albums) => {
            return albums.map((item) => new AlbumTreeItem(item));
        });
    }

    if (element instanceof ArtistTreeItem) {
        return store.getArtistTracks(element.artist.id.toString()).then(tracks => {
            return tracks.map((track) => new TrackTreeItem(store, track, element.artist.id));
        });
    }

    return null;
}