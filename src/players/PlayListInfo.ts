import { Track } from "yandex-music-client";
import { Store } from "../store";

export class PlayListInfo {
    tracks: Track[] = [];

    constructor(readonly id: string) {

    }

    get canPlayPrevious() {
        return
    }

    get isEmpty() {
        return this.tracks.length === 0;
    }

    getTrackById(id: string) {
        return this.tracks.find(item => item.id === id);
    }
}