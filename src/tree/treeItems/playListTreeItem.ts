import * as vscode from "vscode";
import { Playlist } from "yandex-music-client";
import { getPlayListIcon } from "../../utils/iconUtils";
import { getCoverUri } from "../../YandexMusicApi/ApiUtils";

export class PlayListTreeItem extends vscode.TreeItem {
  constructor(public playList: Playlist) {
    super('');
    this.update(playList);
    // contextValue should be initialized just ones in constructor, 
    // otherwise actions in context menu will not be available when contextValue is re-initialized 
    this.contextValue = 'playlist';
    this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
  }
  
  update(playList: Playlist) {
    this.playList = playList;
    this.label = playList.title;
    this.description = playList.description;
    this.tooltip = [playList.title, playList.description].join('. ');
    
    if (playList.cover?.uri) {
      const uri = getCoverUri(playList.cover.uri, 50);
      this.iconPath = vscode.Uri.parse(uri);
    } else {
      this.iconPath = getPlayListIcon(playList);
    }
  }
}
