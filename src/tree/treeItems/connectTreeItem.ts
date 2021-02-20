import * as vscode from "vscode";
import { getResourceIcon } from "../../utils/iconUtils";

export class ConnectTreeItem extends vscode.TreeItem {
    constructor() {
        super("Connect YandexMusic");
        this.tooltip = "Connect to YandexMusic to see your recomendations";
        this.iconPath = getResourceIcon("yandex-music-icon.png");
        this.command = {
            command: "yandexMusic.signIn",
            title: this.label as string ?? '',
            tooltip: this.tooltip,
        };
    }
}
