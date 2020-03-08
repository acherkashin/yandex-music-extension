declare module "mplayer" {
  class MPlayer {
    constructor();
    on(eventName: "status" | "start" | "stop" | "pause" | "time", callback: Function);
    setOptions(options): void;
    openFile(file: string, options?): void;
    openPlaylist(file: string, options?): void;
    play(): void;
    pause(): void;
    stop(): void;
    seek(seconds): void;
    seekPercent(percent): void;
    volume(percent): void;
    mute(): void;
    fullscreen(): void;
    hideSubtitles(): void;
    showSubtitles(): void;
    cycleSubtitles(): void;
    speedUpSubtitles(): void;
    slowDownSubtitles(): void;
    adjustSubtitles(seconds): void;
    adjustAudio(seconds): void;
  }

  export = MPlayer;
}
