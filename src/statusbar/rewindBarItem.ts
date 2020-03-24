import * as vscode from "vscode";
import { Store } from "../store";
import { autorun } from "mobx";

export class RewindBarItem {
  forward: vscode.StatusBarItem;
  backward: vscode.StatusBarItem;

  constructor(private store: Store, alignment: vscode.StatusBarAlignment, priority: number) {
    this.backward = vscode.window.createStatusBarItem(alignment, priority);
    this.backward.text = "$(debug-step-back)";
    this.backward.command = "yandexMusic.rewindBackward";
    this.backward.tooltip = "Назад";

    this.forward = vscode.window.createStatusBarItem(alignment, priority - 0.1);
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
