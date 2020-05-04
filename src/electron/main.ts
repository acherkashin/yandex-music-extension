// Modules to control application life and create native browser window
import { app, BrowserWindow, ipcMain } from 'electron';
import * as readline from 'readline';

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
    mainWindow.loadURL(`file://${__dirname}/index.html`)

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    // setTimeout(() => {
    //     mainWindow.webContents.send('playAudio', "AAAAAA!");
    // }, 10_000);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    process.on('message', (message) => {
        mainWindow.webContents.send('playAudio', message);
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
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
