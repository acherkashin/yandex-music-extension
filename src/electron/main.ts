// Modules to control application life and create native browser window
import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron';
import fs = require("fs");
import * as path from "path";

const startOptions = getStartOptions(process.argv[2]);

function createWindow() {

    // Create the browser window.
    const win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: startOptions.showElectronApp,
        },
        width: 800,
        height: 600,
        title: 'Yandex Music',
        show: startOptions.showElectronApp,
    });
    
    win.setMenu(null);
    loadAudioHtml(win);
    
    process.on('message', (rawMessage) => {
        const message = JSON.parse(rawMessage);
        
        switch (message.command) {
            case 'play': win.webContents.send('play', message.payload); break;
            case 'pause': win.webContents.send('pause'); break;
            case 'rewind': win.webContents.send('rewind', message.payload); break;
        }
    });
    
    ipcMain.on('ended', () => {
        process.send?.('ended');
    });
    
    // // For debugging:
    // if () {
    //     win.webContents.openDevTools();
    // }
    globalShortcut.register('CommandOrControl+Shift+K', () => {
        win.webContents.openDevTools();
    });
}

app.commandLine.appendSwitch('ignore-gpu-blacklist');

// Hide electron icon from dock on macOs
app.dock?.hide();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);


function loadAudioHtml(window: BrowserWindow) {
    const filePath = path.join(__dirname, "index.html");
    const html = `<html>
        <head>
            <script src="./index.js"></script>
        </head>
        <body>
            <div id="title-bar">
                <div id="title">Yandex Music Extension</div>
            </div>
            <div id='remoteVideo'></div>
        </body>
    </html>`;

    // https://github.com/electron/electron/issues/1146#issuecomment-591983815
    fs.writeFileSync(filePath, html, { encoding: 'utf8' });
    window.webContents.once("dom-ready", () => {
        fs.unlinkSync(filePath); // remove generated file
    });

    window.loadFile(filePath);
}

function getStartOptions(base64Data: string) {
    const buffer = Buffer.from(base64Data, 'base64');
    const startOptionsJson = buffer.toString('utf8');
    return JSON.parse(startOptionsJson);
}