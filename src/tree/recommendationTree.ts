import * as vscode from 'vscode';
import { Store } from '../store';
import { NewReleasesTreeItem, NewPlayListsTreeItem } from './treeItems';
import { getChildren } from './childrenLoader';
import { ActualPodcastsTreeItem } from './treeItems/actualPodcastsTreeItem';

export class RecommendationTree implements vscode.TreeDataProvider<vscode.TreeItem> {
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

    getChildren(element?: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem[]> {
        if (!element) {
            return [
                new NewReleasesTreeItem(),
                new NewPlayListsTreeItem(),
                new ActualPodcastsTreeItem(),
            ];
        }

        return getChildren(this.store, element);
    }
}