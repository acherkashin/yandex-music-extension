import * as vscode from "vscode";
import { join } from 'path';
import { spawn, exec } from "child_process";

export class ElectronPlayer {
  childProcess = null;

  constructor() {

  }

  init() {
    const extensionPath = vscode.extensions.getExtension('Cherkashin Alexander.yandex-music-extension')?.extensionPath;

    if (extensionPath) {
      const fullPath = join(extensionPath, "./out/electron/main.js");
      const electronPath = join(extensionPath, "node_modules\\electron\\dist\\electron.exe");
      var spawn_env = JSON.parse(JSON.stringify(process.env));
      console.log(process.env);
      delete spawn_env.ATOM_SHELL_INTERNAL_RUN_AS_NODE;
      delete spawn_env.ELECTRON_RUN_AS_NODE;
      // var spawn = require('child_process').spawn;
      spawn(electronPath, [fullPath], { env: spawn_env, detached: true });

      // const command = `${electronPath}`;
      // // spawn('electron', [fullPath]);
      // const childProcess = exec(command);
      // childProcess.on("error", function (error) {
      //   console.log(error);
      // });
      // childProcess.on("exit", function (code, sig) {
      //   console.log(code);
      //   console.log(sig);
      // });
      // this.childProcess = childProcess;
    }
  }
}