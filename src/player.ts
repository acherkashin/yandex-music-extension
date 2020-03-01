import { ChildProcessWithoutNullStreams } from "child_process";

const player = require("play-sound")({
  /*player: "mplayer"*/
});

export class Player {
  private process: ChildProcessWithoutNullStreams | undefined | null;
  constructor() {}

  play(path: string) {
    this.stop();

    this.process = player.play(path, (err) => {
      if (err) {
        throw err;
      }
    });
  }

  stop() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }
}
