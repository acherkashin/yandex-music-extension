import { LandingBlockType } from "../interfaces";

export interface LandingBlockEntity<T> {
    id: string;
    type: LandingBlockType;
    data: T;
  }