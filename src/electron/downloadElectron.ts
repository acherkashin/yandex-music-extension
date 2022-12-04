import childProcess = require('child_process');
import fs = require('fs');
import path = require('path');
import extract = require('extract-zip');
import { downloadArtifact } from '@electron/get';
import { defaultTraceSource } from '../logging/TraceSource';
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

/**
 * unzips and makes path.txt point at the correct executable
 * @param zipPath path to the zip archive
 * @returns path to the extracted files
 */
export async function extractElectron(zipPath: string | null): Promise<string> {
    if (!zipPath) {
        defaultTraceSource.info(`Archive already extracted: "${extractDefaultPath}"`);
        
        return extractDefaultPath;
    }

    // it is required to prevent error during archive extraction
    // https://www.electronjs.org/docs/latest/tutorial/asar-archives
    const noAsar = process.noAsar;
    process.noAsar = true;

    try {
        defaultTraceSource.info(`Started extracting electron archive from "${zipPath}" to "${extractDefaultPath}"`);

        await extract(zipPath, { dir: extractDefaultPath });

        defaultTraceSource.info("Electron extraction completed");

        const platformPath = getPlatformPath();
        // Write a "path.txt" file.
        fs.promises.writeFile(path.join(__dirname, 'path.txt'), platformPath);
    } catch (err) {
        defaultTraceSource.error(`Error extracting electron archive: ${(err as any).message}`);
    } finally {
        process.noAsar = noAsar;
    }

    return extractDefaultPath;
}

/**
 * Downloads electron archive
 * @returns path to the downloaded archive or null if it was downloaded previously
 */
export async function downloadElectron(): Promise<string | null> {
    if (isInstalled()) {
        defaultTraceSource.info("Electron is already downloaded to default location. See https://github.com/electron/get#how-it-works");
        return null;
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

    defaultTraceSource.info(`Started downloading electron v${version} archive. Platform: ${platform}, architecture: ${arch}`);

    // downloads if not cached
    const zipPath: string = await downloadArtifact({
        version,
        artifactName: 'electron',
    });

    defaultTraceSource.info(`Electron downloaded to ${zipPath}`);

    return zipPath;
}
