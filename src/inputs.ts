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

export async function showTokenBox(): Promise<string | undefined> {
  const name = await vscode.window.showInputBox({
    prompt: "Введите токен [инструкция по получению токена](https://github.com/MarshalX/yandex-music-api/discussions/513)",
    placeHolder: "Токен",
    value: '',
    password: true,
    validateInput: text => {
      return !text ? "Токен не может быть пустым!" : null;
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

export async function showPlaylistNameBox(playlistName: string = '') {
  return await vscode.window.showInputBox({
    value: playlistName,
    prompt: "Название плейлиста",
    placeHolder: "Введите название плейлиста",
    validateInput: text => {
      return !text ? "Значение должно быть не пустым!" : null;
    }
  });
}

type ShowPlaylistResult = vscode.QuickPickItem & {
  id: string;
  playlist?: Playlist;
};

export async function showPlaylistsBox(store: Store): Promise<ShowPlaylistResult | undefined> {
  const resp = await store.api.getUserPlaylists();

  const names = resp.result.map<ShowPlaylistResult>(item => ({
    id: item.kind.toString(),
    label: `$(debug-start) ${item.title}`,
    description: item.description,
    playlist: item
  }));

  names.unshift({ id: 'add-playlist', label: "$(add) Добавить плейлист" });

  const selected = await vscode.window.showQuickPick(names, {
    canPickMany: false,
    placeHolder: "Название плейлиста",
  });

  return selected;
}

export async function showPrompt(title: string): Promise<boolean> {
  const result = await vscode.window.showInformationMessage(title, "Да", "Нет");
  return result === "Да";
}