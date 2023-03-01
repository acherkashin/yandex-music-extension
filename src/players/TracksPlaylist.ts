
import { Track } from "yandex-music-client";

export class TracksPlaylist {
    constructor(readonly id: string, readonly tracks: Track[]) { }

    async getByIndex(index: number): Promise<Track | undefined> {
        return this.tracks[index];
    }

    getById(trackId: string): Track | undefined {
        return this.tracks.find(item => item.id === trackId);
    }

    getTrackIndex(trackId: string): number {
        return this.tracks.findIndex(item => item.id === trackId);
    }
}
