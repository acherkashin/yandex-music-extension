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
    this.prevButton.show();

    this.playButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, this.startIndex - 1);
    this.playButton.text = "$(play)";
    this.playButton.command = "yandexMusic.play";

    this.pauseButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, this.startIndex - 1);
    this.pauseButton.text = "$(debug-pause)";
    this.pauseButton.command = "yandexMusic.pause";

    this.nextButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, this.startIndex - 2);
    this.nextButton.text = "$(chevron-right)";
    this.nextButton.command = "yandexMusic.next";
    this.nextButton.show();

    autorun((change) => {
      this.update(store.isPlaying);
    });

    this.update(store.isPlaying);
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
