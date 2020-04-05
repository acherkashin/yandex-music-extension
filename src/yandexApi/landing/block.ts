import { LandingBlockType } from "../interfaces";
import { LandingBlockEntity } from "./blockentity";
import { Promotion } from "./promotion";
import { ChartItem } from "./chartitem";
import { MixLink } from "./mixLink";
import { PodcastItem } from "./podcastItem";
import { GeneratedPlayListItem } from "../feed/generatedPlayListItem";
import { Album } from "../album/album";
import { PlayList } from "../playlist/playList";

export interface LandingBlock {
    id: string;
    title: string;
    type: "personal-playlists" | "podcasts" | "play-context" | "chart" | "new-playlists" | "new-releases" | "promotions" | string;
    /**
     * Where block was got from
     */
    typeForFrom: LandingBlockType;
    description: string | undefined;
    entities: Array<LandingBlockEntity<Promotion | Album | PlayList | ChartItem | MixLink | GeneratedPlayListItem> | PodcastItem>;
}