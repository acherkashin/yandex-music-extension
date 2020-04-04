import * as vscode from "vscode";
import { Track } from "../yandexApi/interfaces";
import { Store, LIKED_TRACKS_PLAYLIST_ID } from "../store";
import { PlayListTreeItem } from "./playListTreeItem";
import { LikedTracksTreeItem } from "./likedTracksTreeItem";
import { TrackNodeTreeItem } from "./trackNodeTreeItem";
import { ConnectTreeItem } from "./connectTreeItem";

export class PlayListTree implements vscode.TreeDataProvider<vscode.TreeItem> {
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

  getChildren(element?: LikedTracksTreeItem | PlayListTreeItem | undefined): vscode.ProviderResult<vscode.TreeItem[]> {
    if (element instanceof LikedTracksTreeItem) {
      return this.store.getLikedTracks().then((tracks) => {
        return tracks.map((item) => new TrackNodeTreeItem(<Track>item, LIKED_TRACKS_PLAYLIST_ID));
      });
    }

    if (!element) {
      return getPlayListsNodes(this.store);
    }

    if (element instanceof PlayListTreeItem) {
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
    nodes.push(...feedPlayLists.generatedPlaylists.map((item) => new PlayListTreeItem(item.data)));
    const usersPlayLists = await store.getUserPlaylists();
    nodes.push(...usersPlayLists.data.result.map((item) => new PlayListTreeItem(item)));
    nodes.push(new LikedTracksTreeItem());
  } else {
    nodes.push(new ConnectTreeItem());
  }

  return nodes;
}
