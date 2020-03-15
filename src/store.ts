import { MusicProvider } from "./musicProvider";
import * as vscode from "vscode";
import { FeedResponse, GeneratedPlayList, Track } from "./yandexApi/interfaces";
import { observable, autorun, computed } from "mobx";
import { Player } from "./player";
import { PlayerBarItem } from "./statusbar/playerBarItem";
import { RewindBarItem } from "./statusbar/rewindBarItem";

export class Store {
  private player = new Player();
  private playerControlPanel = new PlayerBarItem(this, 2000);
  private rewindPanel = new RewindBarItem(this, 2001);
  @observable isPlaying = false;
  private playLists = new Map<string | number, GeneratedPlayList>();
  @observable private currentTrackIndex: number | undefined;
  //TODO add "type PlayListId = string | number | undefined;"
  @observable private currentPlayListId: string | number | undefined;

  api = new MusicProvider();

  @computed get currentTrack(): Track | null {
    if (this.currentPlayListId == null || this.currentTrackIndex == null) {
      return null;
    }
    return this.getTrack(this.currentPlayListId, this.currentTrackIndex);
  }

  @computed get nextTrack(): Track | null {
    if (this.currentPlayListId == null || this.currentTrackIndex == null) {
      return null;
    }

    return this.getTrack(this.currentPlayListId, this.currentTrackIndex + 1);
  }

  @computed get prevTrack(): Track | null {
    if (this.currentPlayListId == null || this.currentTrackIndex == null) {
      return null;
    }

    return this.getTrack(this.currentPlayListId, this.currentTrackIndex - 1);
  }

  @computed get hasNextTrack(): boolean {
    return this.nextTrack == null ? false : true;
  }

  @computed get hasPrevTrack(): boolean {
    return this.prevTrack == null ? false : true;
  }

  constructor() {}
  async init(): Promise<void> {
    const configuration = vscode.workspace.getConfiguration("yandexMusic.credentials");
    const username = configuration.get<string>("username");
    const password = configuration.get<string>("password");
    if (username && password) {
      await this.api.init(username, password);
    }

    this.player.on("end", () => {
      this.next();
    });

    autorun(() => {
      vscode.commands.executeCommand("setContext", "yandexMusic.isPlaying", this.isPlaying);
    });
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
      this.player.pause();
      this.isPlaying = true;
    }
  }

  stop() {
    this.player.stop();
    this.isPlaying = false;
  }

  pause() {
    this.player.pause();
    this.isPlaying = false;
  }

  rewind(sec: number) {
    this.player.rewind(sec);
  }

  next() {
    this.internalPlay((this.currentTrackIndex ?? 0) + 1);
  }

  prev() {
    this.internalPlay((this.currentTrackIndex ?? 1) - 1);
  }

  /**
   *
   * @param index Song index of current playList
   */
  private async internalPlay(index: number) {
    this.currentTrackIndex = index;

    if (this.currentPlayListId) {
      const item = this.playLists.get(this.currentPlayListId)?.tracks[index];

      if (item && item.track) {
        const url = await this.api.getUrl(item.track.storageDir);
        this.player.setFile(url);
        this.player.play();
        this.isPlaying = true;
      }
    }
  }

  private getTrack(playListId: number | string, index: number): Track | null {
    const playList = this.playLists.get(playListId);

    if (playList == null) {
      return null;
    }

    return playList.tracks[index];
  }
}
