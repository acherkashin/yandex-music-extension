import * as vscode from "vscode";
import { PlayListTree } from "./tree/playListTree";
import { TrackTreeItem } from "./tree/treeItems";
import { Store } from "./store";
import { showSearchBox, signIn } from "./inputs";
import { ChartTree } from "./tree/chartTree";
import { RecommendationTree } from "./tree/recommendationTree";
import { SearchTree } from './tree/searchTree';
import { YandexMusicSettings } from "./settings";
import { isOnline } from "./utils/connectionUtils";

export async function activate(context: vscode.ExtensionContext) {
  const store = new Store();
  const treeProvider = new PlayListTree(store);
  const chartProvider = new ChartTree(store);
  const recommendationProvider = new RecommendationTree(store);
  const searchProvider = new SearchTree(store);

  YandexMusicSettings.init(context.globalState);
  const settings = YandexMusicSettings.instance;

  let isExplorerInitialized = false;

  async function initExplorer() {
    await store.init();
    const playListTreeView = vscode.window.createTreeView('yandex-music-play-lists', {
      treeDataProvider: treeProvider,
    });
    playListTreeView.message = store.isAuthorized() ? `Вы вошли как: ${settings.username}` : undefined;

    vscode.window.createTreeView("yandex-music-chart", { treeDataProvider: chartProvider });
    vscode.window.createTreeView("yandex-music-recommendations", { treeDataProvider: recommendationProvider });
    vscode.window.createTreeView("yandex-music-search", { treeDataProvider: searchProvider });

    settings.onDidChangeSettings((e) => {
      if (e.affectsConfiguration("yandexMusic.credentials")) {
        vscode.commands.executeCommand("yandexMusic.refresh");
      }
    });

    isExplorerInitialized = true;
  }

  async function refreshExplorer() {
    const hasConnection = await isOnline();
    if (hasConnection) {
      if (isExplorerInitialized) {
        await store.init();
        treeProvider.refresh();
        chartProvider.refresh();
        recommendationProvider.refresh();
      } else {
        await initExplorer();
      }
    } else {
      vscode.window
        .showErrorMessage('Ошибка со связью. Проверьте подключение к интернету.', "Обновить")
        .then(() => {
          vscode.commands.executeCommand("yandexMusic.refresh");
        });
    }
  }

  await refreshExplorer();

  context.subscriptions.push(
    vscode.commands.registerCommand("yandexMusic.refresh", refreshExplorer),
    vscode.commands.registerCommand("yandexMusic.play", async (item?: TrackTreeItem) => {
      if (item) {
        store.play({ itemId: item.track.id, playListId: item.playListId.toString() });
      } else {
        store.play();
      }
    }),
    vscode.commands.registerCommand("yandexMusic.next", () => store.next()),
    vscode.commands.registerCommand("yandexMusic.prev", () => store.prev()),
    vscode.commands.registerCommand("yandexMusic.pause", () => store.pause()),
    vscode.commands.registerCommand("yandexMusic.toggleLikeCurrentTrack", async () => {
      if (store.currentTrack != null) {
        await store.toggleLikeCurrentTrack();
        await refreshExplorer();
      }
    }),
    vscode.commands.registerCommand("yandexMusic.likeTrack", async (node: TrackTreeItem) => {
      if (node.track != null) {
        store.toggleLikeTrack(node.track);
        await refreshExplorer();
      }
    }),
    vscode.commands.registerCommand("yandexMusic.dislikeTrack", async (node: TrackTreeItem) => {
      if (node.track != null) {
        store.toggleLikeTrack(node.track);
        await refreshExplorer();
      }
    }),
    vscode.commands.registerCommand("yandexMusic.rewindForward", () => store.rewind(settings.rewindTime)),
    vscode.commands.registerCommand("yandexMusic.rewindBackward", () => store.rewind(settings.rewindTime * (-1))),
    vscode.commands.registerCommand("yandexMusic.downloadTrack", (node: TrackTreeItem) => {
      store.downloadTrack(node.track);
    }),
    vscode.commands.registerCommand("yandexMusic.signIn", signIn),
    vscode.commands.registerCommand("yandexMusic.signOut", () => {
      settings.signOut();
      refreshExplorer();
    }),
    vscode.commands.registerCommand("yandexMusic.search", async () => {
      const searchText = await showSearchBox();

      if (searchText) {
        store.doSearch(searchText);
      }
    }),
    vscode.commands.registerCommand("yandexMusic.clearSearchResult", async () => {
      store.clearSearchResult();
    })
  );
}



// this method is called when your extension is deactivated
export function deactivate() { }
