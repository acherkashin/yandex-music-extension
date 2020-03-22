import * as vscode from "vscode";
import { Track, GeneratedPlayListItem, PlayList } from "./yandexApi/interfaces";
import { Store, LIKED_TRACKS_PLAYLIST_ID } from "./store";

export class PlayListTree implements vscode.TreeDataProvider<vscode.TreeItem> {
  onDidChangeTreeData?: vscode.Event<vscode.TreeItem | null | undefined> | undefined;

  constructor(private store: Store) {}

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    //TODO: figure out when this method is called
    return element;
  }

  getChildren(element?: LikedTracksNode | PlayListNodeItem | undefined): vscode.ProviderResult<vscode.TreeItem[]> {
    if (element instanceof LikedTracksNode) {
      return this.store.getLikedTracks().then((tracks) => {
        return tracks.map((item) => new TrackNodeItem(<Track>item, LIKED_TRACKS_PLAYLIST_ID));
      });
    }

    if (!element) {
      return getPlayListsNodes(this.store);
    }

    if (element instanceof PlayListNodeItem) {
      return this.store.getTracks(element.playList.owner.uid, element.playList.kind).then((resp) => {
        return resp.data.result.tracks.map((item) => new TrackNodeItem(<Track>item.track, element.playList.kind));
      });
    }
  }
}

async function getPlayListsNodes(store: Store): Promise<vscode.TreeItem[]> {
  const feedPlayLists = await store.getFeed();
  const usersPlayLists = await store.getUserPlaylists();
  const nodes: vscode.TreeItem[] = [];
  nodes.push(...feedPlayLists.generatedPlaylists.map((item) => new PlayListNodeItem(item.data)));
  nodes.push(...usersPlayLists.data.result.map((item) => new PlayListNodeItem(item)));
  nodes.push(new LikedTracksNode());

  return nodes;
}

export class LikedTracksNode extends vscode.TreeItem {
  constructor() {
    super("Мне нравится", vscode.TreeItemCollapsibleState.Collapsed);
  }
}

export class PlayListNodeItem extends vscode.TreeItem {
  constructor(public readonly playList: PlayList) {
    super(playList.title, vscode.TreeItemCollapsibleState.Collapsed);
  }
}

export class TrackNodeItem extends vscode.TreeItem {
  constructor(public readonly track: Track, public readonly playListId: string | number) {
    super(track.title, vscode.TreeItemCollapsibleState.None);
    this.command = {
      command: "yandexMusic.play",
      title: "Play Track",
      tooltip: `Play ${track.title}`,
      arguments: [this],
    };

    this.contextValue = "track";
  }
}
