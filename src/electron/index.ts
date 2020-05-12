const { ipcRenderer } = require('electron');

var window: any;
var Audio: any;

let audio = new Audio();

window.onload = () => {
    ipcRenderer.on('play', (event, ...args) => {
        const url = args[0];
        if (url) {
            if (audio) {
                audio.src = url;
            } else {
                audio = new Audio(url);
            }
        }

        audio && audio.play();
    });

    ipcRenderer.on('pause', () => {
        audio.pause();
    });

    ipcRenderer.on('rewind', (event, sec) => {
        audio.currentTime += sec;
    });
};
