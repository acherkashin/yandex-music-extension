import * as vscode from "vscode";
import { EventEmitter } from "events";
import { spawn, exec, ChildProcess } from "child_process";
import { IPlayer } from "./player";
import { getElectronAppPath, getElectronFileName } from "../utils/extensionUtils";
import { downloadElectron, extractElectron } from "../electron/downloadElectron";
import { join } from "path";
import { defaultTraceSource } from "../logging/TraceSource";
import { YandexMusicSettings } from "../settings";

export interface IPlayPayload {
  url: string;
  title: string;
  artist: string;
  album: string;
  coverUri: string;
}

export class ElectronPlayer extends EventEmitter implements IPlayer {
  childProcess: ChildProcess | undefined;
  killElectron: (() => void) | null = null;

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
    const startOptions = this.createStartOptions();
    defaultTraceSource.info(`Starting electron: "${electronPath} ${electronAppPath} ${startOptions}"`);

    this.childProcess = spawn(electronPath, [electronAppPath, startOptions], {
      env: spawn_env,
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    });
    this.killElectron = () => {
      // From VS Code's debugAdapter comments:
      // when killing a process in windows its child
      // processes are *not* killed but become root
      // processes. Therefore we use TASKKILL.EXE
      if (process.platform === 'win32') {
        exec(`taskkill /F /T /PID ${this.childProcess!.pid}`, (err, stdout, stderr) => {
          if (err) {
            defaultTraceSource.error(`Error disposing electron: ${err}`);
          }
        });
      }
      else {
        this.childProcess!.kill('SIGKILL');
      }
    };
    this.childProcess.on("error", (error) => {
      this.emit('error', error);
    });
    this.childProcess.on("exit", (code, sig) => {
      const message = `exited with code: ${code} and signal: ${sig}`;
      console.log(message);
      defaultTraceSource.info(message);
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

  dispose() {
    this.killElectron?.();
  }

  private createStartOptions(): string {
    const showElectronApp = YandexMusicSettings.instance.showElectronApp;
    const startOptions = {
      showElectronApp
    };
    const startOptionsJson = JSON.stringify(startOptions);
    const buffer = Buffer.from(startOptionsJson, 'utf8');
    const encodedStartOptions = buffer.toString('base64');

    defaultTraceSource.info(startOptionsJson);

    return encodedStartOptions;
  }
}
