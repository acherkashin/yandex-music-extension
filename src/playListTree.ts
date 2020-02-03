import * as vscode from "vscode";
import { PlayListProvider } from "./playListProvider";
import YandexMusicApi = require("yandex-music-api");

export class PlayListTree implements vscode.TreeDataProvider<vscode.TreeItem> {
  onDidChangeTreeData?: vscode.Event<vscode.TreeItem | null | undefined> | undefined;

  constructor(private playListProvider: PlayListProvider) {}

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    //TODO: figure out when this method is called
    return element;
  }

  getChildren(element?: PlayListNodeItem | undefined): vscode.ProviderResult<vscode.TreeItem[]> {
    if (!element) {
      return this.playListProvider.getPlayLists().then((playLists) => {
        return playLists.generatedPlaylists.map((item) => new PlayListNodeItem(item));
      });
    }

    return this.playListProvider.getTracks(element.playList.data).then((resp) => {
      return resp.tracks.map((item) => new TrackNodeItem(<YandexMusicApi.TrackInfo>item.track));
    });
  }
}

export class PlayListNodeItem extends vscode.TreeItem {
  constructor(public playList: YandexMusicApi.GeneratedPlayListItem) {
    super(playList.data.title, vscode.TreeItemCollapsibleState.Collapsed);
  }

  getChildren(): TrackNodeItem[] {
    return this.playList.data.tracks.map((item) => new TrackNodeItem(<YandexMusicApi.TrackInfo>item.track));
  }
}

export class TrackNodeItem extends vscode.TreeItem {
  constructor(private track: YandexMusicApi.TrackInfo) {
    super(track.title, vscode.TreeItemCollapsibleState.None);
  }
}
