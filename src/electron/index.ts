var window: any;
var Audio: any;
var document: any;
declare var navigator: Navigator;

class BrowserPlayer {
    audio;
    trackName;
    artistName;
    albumName;
    coverImg;
    lastTime = -1;

    constructor() {
        this.audio = document.getElementById('player');
        this.trackName = document.getElementById('track');
        this.artistName = document.getElementById('artist');
        this.coverImg = document.getElementById('cover');
        this.albumName = document.getElementById('album');

        navigator.mediaSession?.setActionHandler('play', () => this.resume());
        navigator.mediaSession?.setActionHandler('pause', () => this.pause());
        navigator.mediaSession?.setActionHandler('seekbackward', () => this.rewind(-15));
        navigator.mediaSession?.setActionHandler('seekforward', () => this.rewind(15));
        navigator.mediaSession?.setActionHandler('previoustrack', () => {
            window.electronAPI.sendMessage({ command: 'previoustrack' });
        });
        navigator.mediaSession?.setActionHandler('nexttrack', () => this.playNextTrack('skip'));

        this.audio.addEventListener('ended', () => this.playNextTrack('track-finished'));
        this.audio.addEventListener('timeupdate', () => this.sendTimeUpdated());
    }

    play(payload) {
        if (payload) {
            const { url, ...mediaMetadataInit } = payload;
            this.artistName.innerText = mediaMetadataInit.artist;
            this.coverImg.src = mediaMetadataInit.coverUri;
            this.albumName.innerText = mediaMetadataInit.album;
            this.trackName.innerText = mediaMetadataInit.title,
            this.audio.src = url;

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
        
        // if called without parameters - continue playing
        // if there is payload - respect autoPlay
        if(!payload || payload.autoPlay) {
            this.audio.play?.();
        }
    }

    rewind(seconds: number) {
        //TODO need to use time from settings
        this.audio.currentTime += seconds;
    }

    pause() {
        this.audio.pause();
        window.electronAPI.sendMessage({ command: 'paused' });
    }

    resume() {
        this.audio.play();
        window.electronAPI.sendMessage({ command: 'resumed' });
    }

    sendTimeUpdated() {
        const currentTime = parseInt(this.audio.currentTime);

        if (currentTime !== this.lastTime && currentTime % 5 === 0) {
            window.electronAPI.sendMessage({ command: 'timeupdate', currentTime });
        }
    }

    playNextTrack(reason: 'skip' | 'track-finished') {
        window.electronAPI.sendMessage({ command: 'nexttrack', reason });
    }
}

window.onload = () => {
    const player = new BrowserPlayer();

    window.electronAPI.handlePlay((_, ...args) => {
        const payload = args[0];

        console.log(JSON.stringify(payload));

        player.play(payload);
    });

    window.electronAPI.handlePause(() => {
        player.pause();
    });

    window.electronAPI.handleRewind((_, sec) => {
        player.rewind(sec);
    });
};
