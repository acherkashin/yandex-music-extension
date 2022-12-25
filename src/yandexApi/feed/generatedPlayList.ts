import { Cover } from "../interfaces";
import { Playlist } from "yandex-music-api-client";

export interface GeneratedPlayList extends Playlist {
    animatedCoverUri: string;
    coverWithoutText: Cover;
    everPlayed: boolean;
    generatedPlaylistType: string;
    idForFrom: string;
    madeFor: any;
    ogTitle: string;
    playCounter: any;
    uid: number;
    urlPart: string;
}