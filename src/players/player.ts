import { IPlayPayload } from "./electronPlayer";

export interface IPlayer {
    on(event: 'ended', listener: () => void): this;
    on(event: 'error', error: any): this;
    play(trackinfo?: IPlayPayload);

    /**
     * Plays audio by given @param url, if url is empty it will resume song which was paused
     * @param url 
     */
    pause();

    /**
     * Rewinds audio backward/forward on given value in seconds.
     * @param sec if positive number rewind forward on provided value. if negative number rewind backward.
     */
    rewind(sec: number);
}