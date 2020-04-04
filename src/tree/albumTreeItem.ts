import * as vscode from "vscode";
import { getThemeIcon } from "../utils";
import { Album } from "../yandexApi/album/album";

export class AlbumTreeItem extends vscode.TreeItem {
  constructor(public readonly album: Album) {
    super(album.title, vscode.TreeItemCollapsibleState.Collapsed);

    this.iconPath = getThemeIcon("playlist.svg");
  }
}