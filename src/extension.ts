import * as vscode from "vscode";
import { PlayListTree } from "./tree/playListTree";
import { AlbumTreeItem, ArtistTreeItem, PlayListTreeItem, TrackTreeItem } from "./tree/treeItems";
import { Store } from "./store";
import { showPlaylistNameBox, showPlaylistsBox, showPrompt, showSearchBox } from "./inputs";
import { ChartTree } from "./tree/chartTree";
import { RecommendationTree } from "./tree/recommendationTree";
import { SearchTree } from './tree/searchTree';
import { YandexMusicSettings } from "./settings";
import { isOnline } from "./utils/connectionUtils";
import { YandexMusicApi } from "./YandexMusicApi/YandexMusicApi";
import { OutputTraceListener } from "./logging/OutputTraceListener";
import { defaultTraceSource } from './logging/TraceSource';
import { UserPlayListTreeItem, UserTrackTreeItem } from "./tree/treeItems";
import { Playlist } from "yandex-music-client";
import { errorLogger } from "./logging/ErrorLogger";
import open = require("open");
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
        .then((result) => {
          if (!result) { return; }

          vscode.commands.executeCommand("yandexMusic.refresh");
        });
    }
  }

  async function createPlaylist(): Promise<Playlist | undefined> {
    const playlistName = await showPlaylistNameBox();
    let playlist: Playlist | undefined;
    if (playlistName) {
      playlist = (await store.api.createPlaylist(playlistName)).result;
      await refreshExplorer();
    }

    return playlist;
  }

  refreshExplorer();

  context.subscriptions.push(
    vscode.commands.registerCommand("yandexMusic.refresh", errorLogger(refreshExplorer)),
    vscode.commands.registerCommand("yandexMusic.play", errorLogger(async (item?: TrackTreeItem) => {
      if (item) {
        store.play({ itemId: item.track.id, playListId: item.playListId.toString() });
      } else {
        store.play();
      }
    })),
    vscode.commands.registerCommand("yandexMusic.playRadio", errorLogger(async (radioId: string) => {
      await store.startRadio(radioId);
    })),
    vscode.commands.registerCommand("yandexMusic.next", errorLogger(() => store.next('skip'))),
    vscode.commands.registerCommand("yandexMusic.prev", errorLogger(() => store.prev())),
    vscode.commands.registerCommand("yandexMusic.pause", errorLogger(() => store.pause())),
    vscode.commands.registerCommand("yandexMusic.toggleLikeCurrentTrack", errorLogger(async () => {
      if (store.currentTrack != null) {
        await store.toggleLikeCurrentTrack();
        await refreshExplorer();
      }
    }), "Toggle like current track"),
    vscode.commands.registerCommand("yandexMusic.likeTrack", errorLogger(async (node: TrackTreeItem) => {
      if (node.track != null) {
        store.toggleLikeTrack(node.track);
        await refreshExplorer();
      }
    }), "Like track"),
    vscode.commands.registerCommand("yandexMusic.addToPlaylist", errorLogger(async (node: TrackTreeItem) => {
      const selected = await showPlaylistsBox(store);
      let playlist = selected?.playlist;
      if (selected?.id === 'add-playlist') {
        playlist = await createPlaylist();
      }

      if (playlist) {
        await store.api.addTrackToPlaylist(playlist, node.track);
        await refreshExplorer();
      }
    }), "Add to playlist"),
    vscode.commands.registerCommand("yandexMusic.removeFromPlaylist", errorLogger(async (node: UserTrackTreeItem) => {
      if (node.track) {
        await store.api.removeTracksFromPlaylist(node.playlist, node.track, node.index);
        await refreshExplorer();
      }
    }), "Remove from playlist"),
    vscode.commands.registerCommand("yandexMusic.dislikeTrack", errorLogger(async (node: TrackTreeItem) => {
      if (node.track != null) {
        store.toggleLikeTrack(node.track);
        await refreshExplorer();
      }
    }), "Remove from liked tracks"),
    vscode.commands.registerCommand("yandexMusic.rewindForward", errorLogger(() => store.rewind(settings.rewindTime))),
    vscode.commands.registerCommand("yandexMusic.rewindBackward", errorLogger(() => store.rewind(settings.rewindTime * (-1)))),
    vscode.commands.registerCommand("yandexMusic.downloadTrack", errorLogger((node: TrackTreeItem) => {
      store.downloadTrack(node.track);
    })),
    vscode.commands.registerCommand("yandexMusic.signIn", errorLogger(async () => {
      await settings.signIn();
      refreshExplorer();
    }), "Sign in"),
    vscode.commands.registerCommand("yandexMusic.signInToken", errorLogger(async () => {
      await settings.signInToken();
      refreshExplorer();
    }), "Sign in"),
    vscode.commands.registerCommand("yandexMusic.signOut", errorLogger(async () => {
      await settings.signOut();
      refreshExplorer();
    }), "Sign out"),
    vscode.commands.registerCommand("yandexMusic.search", errorLogger(async () => {
      const searchText = await showSearchBox();

      if (searchText) {
        store.doSearch(searchText);
      }
    }), "Search"),
    vscode.commands.registerCommand("yandexMusic.clearSearchResult", errorLogger(() => {
      store.clearSearchResult();
    }), "Clear search result"),
    vscode.commands.registerCommand("yandexMusic.renamePlaylist", errorLogger(async (node: UserPlayListTreeItem) => {
      const newName = await showPlaylistNameBox(node.playList.title);
      if (newName) {
        const { result } = await store.api.renamePlaylist(node.playList.kind, newName);
        node.update(result);
        treeProvider.refresh(node);
      }
    }), "Rename playlist"),
    vscode.commands.registerCommand("yandexMusic.createPlaylist", errorLogger(createPlaylist, "Create playlist")),
    vscode.commands.registerCommand("yandexMusic.deletePlaylist", errorLogger(async (node: UserPlayListTreeItem) => {
      const result = await showPrompt(`Вы действительно хотите удалить плейлист "${node.label}"?`);
      if (result) {
        await store.api.deletePlaylist(node.playList.kind);
        await refreshExplorer();
      }
    }, "Delete playlist")),
    vscode.commands.registerCommand("yandexMusic.openInBrowser", errorLogger(async (node) => {
      if (node instanceof ArtistTreeItem) {
        open(`https://music.yandex.ru/artist/${node.artist.id}`);
      } else if (node instanceof AlbumTreeItem) {
        open(`https://music.yandex.ru/album/${node.album.id}`);
      } else if (node instanceof PlayListTreeItem) {
        open(`https://music.yandex.ru/users/${node.playList.owner.login}/playlists/${node.playList.kind}`);
      } else if (node instanceof TrackTreeItem) {
        open(`https://music.yandex.ru/album/${node.track.albums[0].id}/track/${node.track.id}`);
      }
    })),
  );
}

// this method is called when your extension is deactivated
export function deactivate() {
  YandexMusicSettings.instance.dispose();
  store.dispose();
}
