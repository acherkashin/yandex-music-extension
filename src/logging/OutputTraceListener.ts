import { OutputChannel, window } from 'vscode';
import { TraceEventType, TraceFormat, TraceListener } from './TraceSource';

export class OutputTraceListener extends TraceListener {
    channelName: string;
    channel: OutputChannel | null = null;

    constructor(outputChannelName: string) {
        super();
        this.channelName = outputChannelName;
    }
    writeLine(line: string) {
        if (this.channel != null) {
            this.channel.appendLine(line);
        }
    }
    writeEvent(source: string, eventType: TraceEventType, id: string, message: string) {
        const line = TraceFormat.formatEvent(null, source, eventType, id, message);
        this.writeLine(line);
    }
    addOutputChannel() {
        if (this.channel != null) {
            return;
        }
        this.channel = window.createOutputChannel(this.channelName);
    }
    removeOutputChannel() {
        if (this.channel == null) {
            return;
        }
        this.channel.dispose();
        this.channel = null;
    }
}

