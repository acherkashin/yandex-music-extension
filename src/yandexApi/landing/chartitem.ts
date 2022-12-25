import { TrackItem } from "yandex-music-api-client"
import { Track } from "../interfaces";
import { Chart } from "./chart";

export type ChartItem = TrackItem & {
    track: Track;
    chart: Chart;
};