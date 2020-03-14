import * as vscode from "vscode";
import { Store } from "./store";
import { observe, autorun } from "mobx";

export class PlayerControlPanel {
  private startIndex: number = 2000;
  private prevButton: vscode.StatusBarItem;
  private playButton: vscode.StatusBarItem;
  private pauseButton: vscode.StatusBarItem;
  private nextButton: vscode.StatusBarItem;

  constructor(private store: Store) {
    this.prevButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, this.startIndex);
    this.prevButton.text = "$(chevron-left)";
    this.prevButton.command = "yandexMusic.prev";
    autorun(() => {
      this.prevButton.tooltip = `Предыдущий: ${this.store.prevTrack?.track?.title}`;
    });
    autorun(() => {
      if (this.store.hasPrevTrack) {
        this.prevButton.show();
      } else {
        this.prevButton.hide();
      }
    });

    this.playButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, this.startIndex - 1);
    this.playButton.text = "$(play)";
    this.playButton.tooltip = "Воспроизведение";
    this.playButton.command = "yandexMusic.play";

    this.pauseButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, this.startIndex - 1);
    this.pauseButton.text = "$(debug-pause)";
    this.pauseButton.tooltip = "Пауза";
    this.pauseButton.command = "yandexMusic.pause";

    this.nextButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, this.startIndex - 2);
    this.nextButton.text = "$(chevron-right)";
    this.nextButton.command = "yandexMusic.next";
    autorun(() => {
      this.nextButton.tooltip = `Следущий: ${this.store.nextTrack?.track?.title}`;
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
}
