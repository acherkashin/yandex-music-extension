import { Cover, Owner, Visibility, TrackItem } from "../interfaces";

export interface PlayList {
    description: string;
    descriptionFormatted: string;
    available: boolean;
    collective: boolean;
    cover: Cover;
    coverWithoutText: Cover;
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
    tracks: TrackItem[];
}
