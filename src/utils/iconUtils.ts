import * as path from "path";
import * as vscode from "vscode";
import { Playlist } from "yandex-music-api-client";
import { getExtensionPath } from "./extensionUtils";
import { getCoverUri } from "../yandexApi/apiUtils";

export function getThemeIcon(iconFileName: string) {
    return {
        dark: path.join(getExtensionPath(), "resources", "dark", iconFileName),
        light: path.join(getExtensionPath(), "resources", "light", iconFileName),
    };
}

export function getResourceIcon(iconFileName: string): string {
    return path.join(getExtensionPath(), "resources", iconFileName);
}

export function getPlayListIcon(playList: Playlist) {
    if (playList.cover != undefined) {
        return vscode.Uri.parse(getCoverUri(playList.cover.uri ?? '', 30));
    }

    return getThemeIcon("playlist.svg");
}
