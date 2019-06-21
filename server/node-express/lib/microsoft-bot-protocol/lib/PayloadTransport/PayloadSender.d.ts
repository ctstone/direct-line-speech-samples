import { Header } from '../Payloads/Models/Header';
import { Stream } from '../Stream';
import { ITransportSender } from '../Transport/ITransportSender';
import { IPayloadSender } from './IPayloadSender';
import { TransportDisconnectedEventArgs } from './TransportDisconnectedEventArgs';
import { TransportDisconnectedEventHandler } from './TransportDisconnectedEventHandler';
export declare class PayloadSender implements IPayloadSender {
    disconnected?: TransportDisconnectedEventHandler;
    private sender;
    private readonly sendHeaderBuffer;
    readonly isConnected: boolean;
    connect(sender: ITransportSender): void;
    sendPayload(header: Header, payload: Stream, sentCallback: () => Promise<void>): void;
    disconnect(e: TransportDisconnectedEventArgs): void;
    private writePacket;
}
