import { Duplex, DuplexOptions, Writable, WritableOptions } from 'stream';
import { ITransportSender } from './Transport/ITransportSender';
export declare class Stream extends Duplex {
    length: number;
    private readonly bufferList;
    private _onData;
    constructor(options?: DuplexOptions);
    _write(chunk: any, encoding: string, callback: (error?: Error | null) => void): void;
    _read(size: number): void;
    subscribe(onData: (chunk: any) => void): void;
}
export declare class TransportSendStream extends Writable {
    private readonly sender;
    constructor(sender: ITransportSender, options?: WritableOptions);
    _write(chunk: any, encoding: string, callback: (error?: Error | null) => void): void;
}
