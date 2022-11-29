// Modules to control application life and create native browser window
import { app, BrowserWindow, ipcMain } from 'electron';
import fs = require("fs");
import * as path from "path";

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            // devTools: true,
        },
        width: 800,
        height: 600,
        title: 'Yandex Music',
        // TODO: Add ability to show/hide electron window via settings. It will be useful for debug.
        show: false,
    });

    mainWindow.setMenu(null);
    loadAudioHtml(mainWindow);
    mainWindow.webContents.openDevTools();

    process.on('message', (rawMessage) => {
        const message = JSON.parse(rawMessage);

        switch (message.command) {
            case 'play': mainWindow.webContents.send('play', message.payload); break;
            case 'pause': mainWindow.webContents.send('pause'); break;
            case 'rewind': mainWindow.webContents.send('rewind', message.payload); break;
        }
    });

    ipcMain.on('ended', () => {
        process.send?.('ended');
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
                <div id="title">Live Share</div>
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
