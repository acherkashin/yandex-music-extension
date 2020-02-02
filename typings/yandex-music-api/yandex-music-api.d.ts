declare module "yandex-music-api" {
  class YandexMusicApi {
    constructor();

    init(config: { username: string; password: string }): Promise<YandexMusicApi.InitResult>;
    getFeed(): Promise<YandexMusicApi.FeedResult>;
    getUserPlaylists(userId: string): any;
    getPlaylist(userId: string, playListId: string): any;
    getPlaylists(userId: string, playlists: string[], options: { mixed: string; "rich-tracks": string }): any[];
    createPlaylist(name: string, options: { visibility: YandexMusicApi.Visibility }): any;
    removePlaylist(playlistId: string): any;
    renamePlaylist(playlistId: string, newName: string);
    addTracksToPlaylist(playlistId: string, tracks: Array<{ id: string; albumId: string }>, revision: string, options: { at: number }): any;
    removeTracksFromPlaylist(
      playlistId: string,
      tracks: Array<{ id: string; albumId: string }>,
      revision: string,
      options: { from: number; to: number }
    ): any;
  }

  namespace YandexMusicApi {
    interface InitResult {
      access_token: string;
      expires_in: number;
      token_type: string;
      uid: number;
    }
    
    interface FeedResult {
      canGetMoreEvents: boolean;
      days: any[];
      generatedPlaylist: GeneratedPlayListItem[];
      headlines: any[];
      isWizardPassed: boolean;
      pumpkin: boolean;
      today: string;
    }

    interface GeneratedPlayListItem {
      data: {
        animatedCoverUri: string;
        available: boolean;
        collective: boolean;
        cover: Cover;
        coverWithoutText: Cover;
        created: string;
        description: string;
        descriptionFormatted: string;
        durationMs: number;
        everPlayed: boolean;
        generatedPlaylistType: string; //"playlistOfTheDay";
        idForFrom: string; //"playlist_of_the_day";
        isBanner: boolean;
        isPremiere: boolean;
        kind: number;
        madeFor: any;
        modified: string;
        ogImage: string;
        ogTitle: string;
        owner: any;
        playCounter: any;
        prerells: any[];
        revision: number;
        snapshot: number;
        tags: any[];
        title: string;
        trackCount: number;
        tracks: any[];
        uid: number;
        urlPart: string;
        visibility: Visibility;
      };
      notify: boolean;
      ready: boolean;
      type: "playlistOfTheDay";
    }

    type Visibility = "public" | "private";

    interface Cover {
      custom: boolean;
      dir: string;
      type: string;
      uri: string;
      version: string;
    }
  }

  export = YandexMusicApi;
}
