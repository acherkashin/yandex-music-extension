export function createTrackAlbumIds(tracks: { id: string; albumId: string }[]): string[] {
  return tracks.map((track) => `${track.id}:${track.albumId}`);
}
