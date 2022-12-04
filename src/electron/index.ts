const { ipcRenderer } = require('electron');

var window: any;
var Audio: any;
declare var navigator: Navigator;

let audio = new Audio();

window.onload = () => {
    ipcRenderer.on('play', (event, ...args) => {
        const payload = args[0];

        console.log(JSON.stringify(payload));
        
        if (payload) {
            const { url, ...mediaMetadataInit } = payload;
            audio != null ? audio.src = url : audio = new Audio(url);

            if (navigator.mediaSession != null) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: mediaMetadataInit.title,
                    album: mediaMetadataInit.album,
                    artist: mediaMetadataInit.artist,
                    artwork: [{
                        src: mediaMetadataInit.coverUri,
                        sizes: '200x200',
                        type: 'image/png'
                    }]
                });
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
