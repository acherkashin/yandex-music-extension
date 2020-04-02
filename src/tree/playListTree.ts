import * as vscode from "vscode";
import { Track } from "../yandexApi/interfaces";
import { Store, LIKED_TRACKS_PLAYLIST_ID } from "../store";
import { PlayListNodeTreeItem } from "./playListTreeItem";
import { LikedTracksTreeItem } from "./likedTracksTreeItem";
import { TrackNodeTreeItem } from "./trackNodeTreeItem";
import { ConnectTreeItem } from "./connectTreeItem";

export class PlayListTree implements vscode.TreeDataProvider<vscode.TreeItem> {
  onDidChangeTreeData?: vscode.Event<vscode.TreeItem | null | undefined> | undefined;

  constructor(private store: Store) { }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    //TODO: figure out when this method is called
    return element;
  }

  getChildren(element?: LikedTracksTreeItem | PlayListNodeTreeItem | undefined): vscode.ProviderResult<vscode.TreeItem[]> {
    if (element instanceof LikedTracksTreeItem) {
      return this.store.getLikedTracks().then((tracks) => {
        return tracks.map((item) => new TrackNodeTreeItem(<Track>item, LIKED_TRACKS_PLAYLIST_ID));
      });
    }

    if (!element) {
      return getPlayListsNodes(this.store);
    }

    if (element instanceof PlayListNodeTreeItem) {
      return this.store.getTracks(element.playList.owner.uid, element.playList.kind).then((resp) => {
        return resp.data.result.tracks.map((item) => new TrackNodeTreeItem(<Track>item.track, element.playList.kind));
      });
    }
  }
}

async function getPlayListsNodes(store: Store): Promise<vscode.TreeItem[]> {
  const nodes: vscode.TreeItem[] = [];
  
  if (store.isAuthorized()) {
    const feedPlayLists = await store.getFeed();
    nodes.push(...feedPlayLists.generatedPlaylists.map((item) => new PlayListNodeTreeItem(item.data)));
    const usersPlayLists = await store.getUserPlaylists();
    nodes.push(...usersPlayLists.data.result.map((item) => new PlayListNodeTreeItem(item)));
    nodes.push(new LikedTracksTreeItem());
  } else {
    nodes.push(new ConnectTreeItem());
  }

  return nodes;
}
