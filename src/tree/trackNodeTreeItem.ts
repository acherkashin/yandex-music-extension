import * as vscode from "vscode";
import { Track } from "./../yandexApi/interfaces";
import { getArtists } from "./../yandexApi/apiUtils";

export class TrackNodeTreeItem extends vscode.TreeItem {
  constructor(public readonly track: Track, public readonly playListId: string | number) {
    super(`${track.title} - ${getArtists(track)}`, vscode.TreeItemCollapsibleState.None);
    this.command = {
      command: "yandexMusic.play",
      title: "Play Track",
      tooltip: `Play ${this.label}`,
      arguments: [this],
    };

    this.contextValue = "track";
  }
}