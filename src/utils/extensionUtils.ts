import * as vscode from 'vscode';
import { join } from 'path';
import { platform } from 'os';

const packageJson: { name: string, publisher: string } = require('./../../package.json');

export function getExtensionPath(): string {
    return vscode.extensions.getExtension(`${packageJson.publisher}.${packageJson.name}`)?.extensionPath ?? '';
}

export function getElectronPath() {
    return join(getExtensionPath(), 'node_modules', 'electron', 'dist', getElectronFileName());
}

export function getElectronAppPath() {
    return join(getExtensionPath(), "./out/electron/main.js");
}

function getElectronFileName(): string {
    switch (platform()) {
        case 'darwin':
            return 'Electron.app/Contents/MacOS/Electron';
        case 'freebsd':
        case 'linux':
            return 'electron';
        case 'win32':
        default:
            return 'electron.exe';
    }
}