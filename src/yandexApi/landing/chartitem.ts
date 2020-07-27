import { Track, TrackItem } from "../interfaces";
import { Chart } from "./chart";

export interface ChartItem extends TrackItem{
    track: Track;
    chart: Chart;
}