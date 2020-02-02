declare module "yandex-music-api" {
  class YandexMusicApi {
    constructor();

    init(config: { username: string; password: string }): Promise<YandexMusicApi.InitResult>;
    getFeed(): Promise<YandexMusicApi.FeedResult>;
    getUserPlaylists(userId?: string): Promise<YandexMusicApi.PlayList[]>;
    getPlaylist(userId: string | undefined, playListId: string | number): Promise<any>;
    /**
     * GET: /users/[user_id]/playlists
     * Get an array of playlists with tracks
     * @param  userId       The user ID, if null then equal to current user id
     * @param  playlists The playlists IDs.
     */
    getPlaylists(userId: string | undefined, playlists: string[], options: YandexMusicApi.GetPlayListsOptions): Promise<any[]>;
    createPlaylist(name: string, options: { visibility: YandexMusicApi.Visibility }): Promise<any>;
    removePlaylist(playlistId: string): Promise<any>;
    renamePlaylist(playlistId: string, newName: string): Promise<any>;
    addTracksToPlaylist(
      playlistId: string,
      tracks: Array<{ id: string; albumId: string }>,
      revision: string,
      options: { at: number }
    ): Promise<any>;
    removeTracksFromPlaylist(
      playlistId: string,
      tracks: Array<{ id: string; albumId: string }>,
      revision: string,
      options: { from: number; to: number }
    ): Promise<any>;
  }

  namespace YandexMusicApi {
    interface GetPlayListsOptions {
      mixed?: boolean;
      "rich-tracks"?: boolean;
    }

    interface InitResult {
      access_token: string;
      expires_in: number;
      token_type: string;
      uid: number;
    }

    interface FeedResult {
      canGetMoreEvents: boolean;
      days: any[];
      generatedPlaylists: GeneratedPlayListItem[];
      headlines: any[];
      isWizardPassed: boolean;
      pumpkin: boolean;
      today: string;
    }

    interface PlayList {
      available: boolean;
      collective: boolean;
      cover: Cover;
      created: string;
      durationMs: number;
      isBanner: boolean;
      isPremiere: boolean;
      kind: number;
      modified: string;
      ogImage: string;
      owner: Owner;
      prerolls: any[];
      revision: number;
      snapshot: number;
      tags: any[];
      title: string;
      trackCount: number;
      uid: number;
      visibility: Visibility;
      tracks: Track;
    }

    interface GeneratedPlayList extends PlayList {
      animatedCoverUri: string;
      coverWithoutText: Cover;
      description: string;
      descriptionFormatted: string;
      everPlayed: boolean;
      generatedPlaylistType: string;
      idForFrom: string;
      madeFor: any;
      ogTitle: string;
      playCounter: any;
      uid: number;
      urlPart: string;
    }

    interface GeneratedPlayListItem {
      data: GeneratedPlayList;
      notify: boolean;
      ready: boolean;
      type: "playlistOfTheDay";
    }

    type Visibility = "public" | "private";

    interface Track {
      id: number;
      recent: boolean;
      timestamp: string;
      /**
       * Null when tracks are not riched
       */
      track?: TrackInfo;
    }

    interface TrackInfo {
      albums: any[];
      artists: any[];
      available: boolean;
      availableForPremiumUsers: boolean;
      availableFullWithoutPermission: boolean;
      coverUri: string;
      durationMs: number;
      fileSize: number;
      id: string;
      lyricsAvailable: boolean;
      major: {
        id: number;
        name: string;
      };
      normalization: {
        gain: number;
        peak: number;
      };
      ogImage: string;
      previewDurationMs: number;
      realId: string;
      rememberPosition: boolean;
      storageDir: string;
      title: string;
      type: string; //music
    }

    interface Cover {
      custom: boolean;
      /**
       * Exists when @field type = "pic"
       */
      dir?: string;
      type: "pic" | "mosaic";
      /**
       * Exists when @field type = "mosaic"
       */
      itemsUri?: string[];
      /**
       * Exists when @field type = "pic"
       */
      uri?: string;
      version?: string;
    }

    interface Owner {
      login: string;
      name: string;
      sex: string;
      uid: number;
      verified: boolean;
    }
  }

  export = YandexMusicApi;
}
