const { ipcRenderer } = require('electron');

var window: any;
var Audio: any;
declare var navigator: Navigator;

class BrowserPlayer {
    audio = new Audio();
    lastTime = -1;

    constructor() {


        navigator.mediaSession?.setActionHandler('play', () => this.resume());
        navigator.mediaSession?.setActionHandler('pause', () => this.pause());
        navigator.mediaSession?.setActionHandler('seekbackward', () => this.rewind(-15));
        navigator.mediaSession?.setActionHandler('seekforward', () => this.rewind(15));
        navigator.mediaSession?.setActionHandler('previoustrack', () => {
            ipcRenderer.send('message', { command: 'previoustrack' });
        });
        navigator.mediaSession?.setActionHandler('nexttrack', () => this.playNextTrack('skip'));

        this.audio.addEventListener('ended', () => this.playNextTrack('track-finished'));
        this.audio.addEventListener('timeupdate', () => this.sendTimeUpdated());
    }

    play(payload) {
        if (payload) {
            const { url, ...mediaMetadataInit } = payload;
            this.audio != null ? this.audio.src = url : this.audio = new Audio(url);

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

        this.audio.play?.();
    }

    rewind(seconds: number) {
        //TODO need to use time from settings
        this.audio.currentTime += seconds;
    }

    pause() {
        this.audio.pause();
        ipcRenderer.send('message', { command: 'paused' });
    }

    resume() {
        this.audio.play();
        ipcRenderer.send('message', { command: 'resumed' });
    }

    sendTimeUpdated() {
        const currentTime = parseInt(this.audio.currentTime);

        if (currentTime !== this.lastTime && currentTime % 5 === 0) {
            ipcRenderer.send('message', { command: 'timeupdate', currentTime });
        }
    }

    playNextTrack(reason: 'skip' | 'track-finished') {
        ipcRenderer.send('message', { command: 'nexttrack', reason });
    }
}

const player = new BrowserPlayer();

window.onload = () => {
    ipcRenderer.on('play', (_, ...args) => {
        const payload = args[0];

        console.log(JSON.stringify(payload));

        player.play(payload);
    });

    ipcRenderer.on('pause', () => {
        player.pause();
    });

    ipcRenderer.on('rewind', (_, sec) => {
        player.rewind(sec);
    });
};
