import * as vscode from "vscode";

class PlayerControlPanel {
  private startIndex: number = 2000;
  private prevButton: vscode.StatusBarItem;
  private playButton: vscode.StatusBarItem;
  private nextButton: vscode.StatusBarItem;

  constructor() {
    this.prevButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, this.startIndex);
    this.prevButton.text = "$(chevron-left)";
    this.prevButton.show();

    this.playButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, this.startIndex - 1);
    this.playButton.text = "$(play)";
    this.playButton.show();

    this.nextButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, this.startIndex - 2);
    this.nextButton.text = "$(chevron-right)";
    this.nextButton.show();
  }
  
  init() {
    
  }
}

const playerControlPanel = new PlayerControlPanel();

export { playerControlPanel };
