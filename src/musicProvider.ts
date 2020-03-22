import { YandexMusicApi } from "./yandexApi/yandexMusicApi";
import { TrackInfo, GeneratedPlayList } from "./yandexApi/interfaces";

//TODO: rename
export class MusicProvider {
  _api: YandexMusicApi;
  constructor() {
    this._api = new YandexMusicApi();
  }
  init(username: string, password: string) {
    return this._api.init({ username, password });
  }

  getFeed() {
    return this._api.getFeed().then((resp) => resp.data.result);
  }

  getTracks(userId: string | number | undefined, playListId: string | number): Promise<GeneratedPlayList> {
    return this._api.getPlaylist(userId, playListId).then((resp) => resp.data.result);
  }

  getUrl(storageDir: string): Promise<string> {
    return this._api.getTrackUrl(storageDir);
  }

  getUserPlayLists() {
    return this._api.getUserPlaylists().then((playLists) => {
      const ids = playLists.map((item) => item.kind.toString());
      return this._api.getPlaylists(undefined, ids, {
        "rich-tracks": false,
      });
    });
  }

  getLikedTracksIds() {
    return this._api.getLikedTracksIds();
  }
}
