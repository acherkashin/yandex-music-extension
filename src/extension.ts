/// <reference path="./../typings/yandex-music-api/yandex-music-api.d.ts"/>
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import YandexMusicApi = require("yandex-music-api");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "yandex-music-extension" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("extension.helloWorld", () => {
    const api = new YandexMusicApi();

    api
      .init({ username: "cherkalexander@yandex.ru", password: "***" })
      .then((result) => {
        api.getFeed().then(
          (feed) => {
            console.log(feed);
          },
          (error) => {
            console.log(error);
          }
        );
      })
      .catch(function() {
        vscode.window.showInformationMessage("Fail!");
      });

    // Display a message box to the user
    vscode.window.showInformationMessage("Hello World!");
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
