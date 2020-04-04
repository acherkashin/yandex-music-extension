import { PlayList, Cover } from "../interfaces";

export interface GeneratedPlayList extends PlayList {
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