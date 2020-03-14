import * as vscode from "vscode";
import { PlayListTree, TrackNodeItem } from "./playListTree";
import { Store } from "./store";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "yandex-music-extension" is now active!');

  const store = new Store();

  store.init().then(() => {
    vscode.window.registerTreeDataProvider("yandex-music-play-lists", new PlayListTree(store));
  });

  context.subscriptions.push(
    vscode.commands.registerCommand("yandexMusic.play", async (item?: TrackNodeItem) => {
      if (item) {
        store.play({ itemId: item.track.id, playListId: item.playListId });
      } else {
        store.play();
      }
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

  context.subscriptions.push(
    vscode.commands.registerCommand("yandexMusic.pause", () => {
      store.pause();
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
