import * as vscode from "vscode";
import { PlayListTree } from "./tree/playListTree";
import { TrackTreeItem } from "./tree/treeItems";
import { Store } from "./store";
import { signIn } from "./inputs";
import { ChartTree } from "./tree/chartTree";
import { RecommendationTree } from "./tree/recommendationTree";
import { YandexMusicSettings } from "./settings";

export function activate(context: vscode.ExtensionContext) {
  const store = new Store();
  const treeProvider = new PlayListTree(store);
  const chartProvider = new ChartTree(store);
  const recommendationProvider = new RecommendationTree(store);

  YandexMusicSettings.init(context.globalState);
  const settings = YandexMusicSettings.instance;

  store.init().then(() => {
    const treeView = vscode.window.createTreeView('yandex-music-play-lists', {
      treeDataProvider: treeProvider,
    });
    treeView.message = `Вы вошли как: ${settings.username}`;
    vscode.window.registerTreeDataProvider("yandex-music-play-lists", treeProvider);
    vscode.window.registerTreeDataProvider("yandex-music-chart", chartProvider);
    vscode.window.registerTreeDataProvider("yandex-music-recommendations", recommendationProvider);
  });

  settings.onDidChangeSettings((e) => {
    if (e.affectsConfiguration("yandexMusic.credentials")) {
      store.init().then(() => {
        treeProvider.refresh();
        chartProvider.refresh();
      });
    }
  });

  context.subscriptions.push(
    vscode.commands.registerCommand("yandexMusic.play", async (item?: TrackTreeItem) => {
      if (item) {
        store.play({ itemId: item.track.id, playListId: item.playListId });
      } else {
        store.play();
      }
    }),
    vscode.commands.registerCommand("yandexMusic.next", () => store.next()),
    vscode.commands.registerCommand("yandexMusic.prev", () => store.prev()),
    vscode.commands.registerCommand("yandexMusic.pause", () => store.pause()),
    vscode.commands.registerCommand("yandexMusic.rewindForward", () => store.rewind(settings.rewindTime)),
    vscode.commands.registerCommand("yandexMusic.rewindBackward", () => store.rewind(settings.rewindTime * (-1))),
    vscode.commands.registerCommand("yandexMusic.downloadTrack", (node: TrackTreeItem) => {
      store.downloadTrack(node.track);
    }),
    vscode.commands.registerCommand("yandexMusic.signIn", signIn),
  );
}



// this method is called when your extension is deactivated
export function deactivate() { }
