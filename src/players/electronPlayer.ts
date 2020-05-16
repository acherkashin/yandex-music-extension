import { EventEmitter } from "events";
import { spawn, ChildProcess } from "child_process";
import { IPlayer } from "./player";
import { getElectronPath, getElectronAppPath } from "../utils/extensionUtils";

export class ElectronPlayer extends EventEmitter implements IPlayer {
  childProcess: ChildProcess | undefined;

  constructor() {
    super();
    var spawn_env = JSON.parse(JSON.stringify(process.env));
    delete spawn_env.ATOM_SHELL_INTERNAL_RUN_AS_NODE;
    delete spawn_env.ELECTRON_RUN_AS_NODE;

    this.childProcess = spawn(getElectronPath(), [getElectronAppPath()], {
      env: spawn_env,
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    });

    this.childProcess.on("error", (error) => {
      this.emit('error', error);
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

  rewind(sec: number) {
    this.childProcess?.send(JSON.stringify({
      command: "rewind",
      payload: sec
    }));
  }
}