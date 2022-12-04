import * as vscode from "vscode";
import { PlayListTree } from "./tree/playListTree";
import { TrackTreeItem } from "./tree/treeItems";
import { Store } from "./store";
import { showSearchBox } from "./inputs";
import { ChartTree } from "./tree/chartTree";
import { RecommendationTree } from "./tree/recommendationTree";
import { SearchTree } from './tree/searchTree';
import { YandexMusicSettings } from "./settings";
import { isOnline } from "./utils/connectionUtils";
import { YandexMusicApi } from "./yandexApi/yandexMusicApi";
import { OutputTraceListener } from "./logging/OutputTraceListener";
import { defaultTraceSource } from './logging/TraceSource';
const packageJson = require('./../package');

export function activate(context: vscode.ExtensionContext) {
  const api = new YandexMusicApi();
  const store = new Store(api);
  const treeProvider = new PlayListTree(store);
  const chartProvider = new ChartTree(store);
  const recommendationProvider = new RecommendationTree(store);
  const searchProvider = new SearchTree(store);
  let playListTreeView: vscode.TreeView<any> | undefined = undefined;

  const outputTraceListener = new OutputTraceListener('Visual Studio Extension');
  outputTraceListener.addOutputChannel();
  defaultTraceSource.addTraceListener(outputTraceListener);

  defaultTraceSource.info(`Starting extension v${packageJson.version}`);

  YandexMusicSettings.init(context, api);
  const settings = YandexMusicSettings.instance;

  let isExplorerInitialized = false;

  store.initPlayer();

  async function refreshExplorer() {
    const hasConnection = await isOnline();
    if (hasConnection) {
      const authData = await YandexMusicSettings.instance.getAuthData();
      await store.init(authData);

      if (isExplorerInitialized) {
        treeProvider.refresh();
        chartProvider.refresh();
        recommendationProvider.refresh();
      } else {
        playListTreeView = vscode.window.createTreeView('yandex-music-play-lists', {
          treeDataProvider: treeProvider,
        });

        vscode.window.createTreeView("yandex-music-chart", { treeDataProvider: chartProvider });
        vscode.window.createTreeView("yandex-music-recommendations", { treeDataProvider: recommendationProvider });
        vscode.window.createTreeView("yandex-music-search", { treeDataProvider: searchProvider });

        isExplorerInitialized = true;
      }

      if (playListTreeView) {
        playListTreeView.message = store.isAuthorized() ? `Вы вошли как: ${authData?.userName}` : undefined;
      }
    } else {
      vscode.window
        .showErrorMessage('Ошибка со связью. Проверьте подключение к интернету.', "Обновить")
        .then(() => {
          vscode.commands.executeCommand("yandexMusic.refresh");
        });
    }
  }

  refreshExplorer();

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
    vscode.commands.registerCommand("yandexMusic.signIn", async () => {
      await settings.signIn();
      refreshExplorer();
    }),
    vscode.commands.registerCommand("yandexMusic.signOut", async () => {
      await settings.signOut();
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
export function deactivate() {
  YandexMusicSettings.instance.dispose();
 }
