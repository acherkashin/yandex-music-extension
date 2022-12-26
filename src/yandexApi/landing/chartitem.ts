import { TrackItem, Chart, Track } from "yandex-music-api-client";

export type ChartItem = TrackItem & {
    track: Track;
    chart: Chart;
};