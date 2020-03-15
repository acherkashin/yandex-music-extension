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
    vscode.commands.registerCommand("yandexMusic.pause", () => {
      store.pause();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("yandexMusic.rewindForward", () => {
      // move 15 to the settings
      store.rewind(getRewindTime());
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("yandexMusic.rewindBackward", () => {
      store.rewind(-getRewindTime());
    })
  );
}

function getRewindTime(): number {
  const defaultValue = vscode.workspace.getConfiguration("yandexMusic").inspect<number>("rewindTime")?.defaultValue;
  return vscode.workspace.getConfiguration("yandexMusic").get<number>("rewindTime") || defaultValue || 15;
}

// this method is called when your extension is deactivated
export function deactivate() {}
