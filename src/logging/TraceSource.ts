import events = require("events");

export enum TraceEventType {
    Critical = 1,
    Error = 2,
    Warning = 4,
    Information = 8,
    Verbose = 16,
    Start = 256,
    Stop = 512,
    Suspend = 1024,
    Resume = 2048,
    Transfer = 4096,
}

const lineEventName = 'line';
const eventEventName = 'event';

/**
 * Source for tracing events that associates a name with every event.
 */
export class TraceSource extends events.EventEmitter {
    name: string;

    constructor(name) {
        super();
        this.name = name;
    }
    /**
     * Creates a new TraceSource with listeners copied from the existing TraceSource.
     */
    // withName(name) {
    //     const newTraceSource = new TraceSource(name);
    //     this.eventNames().forEach((eventName) => {
    //         this.listeners(eventName).forEach(listener => {
    //             newTraceSource.on(eventName, listener);
    //         });
    //     });
    //     return newTraceSource;
    // }
    addTraceListener(listener: TraceListener) {
        this.on(eventEventName, listener.traceEvent.bind(listener));
        this.on(lineEventName, listener.writeLine.bind(listener));
    }
    writeLine(line: string) {
        this.emit(lineEventName, line);
    }
    traceEvent(eventType: TraceEventType, id: string, message: string) {
        this.emit(eventEventName, this.name, eventType, id, message);
    }
    errorEvent(id: string, message: string) {
        this.traceEvent(TraceEventType.Error, id, message);
    }
    warningEvent(id: string, message: string) {
        this.traceEvent(TraceEventType.Warning, id, message);
    }
    infoEvent(id: string, message: string) {
        this.traceEvent(TraceEventType.Information, id, message);
    }
    error(message: string) {
        this.traceEvent(TraceEventType.Error, "0", message);
    }
    warning(message: string) {
        this.traceEvent(TraceEventType.Warning, "0", message);
    }
    info(message: string) {
        this.traceEvent(TraceEventType.Information, "0", message);
    }
    verbose(message: string) {
        this.traceEvent(TraceEventType.Verbose, "0", message);
    }
}


/**
 * Base class for a listener for events from a TraceSource.
 */
export abstract class TraceListener {
    traceEvent(source: string, eventType: TraceEventType, id: string, message: string) {
        // if (!this.filter || this.filter.shouldTrace(source, eventType, id)) {
        this.writeEvent(source, eventType, id, message);
        // }
    }

    abstract writeEvent(source: string, eventType: TraceEventType, id: string, message: string): void;

    abstract writeLine(line: string): void;
}


export class TraceFormat {
    static maxMessageLength = 5120;

    static formatEvent(time: Date | null, source: string, eventType: TraceEventType, id: string, message: string) {
        let eventTypeChar;
        switch (eventType) {
            case TraceEventType.Critical:
                eventTypeChar = 'C';
                break;
            case TraceEventType.Error:
                eventTypeChar = 'E';
                break;
            case TraceEventType.Warning:
                eventTypeChar = 'W';
                break;
            case TraceEventType.Information:
                eventTypeChar = 'I';
                break;
            case TraceEventType.Verbose:
                eventTypeChar = 'V';
                break;
            case TraceEventType.Start:
                eventTypeChar = '>';
                break;
            case TraceEventType.Stop:
                eventTypeChar = '<';
                break;
            default:
                eventTypeChar = '?';
                break;
        }
        // const dateString = time === null ? '' : dateformat(time, 'yyyy-mm-dd HH:MM:ss.l ', /*utc*/ true);
        const dateString = time?.toISOString() ?? "";

        if (message.length > TraceFormat.maxMessageLength) {
            message = message.substr(0, TraceFormat.maxMessageLength) + '...';
        }
        let line = id !== "0" ?
            `[${dateString}${source} ${eventTypeChar}] (${id}) ${message}` :
            `[${dateString}${source} ${eventTypeChar}] ${message}`;

        return line;
    }
}

export const defaultTraceSource = new TraceSource('YandexMusicExtension');
