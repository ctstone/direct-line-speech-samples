import { Header } from '../Payloads/Models/Header';
import { Stream } from '../Stream';
import { ITransportReceiver } from '../Transport/ITransportReceiver';
import { IPayloadReceiver } from './IPayloadReceiver';
export declare class PayloadReceiver implements IPayloadReceiver {
    isConnected: boolean;
    disconnected: (sender: object, args: any) => void;
    private _receiver;
    private _receiveHeaderBuffer;
    private _receivePayloadBuffer;
    private _getStream;
    private _receiveAction;
    connect(receiver: ITransportReceiver): void;
    subscribe(getStream: (header: Header) => Stream, receiveAction: (header: Header, stream: Stream, count: number) => void): void;
    disconnect(disconnectArgs: any): void;
    runReceive(): void;
    private receivePacketsAsync;
}
