import * as vscode from "vscode";
import { EventEmitter } from "events";
import { spawn, ChildProcess } from "child_process";
import { IPlayer } from "./player";
import { getElectronAppPath, getElectronFileName } from "../utils/extensionUtils";
import { downloadElectron, extractElectron } from "../electron/downloadElectron";
import { join } from "path";
import { defaultTraceSource } from "../logging/TraceSource";

export interface IPlayPayload {
  url: string;
  title: string;
  artist: string;
  album: string;
  coverUri: string;
}

export class ElectronPlayer extends EventEmitter implements IPlayer {
  childProcess: ChildProcess | undefined;

  constructor() {
    super();

  }

  async init() {
    // https://stackoverflow.com/a/51517518
    const spawn_env: NodeJS.ProcessEnv = JSON.parse(JSON.stringify(process.env));
    delete spawn_env.ATOM_SHELL_INTERNAL_RUN_AS_NODE;
    delete spawn_env.ELECTRON_RUN_AS_NODE;

    const zipPath = await vscode.window.withProgress({
      location: vscode.ProgressLocation.Window,
      title: "Downloading electron"
    }, () => downloadElectron());

    const path = await vscode.window.withProgress({
      location: vscode.ProgressLocation.Window,
      title: "Extracting electron"
    }, () => extractElectron(zipPath));

    const electronPath = join(path, getElectronFileName());
    const electronAppPath = getElectronAppPath();
    defaultTraceSource.info(`Starting electron: "${electronPath} ${electronAppPath}"`);

    this.childProcess = spawn(electronPath, [electronAppPath], {
      env: spawn_env,
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    });

    this.childProcess.on("error", (error) => {
      this.emit('error', error);
    });
    this.childProcess.on("exit", (code, sig) => {
      console.log(`exited with code: ${code} and signal: ${sig}`);
    });
    // listen for events from 
    this.childProcess.on('message', (eventName) => {
      switch (eventName) {
        case "ended": this.emit('ended'); break;
      }
    });
  }

  play(trackinfo?: IPlayPayload) {
    this.childProcess?.send(JSON.stringify({
      command: "play",
      payload: trackinfo
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
