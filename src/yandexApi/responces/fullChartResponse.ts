import { YandexMusicResponse } from "../interfaces";
import { PlayList } from "../playlist/playList";

export interface FullChartResponse extends YandexMusicResponse<FullChartResult> { }

export interface FullChartResult {
    id: string;
    type: "chart";
    typeForFrom: string;
    title: string;
    chartDescription: string;
    menu: {
        items: MenuItem[];
    };
    chart: PlayList;
}

export interface MenuItem {
    title: string;
    url: string;
    selected?: boolean;
}