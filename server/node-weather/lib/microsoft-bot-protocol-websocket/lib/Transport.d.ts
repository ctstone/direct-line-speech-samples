import { ITransportReceiver, ITransportSender } from 'microsoft-bot-protocol';
import { Socket } from './Socket';
export declare class Transport implements ITransportSender, ITransportReceiver {
    private _socket;
    private readonly _queue;
    private _active;
    private _activeOffset;
    private _activeReceiveResolve;
    private _activeReceiveReject;
    private _activeReceiveCount;
    constructor(ws: Socket);
    send(buffer: Buffer): number;
    isConnected(): boolean;
    close(): void;
    receiveAsync(count: number): Promise<Buffer>;
    onReceive(thisObject: any, data: Buffer): void;
    private trySignalData;
    private onClose;
    private onError;
}
