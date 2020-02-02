import * as vscode from "vscode";
import { PlayListProvider } from "./playListProvider";
import { PlayListTree } from "./playListTree";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "yandex-music-extension" is now active!');
  const configuration = vscode.workspace.getConfiguration("yandexMusic.credentials");
  const username = configuration.get<string>("username");
  const password = configuration.get<string>("password");

  if (username && password) {
    const api = new PlayListProvider();

    api.init(username, password).then(() => {
      vscode.window.registerTreeDataProvider("yandex-music-play-lists", new PlayListTree(api));
    });
  }

  let disposable = vscode.commands.registerCommand("extension.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World!");
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
