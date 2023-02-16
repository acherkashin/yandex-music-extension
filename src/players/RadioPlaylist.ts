import { Track } from "yandex-music-client";
import { Store } from "../store";
import { TracksPlaylist } from "./TracksPlaylist";

export class RadioPlaylist extends TracksPlaylist {
    constructor(readonly store: Store, readonly id: string, readonly tracks: Track[]) {
        super(id, tracks);
    }

    async getByIndex(index: number): Promise<Track | undefined> {
        if (this.tracks.length <= index) {
            const nextTracks = await this.store.getStationTracks(this.id);
            this.tracks.push(...nextTracks);
        }

        return this.tracks[index];
    }
}