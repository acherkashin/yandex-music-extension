import { autorun, observable, observe } from 'mobx';
import * as vscode from 'vscode';
import { Store } from '../store';

export class SearchTree implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(private store: Store) { 
        observe(store, "searchText", () => {
            this.refresh();
        });
    }

    refresh(item?: vscode.TreeItem): void {
        this._onDidChangeTreeData.fire(item);
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem[]> {
        return [new vscode.TreeItem(this.store.searchText)];
        // return [];
    }
}