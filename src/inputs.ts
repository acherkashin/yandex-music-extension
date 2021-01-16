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
    prompt: "Введите логин",
    placeHolder: "example@yandex.ru",
    value,
    validateInput: text => {
      return !text ? "Логин не может быть пустым!" : null;
    }
  });

  return name;
}

export async function showPasswordBox(value?: string): Promise<string | undefined> {
  const name = await vscode.window.showInputBox({
    prompt: "Введите пароль",
    placeHolder: "пароль",
    value,
    password: true,
    validateInput: text => {
      return !text ? "Пароль не может быть пустым!" : null;
    }
  });

  return name;
}

export async function showSearchBox() {
  // TODO: show search history like on music.yandex.ru
  const name = await vscode.window.showInputBox({
    prompt: "Поиск",
    placeHolder: "Трек, альбом, исполнитель, подкаст",
    validateInput: text => {
      return !text ? "Значение должно быть не пустым!" : null;
    }
  });

  return name;
}
