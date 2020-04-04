import { Track } from "./interfaces";
import { NewPlayListItem } from "./responces/fullNewPlayLists";

export function createTrackAlbumIds(tracks: { id: string; albumId: string }[]): string[] {
  return tracks.map((track) => `${track.id}:${track.albumId}`);
}

export function getPlayListsIds(playLists: NewPlayListItem[]) {
  return playLists.map((item) => `${item.uid}:${item.kind}`);
}

export function getArtists(track: Track): string {
  return track.artists.map((item) => item.name).join(", ");
}

export function getTrackFullName(track: Track): string {
  return `${track.title} - ${getArtists(track)}`;
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
