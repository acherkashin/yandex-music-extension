import * as vscode from "vscode";
import { Store, CHART_TRACKS_PLAYLIST_ID } from "../store";
import { ChartTreeItem } from "./treeItems";

export class ChartTree implements vscode.TreeDataProvider<vscode.TreeItem> {
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

    getChildren(): vscode.ProviderResult<vscode.TreeItem[]> {
        return this.store.getChart().then((items) => {
            return items.map((item) => new ChartTreeItem(this.store, item, CHART_TRACKS_PLAYLIST_ID));
        });
    }
}