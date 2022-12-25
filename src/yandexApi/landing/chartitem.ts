import { TrackItem, Chart } from "yandex-music-api-client";
import { Track } from "../interfaces";

export type ChartItem = TrackItem & {
    track: Track;
    chart: Chart;
};