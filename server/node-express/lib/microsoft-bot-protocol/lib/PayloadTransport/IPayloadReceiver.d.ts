import { Header } from '../Payloads/Models/Header';
import { Stream } from '../Stream';
import { ITransportReceiver } from '../Transport/ITransportReceiver';
export interface IPayloadReceiver {
    isConnected: boolean;
    disconnected: (sender: object, args: any) => void;
    connect(receiver: ITransportReceiver): any;
    subscribe(getStream: (header: Header) => Stream, receiveAction: (header: Header, stream: Stream, count: number) => void): any;
    disconnect(disconnectArgs: any): any;
}
