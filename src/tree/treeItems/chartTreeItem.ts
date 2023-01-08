import * as vscode from "vscode";
import { getArtists } from "../../YandexMusicApi/ApiUtils";
import { TrackTreeItem } from "../treeItems/trackTreeItem";
import { Store } from "../../store";
import { ChartItem } from "yandex-music-client";

export class ChartTreeItem extends TrackTreeItem {
  constructor(store: Store, item: ChartItem, public readonly playListId: string | number) {
    super(store, item.track, vscode.TreeItemCollapsibleState.None);

    this.label = `${item.chart.position}. ${item.track.title} - ${getArtists(item.track)}`;
  }
}
