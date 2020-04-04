import { YandexMusicResponse } from "../interfaces";

export interface FullNewReleasesResponse extends YandexMusicResponse<FullNewReleasesResult> { }

export interface FullNewReleasesResult {
    id: string;
    type: "new-releases";
    typeForFrom: string;
    title: string;
    /**
     * Newly released albums ids
     */
    newReleases: number[];
}