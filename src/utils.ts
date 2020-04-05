import * as path from "path";
import { ThemeIcon } from "vscode";
import { PlayList } from "./yandexApi/playlist/playList";
import { GeneratedPlayList } from "./yandexApi/feed/generatedPlayList";

export function getThemeIcon(iconFileName: string): ThemeIcon {
    return {
        dark: path.join(__dirname, "..", "resources", "dark", iconFileName),
        light: path.join(__dirname, "..", "resources", "light", iconFileName),
    };
}

export function getResourceIcon(iconFileName: string): string {
    return path.join(__dirname, "..", "resources", iconFileName);
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
