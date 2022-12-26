import { NewPlaylistItem, Track } from "yandex-music-api-client";

export function createTrackAlbumIds(tracks: { id: string | number, albumId: string | number }[]): string[] {
  return tracks.map((track) => createAlbumTrackId(track));
}

/**
 * Every track can be many albums so to perform operation with track from certain album need to use combination of track id and album id
 */
export function createAlbumTrackId(track: { id: string | number, albumId: string | number }): string {
  return `${track.id}:${track.albumId}`;
}

export function getPlayListsIds(playLists: NewPlaylistItem[]) {
  return playLists.map((item) => `${item.uid}:${item.kind}`);
}

export function getArtists(track: Track): string {
  return track.artists.map((item) => item.name).join(", ");
}

export function getAlbums(track: Track): string {
  return track.albums.map((item) => item.title).join(", ");
}

export function getTrackFullName(track: Track): string {
  return `${track.title} - ${getArtists(track)}`;
}

export type CoverSize = 30 | 50 | 100 | 150 | 200 | 300 | 400 | 700 | 800 | 1000;

/**
 * Returns cover uri with specified size
 * 
 * @param uriTemplate track.coverUri
 * @param size cover size
 */
export function getCoverUri(uriTemplate: string, size: CoverSize) {
  return `https://${uriTemplate.replace('%%', `${size}x${size}`)}`;
}

export function getTrackShortName(name: string) {
  const maxLength = 14;
  if (!name) {
    return "";
  }

  let displayName = "";
  name = name.trim();
  if (name.length > maxLength) {
    const parts = name.split(" ");
    for (let i = 0; i < parts.length; i++) {
      displayName = `${displayName} ${parts[i]}`;
      if (displayName.length >= 12) {
        if (displayName.length > maxLength) {
          // trim it down to at least maxLength (14)
          displayName = `${displayName.substring(0, maxLength)}`;
        }
        displayName = `${displayName}..`;
        break;
      }
    }
  } else {
    displayName = name;
  }
  return displayName.trim();
}
