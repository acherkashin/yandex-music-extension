import * as vscode from "vscode";
import { TrackInfo, GeneratedPlayListItem } from "./yandexApi/interfaces";
import { Store } from "./store";

export class PlayListTree implements vscode.TreeDataProvider<vscode.TreeItem> {
  onDidChangeTreeData?: vscode.Event<vscode.TreeItem | null | undefined> | undefined;

  constructor(private store: Store) {}

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    //TODO: figure out when this method is called
    return element;
  }

  getChildren(element?: PlayListNodeItem | undefined): vscode.ProviderResult<vscode.TreeItem[]> {
    if (!element) {
      return this.store.getPlayLists().then((playLists) => {
        return playLists.generatedPlaylists.map((item) => new PlayListNodeItem(item));
      });
    }

    return this.store.getTracks(element.playList.data.owner.uid, element.playList.data.kind).then((resp) => {
      return resp.tracks.map((item) => new TrackNodeItem(<TrackInfo>item.track, element.playList.data.kind));
    });
  }
}

export class PlayListNodeItem extends vscode.TreeItem {
  constructor(public readonly playList: GeneratedPlayListItem) {
    super(playList.data.title, vscode.TreeItemCollapsibleState.Collapsed);
  }

  getChildren(): TrackNodeItem[] {
    return this.playList.data.tracks.map((item) => new TrackNodeItem(<TrackInfo>item.track, this.playList.data.kind));
  }
}

export class TrackNodeItem extends vscode.TreeItem {
  constructor(public readonly track: TrackInfo, public readonly playListId: string | number) {
    super(track.title, vscode.TreeItemCollapsibleState.None);
    this.command = {
      command: "yandexMusic.playTrack",
      title: "Play Track",
      tooltip: `Play ${track.title}`,
      arguments: [this],
    };
  }
}
