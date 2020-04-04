import { Cover } from "../interfaces";
import { PlayList } from "../playlist/playList";

export interface GeneratedPlayList extends PlayList {
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