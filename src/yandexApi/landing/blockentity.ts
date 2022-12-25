import { LandingBlockType } from "yandex-music-api-client";

export interface LandingBlockEntity<T> {
    id: string;
    type: LandingBlockType;
    data: T;
  }