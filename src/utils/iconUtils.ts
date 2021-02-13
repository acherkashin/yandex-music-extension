import * as path from "path";
import * as vscode from "vscode";
import { ThemeIcon } from "vscode";
import { PlayList } from "../yandexApi/playlist/playList";
import { getExtensionPath } from "./extensionUtils";
import { getCoverUri } from "../yandexApi/apiUtils";

export function getThemeIcon(iconFileName: string): ThemeIcon {
    return {
        dark: path.join(getExtensionPath(), "resources", "dark", iconFileName),
        light: path.join(getExtensionPath(), "resources", "light", iconFileName),
    };
}

export function getResourceIcon(iconFileName: string): string {
    return path.join(getExtensionPath(), "resources", iconFileName);
}

export function getPlayListIcon(playList: PlayList) {
    if (playList.coverWithoutText != undefined) {
        return vscode.Uri.parse(getCoverUri(playList.coverWithoutText.uri ?? '', 30));
    }

    return getThemeIcon("playlist.svg");
}
