import { ITransportReceiver, ITransportSender } from 'microsoft-bot-protocol';
import { Socket } from 'net';
export declare class Transport implements ITransportSender, ITransportReceiver {
    static readonly PipePath: string;
    static readonly ServerIncomingPath: string;
    static readonly ServerOutgoingPath: string;
    private _socket;
    private readonly _queue;
    private _active;
    private _activeOffset;
    private _activeReceiveResolve;
    private _activeReceiveReject;
    private _activeReceiveCount;
    private _name;
    constructor(socket: Socket, name: string);
    send(buffer: Buffer): number;
    isConnected(): boolean;
    close(): void;
    receiveAsync(count: number): Promise<Buffer>;
    private trySignalData;
    private socketReceive;
    private socketClose;
    private socketError;
}
