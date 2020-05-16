import * as vscode from 'vscode';
import { join } from 'path';
const packageJson: { name: string, publisher: string } = require('./../../package.json');

export function getExtensionPath() {
    return vscode.extensions.getExtension(`${packageJson.publisher}.${packageJson.name}`)?.extensionPath ?? '';
}

export function getElectronPath() {
    return join(getExtensionPath(), 'node_modules\\electron\\dist\\electron.exe');
}

export function getElectronAppPath() {
    return join(getExtensionPath(), "./out/electron/main.js");
}