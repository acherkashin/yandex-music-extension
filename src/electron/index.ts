const { ipcRenderer } = require('electron');

var window: any;
var Audio: any;
declare var navigator: Navigator;

let audio = new Audio();

window.onload = () => {
    ipcRenderer.on('play', (event, ...args) => {
        const payload = args[0];

        if (payload) {
            const { url, ...mediaMetadataInit } = payload;
            audio != null ? audio.src = url : audio = new Audio(url);

            if (navigator.mediaSession != null) {
                navigator.mediaSession.metadata = new MediaMetadata(mediaMetadataInit);
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

    audio.addEventListener('ended', () => {
        ipcRenderer.send('ended');
    });
};
