import { LandingPodcastItem, LandingBlockType } from 'yandex-music-api-client';
import { Playlist } from "yandex-music-api-client";
import { LandingBlockEntity } from "./blockentity";
import { Promotion } from "./promotion";
import { ChartItem } from "./chartitem";
import { MixLink } from "./mixLink";
import { GeneratedPlayListItem } from "../feed/generatedPlayListItem";
import { Album } from "../album/album";

export interface LandingBlock {
    id: string;
    title: string;
    type: "personal-playlists" | "podcasts" | "play-context" | "chart" | "new-playlists" | "new-releases" | "promotions" | string;
    /**
     * Where block was got from
     */
    typeForFrom: LandingBlockType;
    description: string | undefined;
    entities: Array<LandingBlockEntity<Promotion | Album | Playlist | ChartItem | MixLink | GeneratedPlayListItem> | LandingPodcastItem>;
}