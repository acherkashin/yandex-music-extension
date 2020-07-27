import * as vscode from "vscode";
import { Track } from "../../yandexApi/interfaces";
import { getArtists } from "../../yandexApi/apiUtils";
import { getThemeIcon } from "../../utils/iconUtils";
import { ChartItem } from "../../yandexApi/landing/chartitem";
import { TrackTreeItem } from "../treeItems/trackTreeItem";

export class ChartTreeItem extends TrackTreeItem {
  constructor(item: ChartItem, public readonly playListId: string | number) {
    super(item.track, vscode.TreeItemCollapsibleState.None);
    
    this.label = `${item.chart.position}. ${item.track.title} - ${getArtists(item.track)}`;
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
