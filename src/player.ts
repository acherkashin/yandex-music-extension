import { spawn, exec, ChildProcessWithoutNullStreams } from "child_process";
import { EventEmitter } from "events";
const fs = require("fs");
import { createInterface, Interface } from "readline";
const validUrl = require("valid-url");

export class Player extends EventEmitter {
  childProc: ChildProcessWithoutNullStreams | null = null;
  file = "";
  rl: Interface | null = null;
  playing = false;
  volume = 100;

  constructor(path?: string, addArgs?) {
    super();

    if (typeof path !== "undefined") {
      this.setFile(path);
    }

    EventEmitter.call(this);

    exec("mplayer", function(err, stdout, stdin) {
      if (err) {
        throw new Error("Mplayer encountered an error or isn't installed.");
      }
    });
  }

  play(opts?) {
    if (this.file !== null) {
      if (opts && opts.volume) {
        this.volume = opts.volume;
      }

      var args = ["-slave", "-quiet", this.file],
        that = this;

      if (opts && opts.additionnalArgs) {
        args = args.concat(opts.additionnalArgs);
      }

      this.childProc = spawn("mplayer", args);
      this.playing = true;

      if (opts && opts.loop) {
        this.setLoop(opts.loop);
      }

      this.childProc.on("error", function(error) {
        that.emit("error");
      });

      this.childProc.on("exit", function(code, sig) {
        if (code === 0 && sig === null) {
          that.playing = false;
          that.emit("end");
        }
      });

      this.rl = createInterface({
        input: this.childProc.stdout,
        output: this.childProc.stdin,
      });
    }
  }

  checkPlaying() {
    return this.playing;
  }

  quit() {
    if (this.childProc !== null) {
      this.playing = false;
      this.childProc.stdin.write("quit\n");
    }
  }

  getPercentPosition(callback) {
    if (this.childProc !== null && this.rl !== null) {
      this.rl.question("get_percent_pos\n", function(answer) {
        callback(answer.split("=")[1]);
      });
    }
  }

  stop() {
    if (this.childProc !== null) {
      this.childProc.stdin.write("stop\n");
      this.playing = false;
    }
  }

  pause() {
    if (this.childProc !== null) {
      this.childProc.stdin.write("pause\n");
    }
  }

  mute() {
    if (this.childProc !== null) {
      this.childProc.stdin.write("mute\n");
    }
  }

  setVolume(volume) {
    if (this.childProc !== null) {
      this.volume = volume;
      this.childProc.stdin.write("volume " + volume + " 1\n");
    }
  }

  seek(sec) {
    if (this.childProc !== null) {
      this.childProc.stdin.write("seek " + sec + " 2\n");
    }
  }

  setLoop(times) {
    if (this.childProc !== null) {
      this.childProc.stdin.write("loop " + times + "\n");
    }
  }

  setSpeed(speed) {
    if (this.childProc !== null) {
      this.childProc.stdin.write("speed_set " + speed + "\n");
    }
  }

  setFile(path) {
    if (this.childProc) {
      this.quit();
    }
    if (fs.existsSync(path) || validUrl.isUri(path)) {
      this.file = path;
    } else {
      throw new Error("File '" + path + "' not found!");
    }
  }

  getTimeLength(callback) {
    if (this.childProc !== null && this.rl !== null) {
      this.rl.question("get_time_length\n", function(answer) {
        callback(answer.split("=")[1]);
      });
    }
  }

  getTimePosition(callback) {
    if (this.childProc !== null && this.rl !== null) {
      this.rl.question("get_time_pos\n", (answer) => {
        var splittedAns = answer.split("=");

        if (splittedAns[0] === "ANS_TIME_POSITION") {
          callback(splittedAns[1]);
        } else {
          // Try again :(
          this.getTimePosition(callback);
        }
      });
    }
  }

  getVolume(callback) {
    return callback(this.volume);
  }
}
