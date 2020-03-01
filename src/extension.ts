import * as vscode from "vscode";
import { PlayListProvider } from "./playListProvider";
import { PlayListTree, TrackNodeItem } from "./playListTree";
import { Player } from "./player";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "yandex-music-extension" is now active!');
  const configuration = vscode.workspace.getConfiguration("yandexMusic.credentials");
  const username = configuration.get<string>("username");
  const password = configuration.get<string>("password");

  const api = new PlayListProvider();
  const player = new Player();

  if (username && password) {
    api.init(username, password).then(() => {
      vscode.window.registerTreeDataProvider("yandex-music-play-lists", new PlayListTree(api));
    });
  }

  let disposable = vscode.commands.registerCommand("extension.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World!");
  });

  vscode.commands.registerCommand("yandexMusic.playTrack", async (item: TrackNodeItem) => {
    const url = await api.getUrl(item.track);
    player.play(url);
  });

  vscode.commands.registerCommand("yandexMusic.stopTrack", () => {
    player.stop();
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
