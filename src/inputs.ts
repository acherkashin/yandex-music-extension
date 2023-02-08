import * as vscode from "vscode";
import { Playlist } from "yandex-music-client";
import { Store } from "./store";

export async function showLoginBox(): Promise<string | undefined> {
  const name = await vscode.window.showInputBox({
    prompt: "Введите логин",
    placeHolder: "example@yandex.ru",
    value: '',
    validateInput: text => {
      return !text ? "Логин не может быть пустым!" : null;
    }
  });

  return name;
}

export async function showPasswordBox(): Promise<string | undefined> {
  const name = await vscode.window.showInputBox({
    prompt: "Введите пароль",
    placeHolder: "пароль",
    value: '',
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

export async function showPlaylistName(playlistName: string) {
  return await vscode.window.showInputBox({
    value: playlistName,
    prompt: "Название плейлиста",
    placeHolder: "Введите название плейлиста",
    validateInput: text => {
      return !text ? "Значение должно быть не пустым!" : null;
    }
  });
}

export async function showPlaylists(store: Store): Promise<Playlist | undefined> {
  const resp = await store.api.getUserPlaylists();
  const names = resp.result.map<vscode.QuickPickItem & { playlist: Playlist }>(item => ({
    label: `$(debug-start) ${item.title}`,
    description: item.description,
    playlist: item
  }));
  const selected = await vscode.window.showQuickPick(names, {
    canPickMany: false,
    placeHolder: "Название плейлиста",
  });

  return selected?.playlist;
}

export async function showPrompt(title: string): Promise<boolean> {
  const result = await vscode.window.showInformationMessage(title, "Да", "Нет");
  return result === "Да";
}