import { Track } from "./interfaces";

export function createTrackAlbumIds(tracks: { id: string; albumId: string }[]): string[] {
  return tracks.map((track) => `${track.id}:${track.albumId}`);
}

export function getArtists(track: Track): string {
  return track.artists.map((item) => item.name).join(", ");
}
