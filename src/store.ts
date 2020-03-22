import { MusicProvider } from "./musicProvider";
import * as vscode from "vscode";
import { FeedResponse, GeneratedPlayList, Track, TrackInfo } from "./yandexApi/interfaces";
import { observable, autorun, computed } from "mobx";
import { Player } from "./player";
import { PlayerBarItem } from "./statusbar/playerBarItem";
import { RewindBarItem } from "./statusbar/rewindBarItem";

export const LIKED_TRACKS_PLAYLIST_ID = "LIKED_TRACKS_PLAYLIST_ID";
export class Store {
  private player = new Player();
  private playerControlPanel = new PlayerBarItem(this, 2000);
  private rewindPanel = new RewindBarItem(this, 2001);
  @observable isPlaying = false;
  private playLists = new Map<string | number, TrackInfo[]>();
  @observable private currentTrackIndex: number | undefined;
  //TODO add "type PlayListId = string | number | undefined;"
  @observable private currentPlayListId: string | number | undefined;

  api = new MusicProvider();

  @computed get currentTrack(): TrackInfo | null {
    if (this.currentPlayListId == null || this.currentTrackIndex == null) {
      return null;
    }
    return this.getTrack(this.currentPlayListId, this.currentTrackIndex);
  }

  @computed get nextTrack(): TrackInfo | null {
    if (this.currentPlayListId == null || this.currentTrackIndex == null) {
      return null;
    }

    return this.getTrack(this.currentPlayListId, this.currentTrackIndex + 1);
  }

  @computed get prevTrack(): TrackInfo | null {
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

  async getFeed(): Promise<FeedResponse> {
    return this.api.getFeed();
  }

  getTracks(userId: string | number | undefined, playListId: string | number) {
    return this.api.getTracks(userId, playListId).then((result) => {
      this.savePlaylist(playListId, this.exposeTracks(result.tracks));

      return result;
    });
  }

  async getLikedTracks(): Promise<TrackInfo[]> {
    const resp = await this.api._api.getLikedTracks();
    this.savePlaylist(LIKED_TRACKS_PLAYLIST_ID, resp.result);

    return resp.result;
  }

  play(track?: { itemId: string; playListId: string | number }) {
    if (track) {
      const tracks = this.playLists.get(track.playListId);
      if (tracks) {
        const index = tracks.findIndex((item) => item.id === track?.itemId);
        if (index !== -1) {
          this.currentPlayListId = track.playListId;
          this.internalPlay(index);
        }
      } else {
        console.error(`playlist ${track?.itemId}`);
      }
      // update current song
    } else {
      this.player.pause();
      this.isPlaying = true;
    }
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
      const track = this.playLists.get(this.currentPlayListId)?.[index];

      if (track) {
        const url = await this.api.getUrl(track.storageDir);
        this.player.setFile(url);
        this.player.play();
        this.isPlaying = true;
      }
    }
  }

  private exposeTracks(tracks: Track[]): TrackInfo[] {
    return tracks.map((item) => <TrackInfo>item.track);
  }

  private savePlaylist(playListId: number | string, tracks: TrackInfo[]) {
    this.playLists.set(playListId, tracks);
  }

  private getTrack(playListId: number | string, index: number): TrackInfo | null {
    const tracks = this.playLists.get(playListId);

    if (tracks == null) {
      return null;
    }

    return tracks[index];
  }
}
