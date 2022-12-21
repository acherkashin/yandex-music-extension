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
        pause();
    });

    ipcRenderer.on('rewind', (_, sec) => {
        rewind(sec);
    });

    // navigator.mediaSession?.setActionHandler('play', () => console.log('play'));
    // navigator.mediaSession?.setActionHandler('pause', () => pause());
    navigator.mediaSession?.setActionHandler('seekbackward', () => rewind(-15));
    navigator.mediaSession?.setActionHandler('seekforward', () => rewind(15));
    navigator.mediaSession?.setActionHandler('previoustrack', () => console.log('previoustrack'));
    navigator.mediaSession?.setActionHandler('nexttrack', () => ipcRenderer.send('ended'));

    audio.addEventListener('ended', () => {
        ipcRenderer.send('ended');
    });
};

function rewind(seconds: number) {
    //TODO need to use time from settings
    audio.currentTime += seconds;
}

function pause() {
    audio.pause();
}

// function play() {
//     audio.
// }