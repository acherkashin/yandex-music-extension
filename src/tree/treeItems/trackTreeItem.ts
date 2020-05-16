import * as vscode from "vscode";
import { Track } from "../../yandexApi/interfaces";
import { getArtists } from "../../yandexApi/apiUtils";
import { getThemeIcon } from "../../utils/iconUtils";

export class TrackTreeItem extends vscode.TreeItem {
  constructor(public readonly track: Track, public readonly playListId: string | number) {
    super(`${track.title} - ${getArtists(track)}`, vscode.TreeItemCollapsibleState.None);
    this.command = {
      command: "yandexMusic.play",
      title: "Play Track",
      tooltip: `Play ${this.label}`,
      arguments: [this],
    };

    this.iconPath = getThemeIcon("track.svg");
    this.contextValue = "track";
  }
}