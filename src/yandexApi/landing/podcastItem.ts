import { Album } from "../album/album";

export interface PodcastItem {
    type: string;
    podcast: Album;
    description: string;
    descriptionFormatted: string;
    lastUpdated: string;
    data: {
        podcast: Album;
        description: string;
        descriptionFormatted: string;
        lastUpdated: string;
    };
}