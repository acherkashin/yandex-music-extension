import * as vscode from "vscode";
import { Store } from "../store";
import { PlayListTreeItem, LikedTracksTreeItem, ConnectTreeItem } from "./treeItems";
import { getChildren } from "./childrenLoader";
import { DividerTreeItem } from "./treeItems/dividerTreeItem";

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
    if (!element) {
      return getPlayListsNodes(this.store);
    }

    return getChildren(this.store, element);
  }
}

async function getPlayListsNodes(store: Store): Promise<vscode.TreeItem[]> {
  const nodes: vscode.TreeItem[] = [];

  if (store.isAuthorized()) {
    const generatedPlaylists = store.getGeneratedPlayLists();
    nodes.push(...generatedPlaylists.map((item) => new PlayListTreeItem(item)));
    nodes.push(new DividerTreeItem());
    const usersPlayLists = await store.getUserPlaylists();
    nodes.push(...usersPlayLists.data.result.map((item) => new PlayListTreeItem(item)));
    nodes.push(new DividerTreeItem());
    nodes.push(new LikedTracksTreeItem());
  } else {
    nodes.push(new ConnectTreeItem());
  }

  return nodes;
}
