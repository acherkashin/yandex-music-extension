import { YandexMusicApi } from "./yandexApi/yandexMusicApi";

export class PlayListProvider {
  private _api: YandexMusicApi;
  constructor() {
    this._api = new YandexMusicApi();
  }
  init(username: string, password: string) {
    return this._api.init({ username, password });
  }

  getPlayLists() {
    return this._api.getFeed().then((resp) => resp.data.result);
  }

  getTracks(playList: any) {
    return this._api.getPlaylist(playList.owner.uid, playList.kind).then((resp) => resp.data.result);
  }

  //TODO: add ability to listen own playlists
  //   getPlayLists() {
  //     return this._api.getUserPlaylists().then((playLists) => {
  //       const ids = playLists.map((item) => item.kind.toString());
  //       return this._api.getPlaylists(undefined, ids, {
  //         "rich-tracks": false,
  //       });
  //     });
  //   }
}
