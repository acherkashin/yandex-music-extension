import * as vscode from "vscode";
import { Album } from "yandex-music-client";
import { getThemeIcon } from "../../utils/iconUtils";
import { getCoverUri } from "../../yandexApi/apiUtils";

export class AlbumTreeItem extends vscode.TreeItem {
  constructor(public readonly album: Album) {
    super(album.title, vscode.TreeItemCollapsibleState.Collapsed);

    if (album.coverUri) {
      const uri = getCoverUri(album.coverUri, 50);
      this.iconPath = vscode.Uri.parse(uri);
    } else {
      this.iconPath = getThemeIcon("playlist.svg");
    }
  }
}