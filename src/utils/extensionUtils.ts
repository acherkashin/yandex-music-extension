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

export function getElectronFileName(): string {
    switch (platform()) {
        //NOTE: note sure what 'mas' means, just copied that code from here: https://github.com/electron/electron/blob/9c48992e21c64f25391b7057c85f35a61ba5ff08/npm/install.js
        case 'mas' as any:
        case 'darwin':
            return 'Electron.app/Contents/MacOS/Electron';
        case 'freebsd':
        case 'openbsd':
        case 'linux':
            return 'electron';
        case 'win32':
            return 'electron.exe';
        default:
            throw new Error('Electron builds are not available on platform: ' + platform);
    }
}

export function getPlatformName() {
    switch (platform()) {
        case 'win32': return 'Windows';
        case 'darwin': return 'MacOS';
        case 'linux': return 'Linux';
        default: return platform();
    }
}