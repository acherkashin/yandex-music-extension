import * as vscode from "vscode";
import { getResourceIcon } from "../utils";

export class LoginTreeItem extends vscode.TreeItem {
    constructor() {
        super("Connect YandexMusic");
        this.tooltip = "Connect to YandexMusic to see your recomendations";
        this.iconPath = getResourceIcon("yandex-music.png");
    }
}
