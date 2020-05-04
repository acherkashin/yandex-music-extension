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
        childProcess.send('https://s224iva.storage.yandex.net/get-mp3/912b62b8592f3bc7a78b73b68469718d/0005a4d36dc5455b/rmusic/U2FsdGVkX1_qvIVuKirtLV4G-ma98Tn3jAoLsXdf_bWYJJHaMPa0FrwG_4LuDkngzUA_EkXTQ9YCq6L6szsnDZ-ej1FPbcWBMl7oIckSRJw/0771b481a232501c5278803ce2cf5b4821a6e440ecefa111fc8e44f0c46e796e');
      }, 5_000);

      setTimeout(() => {
        childProcess.send('https://s245vla.storage.yandex.net/get-mp3/eb91b2bd1aa8c90430bcd7f8acfccea8/0005a4d36f4b41de/rmusic/U2FsdGVkX19yeK8jG9ScGiX0cLSHJT4xWhiJgiThRuR_3yQQVpuCZOEXhpt8RDCpLWn99bEVXN_Lro8VWhTRbPGe2xL4Z_KKZh8xZ_0qKdo/b6e0749b85f518a1fd25de6bc4b12aadbb7727d0eff70b26f6262a0308b95671');
      }, 5_000);

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