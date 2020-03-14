import * as vscode from "vscode";
import { Store } from "./store";
import { autorun } from "mobx";

export class RewindBar {
  forward: vscode.StatusBarItem;
  backward: vscode.StatusBarItem;

  constructor(private store: Store, priority: number) {
    this.backward = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, priority);
    this.backward.text = "$(debug-step-back)";
    this.backward.command = "yandexMusic.rewindBackward";
    this.backward.tooltip = "Назад";

    this.forward = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, priority - 0.1);
    this.forward.text = "$(debug-step-over)";
    this.forward.command = "yandexMusic.rewindForward";
    this.forward.tooltip = "Вперед";

    autorun(() => {
      if (this.store.isPlaying) {
        this.forward.show();
        this.backward.show();
      } else {
        this.forward.hide();
        this.backward.hide();
      }
    });
  }
}
