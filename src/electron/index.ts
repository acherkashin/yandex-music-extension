var window: any;
var Audio: any;
var document: any;
declare var navigator: Navigator;

class BrowserPlayer {
    audio;
    lastTime = -1;

    constructor() {
        this.audio = document.getElementById('player');

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
