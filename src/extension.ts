import * as vscode from "vscode";
import { PlayListTree } from "./tree/playListTree";
import { TrackTreeItem } from "./tree/treeItems";
import { Store } from "./store";
import { showPlaylistName, showPlaylists, showPrompt, showSearchBox } from "./inputs";
import { ChartTree } from "./tree/chartTree";
import { RecommendationTree } from "./tree/recommendationTree";
import { SearchTree } from './tree/searchTree';
import { YandexMusicSettings } from "./settings";
import { isOnline } from "./utils/connectionUtils";
import { YandexMusicApi } from "./YandexMusicApi/YandexMusicApi";
import { OutputTraceListener } from "./logging/OutputTraceListener";
import { defaultTraceSource } from './logging/TraceSource';
import { UserTrackTreeItem } from "./tree/treeItems/userTrackTreeItem";
import { UserPlayListTreeItem } from "./tree/treeItems/playListTreeItem";
const packageJson = require('./../package');

let store: Store = null as any;

export function activate(context: vscode.ExtensionContext) {
  const api = new YandexMusicApi();
  store = new Store(api);
  const treeProvider = new PlayListTree(store);
  const chartProvider = new ChartTree(store);
  const recommendationProvider = new RecommendationTree(store);
  const searchProvider = new SearchTree(store);
  let playListTreeView: vscode.TreeView<any> | undefined = undefined;

  const outputTraceListener = new OutputTraceListener('Yandex Music Extension');
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
    vscode.commands.registerCommand("yandexMusic.likeTrack", (node: TrackTreeItem) => {
      errorLogger(async () => {
        if (node.track != null) {
          store.toggleLikeTrack(node.track);
          await refreshExplorer();
        }
      }, "Like track");
    }),
    vscode.commands.registerCommand("yandexMusic.addToPlaylist", async (node: TrackTreeItem) => {
      errorLogger(async () => {
        const playlist = await showPlaylists(store);
        if (playlist) {
          await store.api.addTrackToPlaylist(playlist, node.track);
          await refreshExplorer();
        }
      }, "Add to playlist");
    }),
    vscode.commands.registerCommand("yandexMusic.removeFromPlaylist", async (node: UserTrackTreeItem) => {
      errorLogger(async () => {
        if (node.track) {
          await store.api.removeTracksFromPlaylist(node.playlist, node.track, node.index);
          await refreshExplorer();
        }
      }, "Remove from playlist");
    }),
    vscode.commands.registerCommand("yandexMusic.dislikeTrack", async (node: TrackTreeItem) => {
      errorLogger(async () => {
        if (node.track != null) {
          store.toggleLikeTrack(node.track);
          await refreshExplorer();
        }
      }, "Remove from liked tracks");
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
    }),
    vscode.commands.registerCommand("yandexMusic.renamePlaylist", (node: UserPlayListTreeItem) => {
      errorLogger(async () => {
        const newName = await showPlaylistName(node.playList.title);
        if (newName) {
          const { result } = await store.api.renamePlaylist(node.playList.kind, newName);
          node.update(result);
          treeProvider.refresh(node);
        }
      }, "Rename playlist");
    }),
    vscode.commands.registerCommand("yandexMusic.createPlaylist", () => {
      errorLogger(async () => {
        const playlistName = await showPlaylistName();
        if (playlistName) {
          await store.api.createPlaylist(playlistName);
          await refreshExplorer();
        }
      }, "Create playlist");
    }),
    vscode.commands.registerCommand("yandexMusic.deletePlaylist", (node: UserPlayListTreeItem) => {
      errorLogger(async () => {
        const result = await showPrompt(`Вы действительно хотите удалить плейлист "${node.label}"?`);
        if (result) {
          await store.api.deletePlaylist(node.playList.kind);
          await refreshExplorer();
        }
      }, "Delete playlist");
    })
  );
}

async function errorLogger(callback: () => void | Promise<void>, logPrefix: string) {
  try {
    await callback();
  } catch (_ex) {
    const ex = _ex as any;
    if (ex?.response?.data?.error?.message) {
      // TODO: logging doesn't work here for some reason
      defaultTraceSource.info(`${logPrefix} ${ex.response.data.error.message}`);
    } else {
      defaultTraceSource.info(`${logPrefix} ${JSON.stringify(ex)}`);
    }
  }
}

// this method is called when your extension is deactivated
export function deactivate() {
  YandexMusicSettings.instance.dispose();
  store.dispose();
}
