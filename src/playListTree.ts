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
  getChildren(element?: vscode.TreeItem | undefined): vscode.ProviderResult<vscode.TreeItem[]> {
    if (!element) {
      return this.playListProvider.getPlayLists().then((playLists) => {
        return playLists.generatedPlaylists.map((item) => new PlayListNodeItem(item));
      });
    }
  }
}

export class PlayListNodeItem extends vscode.TreeItem {
  constructor(private playList: YandexMusicApi.GeneratedPlayListItem) {
    super(playList.data.title);
  }
}
