import { LandingPodcastItem, LandingBlockType, GeneratedPlaylistLandingBlock, Promotion } from 'yandex-music-api-client';
import { Playlist, Album } from "yandex-music-api-client";
import { LandingBlockEntity } from "./blockentity";
import { ChartItem } from "./chartitem";
import { MixLink } from "./mixLink";

export interface LandingBlock {
    id: string;
    title: string;
    type: "personal-playlists" | "podcasts" | "play-context" | "chart" | "new-playlists" | "new-releases" | "promotions" | string;
    /**
     * Where block was got from
     */
    typeForFrom: LandingBlockType;
    description: string | undefined;
    entities: Array<LandingBlockEntity<Promotion | Album | Playlist | ChartItem | MixLink | GeneratedPlaylistLandingBlock> | LandingPodcastItem>;
}