import * as vscode from "vscode";
import { Store } from "../store";
import { autorun } from "mobx";
import { getTrackShortName, getTrackFullName } from "../yandexApi/apiUtils";
import { Track } from "../yandexApi/interfaces";

export class PlayerBarItem {
  private prevButton: vscode.StatusBarItem;
  private playButton: vscode.StatusBarItem;
  private pauseButton: vscode.StatusBarItem;
  private nextButton: vscode.StatusBarItem;
  private currentTrack: vscode.StatusBarItem;
  private likeTrack: vscode.StatusBarItem;

  constructor(private store: Store, alignment: vscode.StatusBarAlignment, priority: number) {
    this.prevButton = vscode.window.createStatusBarItem(alignment, priority);
    this.prevButton.text = "$(chevron-left)";
    this.prevButton.command = "yandexMusic.prev";
    autorun(() => {
      this.prevButton.tooltip = `Предыдущий: ${this.store.prevTrack?.title}`;
    });
    autorun(() => {
      if (this.store.hasPrevTrack) {
        this.prevButton.show();
      } else {
        this.prevButton.hide();
      }
    });

    this.playButton = vscode.window.createStatusBarItem(alignment, priority - 0.1);
    this.playButton.text = "$(play)";
    this.playButton.tooltip = "Воспроизведение";
    this.playButton.command = "yandexMusic.play";

    this.pauseButton = vscode.window.createStatusBarItem(alignment, priority - 0.2);
    this.pauseButton.text = "$(debug-pause)";
    this.pauseButton.tooltip = "Пауза";
    this.pauseButton.command = "yandexMusic.pause";

    this.nextButton = vscode.window.createStatusBarItem(alignment, priority - 0.3);
    this.nextButton.text = "$(chevron-right)";
    this.nextButton.command = "yandexMusic.next";

    this.currentTrack = vscode.window.createStatusBarItem(alignment, priority - 0.4);

    autorun(() => {
      if (this.store.hasCurrentTrack) {
        this.currentTrack.show();
      } else {
        this.currentTrack.hide();
      }
    });

    this.likeTrack = vscode.window.createStatusBarItem(alignment, priority - 0.5);
    this.likeTrack.text = "$(heart)";
    this.likeTrack.command = "yandexMusic.likeCurrentTrack";

    autorun(() => {
      this.currentTrack.text = getTrackShortName(store.currentTrack?.title || "");
      this.currentTrack.tooltip = store.hasCurrentTrack ? getTrackFullName(<Track>store.currentTrack) : "";
      this.likeTrack.tooltip = this.getLikeTooltip();
      this.likeTrack.color = this.getLikeTrackColor();
    });

    autorun(() => {
      if (this.store.hasCurrentTrack && this.store.isAuthorized()) {
        this.likeTrack.show();
      } else {
        this.likeTrack.hide();
      }
    });

    autorun(() => {
      this.nextButton.tooltip = `Следущий: ${this.store.nextTrack?.title}`;
    });

    autorun(() => {
      if (this.store.hasNextTrack) {
        this.nextButton.show();
      } else {
        this.nextButton.hide();
      }
    });

    autorun((change) => {
      this.update(store.isPlaying);
    });
  }

  update(isPlaying: boolean) {
    if (isPlaying) {
      this.playButton.hide();
      this.pauseButton.show();
    } else {
      this.playButton.show();
      this.pauseButton.hide();
    }
  }

  private getLikeTooltip() {
    return this.store.currentTrack && this.store.isLikedTrack(this.store.currentTrack.id) ?
    'Вам нравится этот трек, а ещё он добавлен в раздел "Моя коллекция"':
    'Сделайте рекомендации точнее и добавьте трек в раздел "Моя коллекция"' ;
  }

  private getLikeTrackColor() {
    return this.store.currentTrack && this.store.isLikedTrack(this.store.currentTrack.id) ? "red" : "gray";
  }
}
