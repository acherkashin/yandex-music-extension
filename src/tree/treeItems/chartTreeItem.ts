import * as vscode from "vscode";
import { getArtists } from "../../yandexApi/apiUtils";
import { ChartItem } from "../../yandexApi/landing/chartitem";
import { TrackTreeItem } from "../treeItems/trackTreeItem";
import { Store } from "../../store";

export class ChartTreeItem extends TrackTreeItem {
  constructor(store: Store, item: ChartItem, public readonly playListId: string | number) {
    super(store, item.track, vscode.TreeItemCollapsibleState.None);

    this.label = `${item.chart.position}. ${item.track.title} - ${getArtists(item.track)}`;
  }
}
