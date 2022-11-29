// const { version } = require('./../../package');

const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const extract = require('extract-zip');
import { downloadArtifact } from '@electron/get';
import { getElectronFileName as getPlatformPath } from './../utils/extensionUtils';

const version = "21.3.1";
const extractDefaultPath: string = path.join(__dirname, 'dist');

function isInstalled() {
    const platformPath = getPlatformPath();

    try {
        if (fs.readFileSync(path.join(__dirname, 'dist', 'version'), 'utf-8').replace(/^v/, '') !== version) {
            return false;
        }

        if (fs.readFileSync(path.join(__dirname, 'path.txt'), 'utf-8') !== platformPath) {
            return false;
        }
    } catch (ignored) {
        return false;
    }

    const electronPath = process.env.ELECTRON_OVERRIDE_DIST_PATH || path.join(__dirname, 'dist', platformPath);

    return fs.existsSync(electronPath);
}

// unzips and makes path.txt point at the correct executable
export async function extractElectron(zipPath: string) {
    // it is required to prevent error during archive extraction
    // https://www.electronjs.org/docs/latest/tutorial/asar-archives
    const noAsar = process.noAsar;
    process.noAsar = true;

    const distPath = process.env.ELECTRON_OVERRIDE_DIST_PATH || extractDefaultPath;
    try {
        await extract(zipPath, { dir: extractDefaultPath })        // If the zip contains an "electron.d.ts" file,
        // move that up
        const srcTypeDefPath = path.join(distPath, 'electron.d.ts');
        const targetTypeDefPath = path.join(__dirname, 'electron.d.ts');
        const hasTypeDefinitions = fs.existsSync(srcTypeDefPath);

        if (hasTypeDefinitions) {
            fs.renameSync(srcTypeDefPath, targetTypeDefPath);
        }

        const platformPath = getPlatformPath();
        // Write a "path.txt" file.
        /*return */fs.promises.writeFile(path.join(__dirname, 'path.txt'), platformPath);
    } catch (err) {
        console.error((err as any).stack);
    } finally {
        process.noAsar = noAsar;
    }

    return extractDefaultPath;
}

export async function downloadElectron(): Promise<string> {
    if (process.env.ELECTRON_SKIP_BINARY_DOWNLOAD) {
        return extractDefaultPath;
    }

    if (isInstalled()) {
        return extractDefaultPath;
    }

    const platform = process.env.npm_config_platform || process.platform;
    let arch = process.env.npm_config_arch || process.arch;

    if (platform === 'darwin' && process.platform === 'darwin' && arch === 'x64' &&
        process.env.npm_config_arch === undefined) {
        // When downloading for macOS ON macOS and we think we need x64 we should
        // check if we're running under rosetta and download the arm64 version if appropriate
        try {
            const output = childProcess.execSync('sysctl -in sysctl.proc_translated');
            if (output.toString().trim() === '1') {
                arch = 'arm64';
            }
        } catch {
            // Ignore failure
        }
    }

    // downloads if not cached
    const zipPath: string = await downloadArtifact({
        version,
        artifactName: 'electron',
        // force: process.env.force_no_cache === 'true',
        // cacheRoot: process.env.electron_config_cache,
        // checksums: process.env.electron_use_remote_checksums ? undefined : require('./checksums.json'),
        // platform,
        // arch
    })

    return zipPath;
}
