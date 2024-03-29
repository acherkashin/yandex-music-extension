import * as vscode from "vscode";
import { Track } from "yandex-music-client";
import { getArtists } from "../../YandexMusicApi/ApiUtils";
import { getThemeIcon } from "../../utils/iconUtils";
import { Store } from "../../store";

export class TrackTreeItem extends vscode.TreeItem {
  constructor(private store: Store, public readonly track: Track, public readonly playListId: string | number) {
    super(`${track.title} - ${getArtists(track)}`, vscode.TreeItemCollapsibleState.None);
    this.command = {
      command: "yandexMusic.play",
      title: "Play Track",
      tooltip: `Play ${this.label}`,
      arguments: [this],
    };

    const contexts = ["track"];
    if (store.isLikedTrack(this.track.id, this.track.type)) {
      contexts.push("cannotlike");
    } else {
      contexts.push("canlike");
    }

    this.iconPath = getThemeIcon("track.svg");
    this.contextValue = contexts.join(",");
  }
}