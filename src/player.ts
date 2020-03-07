import MPlayer = require("mplayer");

export class Player {
  player = new MPlayer();
  constructor() {}

  play(path: string) {
    this.player.openFile(path);
  }

  stop() {
    this.player.stop();
  }
}
