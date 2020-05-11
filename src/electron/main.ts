// Modules to control application life and create native browser window
import { app, BrowserWindow, ipcMain } from 'electron';
import * as readline from 'readline';
import fs = require("fs");
import * as path from "path";

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        width: 800,
        height: 600,
        show: true,
    });

    mainWindow.setMenu(null);
    // and load the index.html of the app.
    // mainWindow.loadURL(`file://${__dirname}/index.html`)
    loadAudioHtml(mainWindow);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    process.on('message', (rawMessage) => {
        const message = JSON.parse(rawMessage);

        switch (message.command) {
            case 'play': mainWindow.webContents.send('play', message.payload); break;
            case 'pause': mainWindow.webContents.send('pause');
        }
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

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
