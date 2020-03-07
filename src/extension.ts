import * as vscode from "vscode";
import { PlayListProvider } from "./playListProvider";
import { PlayListTree, TrackNodeItem } from "./playListTree";
import { Player } from "./player";
import { playerControlPanel } from "./playerControlPanel";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "yandex-music-extension" is now active!');
  const configuration = vscode.workspace.getConfiguration("yandexMusic.credentials");
  const username = configuration.get<string>("username");
  const password = configuration.get<string>("password");

  const api = new PlayListProvider();
  const player = new Player();
  playerControlPanel.init();

  if (username && password) {
    api.init(username, password).then(() => {
      vscode.window.registerTreeDataProvider("yandex-music-play-lists", new PlayListTree(api));
    });
  }

  context.subscriptions.push(
    vscode.commands.registerCommand("yandexMusic.playTrack", async (item: TrackNodeItem) => {
      const url = await api.getUrl(item.track);
      player.play(url);
      vscode.commands.executeCommand("setContext", "yandexMusic.isPlaying", true);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("yandexMusic.stopTrack", () => {
      player.stop();
      vscode.commands.executeCommand("setContext", "yandexMusic.isPlaying", false);
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
