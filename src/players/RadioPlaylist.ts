import { Track } from "yandex-music-client";
import { Store } from "../store";
import { TracksPlaylist } from "./TracksPlaylist";

export class RadioPlaylist extends TracksPlaylist {
    batchId: string | null = null;

    constructor(readonly store: Store, readonly id: string, readonly tracks: Track[] = []) {
        super(id, tracks);
    }

    async getByIndex(index: number): Promise<Track | undefined> {
        if (this.tracks.length <= index) {
            await this.loadNextBatch();
        }

        return this.tracks[index];
    }

    async loadNextBatch() {
        const result = await this.store.api.getRadioTracks(this.id);
        const nextTracks = result.sequence.map(item => item.track);
        this.batchId = result.batchId;
        this.tracks.push(...nextTracks);
    }
}