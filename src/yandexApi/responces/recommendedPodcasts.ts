import { LandingBlockType } from "yandex-music-api-client";
import { YandexMusicResponse } from "../interfaces";

export interface RecommendedPodcastsIdsResponse extends YandexMusicResponse<RecommendedPodcastsIdsResult> { }

export interface RecommendedPodcastsIdsResult {
    type: LandingBlockType;
    typeForFrom: "non-music_main_podcasts" | string;
    title: string;
    podcasts: number[];
}