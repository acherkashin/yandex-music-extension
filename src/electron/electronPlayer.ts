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
      const childProcess = spawn(electronPath, [fullPath], {
        env: spawn_env,
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      });

      setTimeout(() => {
        childProcess.send('https://s126iva.storage.yandex.net/get-mp3/01747d20aafea0d549d66d35fbe76859/0005a5616084caab/rmusic/U2FsdGVkX19MpCrpC7uBNh2wHidceV5-JDdThhJhSoaXihd-HoZOAMmXKJxO5B6MjyAkCa-DhlWXbVkpwNf_KMe0c2ujjpEqoxQvNphvCKs/32473624a4e796972f43daaa59c5b39586eaf0ed24ba8bc2c17f9857911569bc');
      }, 5_000);

      setTimeout(() => {
        childProcess.send('https://s101iva.storage.yandex.net/get-mp3/d19b1a320a476d7b14eb8d819770faf9/0005a56162ce8dbc/rmusic/U2FsdGVkX1_pNdltbm_-TeV3O-DIlKsaT9uTI6kaNSQRZK71Yza8TUI_uJx4z5WSGBtt787AJ4pVG-pnMlPPhgovPR97lXuppCbm0MWAic8/d40413d18ed40827cec2134458a01bfe6fa7fea7d9f8305ad802b3b379503e47');
      }, 15_000);

      // const command = `${electronPath}`;
      // // spawn('electron', [fullPath]);
      // const childProcess = exec(command);
      childProcess.on("error", function (error) {
        console.log(error);
      });
      childProcess.on("exit", function (code, sig) {
        console.log(code);
        console.log(sig);
      });
      // this.childProcess = childProcess;
    }
  }
}