import * as vscode from "vscode";
import { PlayListTree } from "./tree/playListTree";
import { TrackTreeItem } from "./tree/treeItems";
import { Store } from "./store";
import { showPasswordBox, showUserNameBox } from "./inputs";
import { ChartTree } from "./tree/chartTree";
import { RecommendationTree } from "./tree/recommendationTree";
import { YandexMusicSettings } from "./settings";

export function activate(context: vscode.ExtensionContext) {
  const store = new Store();
  const treeProvider = new PlayListTree(store);
  const chartProvider = new ChartTree(store);
  const recommendationProvider = new RecommendationTree(store);
  const settings = YandexMusicSettings.getInstance();

  store.init().then(() => {
    vscode.window.registerTreeDataProvider("yandex-music-play-lists", treeProvider);
    vscode.window.registerTreeDataProvider("yandex-music-chart", chartProvider);
    vscode.window.registerTreeDataProvider("yandex-music-recommendations", recommendationProvider);
  });

  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("yandexMusic.credentials") || e.affectsConfiguration("yandexMusic.credentials")) {
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
    vscode.commands.registerCommand("yandexMusic.connect", async () => {
      const username = await showUserNameBox(settings.username);

      if (!username) {
        return;
      } else {
        settings.updateUserName(username);
      }

      const password = await showPasswordBox(settings.password);

      if (!password) {
        return;
      } else {
        settings.updatePassword(password);
      }

      //TODO: need to refresh tree
    }),
  );
}



// this method is called when your extension is deactivated
export function deactivate() { }
