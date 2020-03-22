import * as vscode from "vscode";
import { Track, GeneratedPlayListItem } from "./yandexApi/interfaces";
import { Store, LIKED_TRACKS_PLAYLIST_ID } from "./store";
import { createTrackAlbumIds } from "./yandexApi/apiUtils";

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
      return this.store.getTracks(element.playList.data.owner.uid, element.playList.data.kind).then((resp) => {
        return resp.tracks.map((item) => new TrackNodeItem(<Track>item.track, element.playList.data.kind));
      });
    }
  }
}

function getPlayListsNodes(store: Store): Promise<vscode.TreeItem[]> {
  return store.getFeed().then((playLists) => {
    const nodes: vscode.TreeItem[] = playLists.generatedPlaylists.map((item) => new PlayListNodeItem(item));
    nodes.push(new LikedTracksNode());

    return nodes;
  });
}

export class LikedTracksNode extends vscode.TreeItem {
  constructor() {
    super("Мне нравится", vscode.TreeItemCollapsibleState.Collapsed);
  }
}

export class PlayListNodeItem extends vscode.TreeItem {
  constructor(public readonly playList: GeneratedPlayListItem) {
    super(playList.data.title, vscode.TreeItemCollapsibleState.Collapsed);
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
  }
}
