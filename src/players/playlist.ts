import { Track } from "yandex-music-client";
import { Store } from "../store";

export class TracksPlaylist {

    constructor(readonly store: Store, readonly id: string, readonly tracks: Track[]) {

    }

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

export class RadioPlaylist extends TracksPlaylist {
    constructor(readonly store: Store, readonly id: string, readonly tracks: Track[]) {
        super(store, id, tracks);
    }

    async getByIndex(index: number): Promise<Track | undefined> {
        if (this.tracks.length <= index) {
            const nextTracks = await this.store.getStationTracks(this.id);
            this.tracks.push(...nextTracks);
            //NOTE: update playlist to refresh @computed properties like hasNextTrack
            // this.playLists.set(this.currentPlayListId, playlist);
        }

        return this.tracks[index];
    }
}