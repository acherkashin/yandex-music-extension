import * as vscode from "vscode";
import { Playlist, Track } from "yandex-music-client";
import { getArtists } from "../../YandexMusicApi/ApiUtils";
import { getThemeIcon } from "../../utils/iconUtils";
import { Store } from "../../store";

export class UserTrackTreeItem extends vscode.TreeItem {
  constructor(private store: Store, public readonly track: Track, public readonly playlist: Playlist) {
    super(`${track.title} - ${getArtists(track)}`, vscode.TreeItemCollapsibleState.None);
    this.command = {
      command: "yandexMusic.play",
      title: "Play Track",
      tooltip: `Play ${this.label}`,
      arguments: [this],
    };

    const contexts = ["track", "user"];
    if(store.isLikedTrack(this.track.id)) {
        contexts.push("liked");
    }

    this.iconPath = getThemeIcon("track.svg");
    this.contextValue = contexts.join(",");
  }
}