import { Artist, Track } from
    "../interfaces";

export interface Album {
    id: number;
    /**
     * Getting albom error
     */
    error?: string;
    title: string;
    type: "single" | "podcast";
    metaType: "single" | "podcast" | "music";
    /**
     * Release year
     */
    year: number;
    /**
     * Release data in ISO 8601 format
     */
    releaseDate: string;
    coverUri: string;
    ogImage: string;
    /**
     * Music genre
     */
    genre: string;
    buy: any[];
    trackCount: number;
    /**
     * Is new albom
     */
    recent: boolean;
    /**
     * Whether albom is popular for listeners
     */
    veryImportant: boolean;
    artists: Artist[];
    labels: Array<{ id: number, name: string }>;
    available: boolean;
    availableForPremiumUsers: boolean;
    availableForMobile: boolean;
    availablePartially: boolean;
    /**
     * the best tracks ids
     */
    bests: number[];
    prerolls: any[];
    /**
     *  Треки альбома, разделенные по дискам.
     */
    volumes: Track[][] | null;
}
