import * as vscode from "vscode";
import { join } from 'path';
import { EventEmitter } from "events";
import { spawn, ChildProcess } from "child_process";

export class ElectronPlayer extends EventEmitter {
  childProcess: ChildProcess | undefined;

  constructor() {
    super();
    const extensionPath = vscode.extensions.getExtension('Cherkashin Alexander.yandex-music-extension')?.extensionPath;

    if (extensionPath) {
      const fullPath = join(extensionPath, "./out/electron/main.js");
      const electronPath = join(extensionPath, "node_modules\\electron\\dist\\electron.exe");
      var spawn_env = JSON.parse(JSON.stringify(process.env));
      delete spawn_env.ATOM_SHELL_INTERNAL_RUN_AS_NODE;
      delete spawn_env.ELECTRON_RUN_AS_NODE;
      // var spawn = require('child_process').spawn;
      this.childProcess = spawn(electronPath, [fullPath], {
        env: spawn_env,
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      });

      this.childProcess.on("error", (error) => {
        console.log(error);
      });
      this.childProcess.on("exit", (code, sig) => {
        console.log(code);
        console.log(sig);
      });
      this.childProcess.on('message', (eventName) => {
        switch (eventName) {
          case "ended": this.emit('ended'); break;
        }
      });
    }
  }

  /**
   * Plays audio by given @param url, if url is empty it will resume song which was paused
   * @param url 
   */
  play(url?: string) {
    this.childProcess?.send(JSON.stringify({
      command: "play",
      payload: url
    }));
  }

  pause() {
    this.childProcess?.send(JSON.stringify({
      command: "pause",
    }));
  }

  /**
   * Rewinds audio backward/forward on given value in seconds.
   * @param sec if positive number rewind forward on provided value. if negative number rewind backward.
   */
  rewind(sec: number) {
    this.childProcess?.send(JSON.stringify({
      command: "rewind",
      payload: sec
    }));
  }
}