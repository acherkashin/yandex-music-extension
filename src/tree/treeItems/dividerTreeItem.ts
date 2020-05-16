import * as vscode from "vscode";
import { getThemeIcon } from "../../utils/iconUtils";

export class DividerTreeItem extends vscode.TreeItem {
  constructor() {
    super("", vscode.TreeItemCollapsibleState.None);

    this.iconPath = getThemeIcon("blue-line-96.png");
  }
}