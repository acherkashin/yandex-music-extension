import * as vscode from "vscode";
import { MusicProvider } from "./musicProvider";
import { PlayListTree, TrackNodeItem } from "./playListTree";
import { Player } from "./player";
import { playerControlPanel } from "./playerControlPanel";
import { Store } from "./store";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "yandex-music-extension" is now active!');

  const store = new Store();

  playerControlPanel.init();

  store.init().then(() => {
    vscode.window.registerTreeDataProvider("yandex-music-play-lists", new PlayListTree(store));
  });

  context.subscriptions.push(
    vscode.commands.registerCommand("yandexMusic.play", async (item?: TrackNodeItem) => {
      if (item) {
        store.play({ itemId: item.track.id, playListId: item.playListId });
      }
      //if item is undefined need continue play current song "store.play()"
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("yandexMusic.next", () => {
      store.next();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("yandexMusic.prev", () => {
      store.prev();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("yandexMusic.stop", () => {
      store.stop();
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
