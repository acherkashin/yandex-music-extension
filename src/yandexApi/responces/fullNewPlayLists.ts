import { YandexMusicResponse } from "../interfaces";

export interface FullNewPlayListsResponse extends YandexMusicResponse<FullNewPlayListsResult> { }

export interface FullNewPlayListsResult {
    id: string;
    type: "new-playlists";
    typeForFrom: string;
    title: string;
    newPlaylists: NewPlayListItem[];
}

//TODO: rename
export interface NewPlayListItem {
    /**
     * User id
     */
    uid: number;
    /**
     * Play list id
     */
    kind: number;
}