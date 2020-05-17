import * as vscode from "vscode";
import { YandexMusicSettings } from "./settings";

export async function signIn(): Promise<void> {
  const username = await showLoginBox(YandexMusicSettings.instance.username);
  const password = await showPasswordBox(YandexMusicSettings.instance.password);

  if (username) {
    YandexMusicSettings.instance.updateUserName(username);
  }

  if (password) {
    YandexMusicSettings.instance.updatePassword(password);
  }
}

export async function showLoginBox(value?: string): Promise<string | undefined> {
  const name = await vscode.window.showInputBox({
    prompt: "Input login",
    placeHolder: "example@yandex.ru",
    value,
    validateInput: text => {
      return !text ? "Login cannot be empty!" : null;
    }
  });

  return name;
}

export async function showPasswordBox(value?: string): Promise<string | undefined> {
  const name = await vscode.window.showInputBox({
    prompt: "Input password",
    placeHolder: "Password",
    value,
    password: true,
    validateInput: text => {
      return !text ? "Password cannot be empty!" : null;
    }
  });

  return name;
}
