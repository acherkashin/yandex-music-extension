import * as vscode from "vscode";
import { getThemeIcon } from "../../utils/iconUtils";

export class MyWaveTreeItem extends vscode.TreeItem {
    constructor() {
        super("Моя волна", vscode.TreeItemCollapsibleState.Collapsed);

        this.command = {
            command: "yandexMusic.playRadio",
            title: "Play Track",
            tooltip: `Play ${this.label}`,
            arguments: ["user:onyourwave"],
        };

        this.iconPath = getThemeIcon("wave.svg");
        this.collapsibleState = vscode.TreeItemCollapsibleState.None;
    }
}