export interface Chart {
  bgColor: string;
  position: number;
  progress: "same" | "up" | "down";
  listeners: number;
  shift: number;
}
