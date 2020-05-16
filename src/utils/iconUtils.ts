import * as path from "path";
import { ThemeIcon } from "vscode";
import { PlayList } from "../yandexApi/playlist/playList";
import { GeneratedPlayList } from "../yandexApi/feed/generatedPlayList";
import { getExtensionPath } from "./extensionUtils";

export function getThemeIcon(iconFileName: string): ThemeIcon {
    return {
        dark: path.join(getExtensionPath(), "resources", "dark", iconFileName),
        light: path.join(getExtensionPath(), "resources", "light", iconFileName),
    };
}

export function getResourceIcon(iconFileName: string): string {
    return path.join(getExtensionPath(), "resources", iconFileName);
}

const generatedPlayListTypes = ["playlistOfTheDay", "recentTracks", "neverHeard", "podcasts", "missedLikes", "origin"];

export function getPlayListIcon(playList: PlayList) {
    if ("generatedPlaylistType" in playList) {
        const playListType = (playList as GeneratedPlayList).generatedPlaylistType;

        if (generatedPlayListTypes.indexOf(playListType) !== -1) {
            return getResourceIcon(`playLists/${playListType}.png`);
        }
    }

    return getThemeIcon("playlist.svg");
}
