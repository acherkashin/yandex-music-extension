import { observable, action, computed, observe } from "mobx";
import { MusicProvider } from "./musicProvider";
import * as vscode from "vscode";
import { timingSafeEqual } from "crypto";
import { FeedResponse, GeneratedPlayList } from "./yandexApi/interfaces";
import MPlayer = require("mplayer");

export class Store {
  private player = new MPlayer();
  private playLists = new Map<string | number, GeneratedPlayList>();
  private currentSongIndex: number | undefined;
  //TODO add "type PlayListId = string | number | undefined;"
  private currentPlayListId: string | number | undefined;

  api = new MusicProvider();

  constructor() {}
  async init(): Promise<void> {
    const configuration = vscode.workspace.getConfiguration("yandexMusic.credentials");
    const username = configuration.get<string>("username");
    const password = configuration.get<string>("password");
    if (username && password) {
      await this.api.init(username, password);
    }
  }

  getPlayLists(): Promise<FeedResponse> {
    return this.api.getPlayLists();
  }

  getTracks(userId: string | number | undefined, playListId: string | number) {
    return this.api.getTracks(userId, playListId).then((result) => {
      this.playLists.set(playListId, result);

      return result;
    });
  }

  play(song?: { itemId: string; playListId: string | number }) {
    if (song) {
      const playList = this.playLists.get(song.playListId);
      if (playList) {
        const index = playList.tracks.findIndex((item) => item.track?.id === song?.itemId);
        if (index !== -1) {
          this.currentPlayListId = song.playListId;
          this.internalPlay(index);
        }
      } else {
        console.error(`playlist ${song?.itemId}`);
      }
      // update current song
    } else {
      this.player.play();
    }
  }

  stop() {
    this.player.stop();
    vscode.commands.executeCommand("setContext", "yandexMusic.isPlaying", false);
  }

  next() {
    this.internalPlay((this.currentSongIndex ?? 0) + 1);
  }

  prev() {
    this.internalPlay((this.currentSongIndex ?? 1) - 1);
  }

  /**
   *
   * @param index Song index of current playList
   */
  private async internalPlay(index: number) {
    this.currentSongIndex = index;

    if (this.currentPlayListId) {
      const item = this.playLists.get(this.currentPlayListId)?.tracks[index];

      if (item && item.track) {
        const url = await this.api.getUrl(item.track.storageDir);
        this.player.stop();
        this.player.openFile(url);
        //TODO: add isPlaying observable flag
        vscode.commands.executeCommand("setContext", "yandexMusic.isPlaying", true);
      }
    }
  }
}
