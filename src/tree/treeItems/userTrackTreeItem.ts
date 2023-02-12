import { Playlist, Track } from "yandex-music-client";
import { Store } from "../../store";
import { TrackTreeItem } from "./trackTreeItem";

/**
 * Track from user's playlist
 */
export class UserTrackTreeItem extends TrackTreeItem {
  constructor(store: Store, track: Track, public readonly playlist: Playlist, public readonly index: number) {
    super(store, track, playlist.kind);

    this.contextValue = [this.contextValue, "in-user"].join(",");
  }
}