import { ChildProcessWithoutNullStreams } from "child_process";
import MPlayer = require("mplayer");
var player = new MPlayer();

export class Player {
  constructor() {}

  play(path: string) {
    player.openFile(path);
  }

  stop() {
    player.stop();
  }
}
