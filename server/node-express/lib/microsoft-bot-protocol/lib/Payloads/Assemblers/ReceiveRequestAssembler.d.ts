import { Stream } from '../../Stream';
import { IStreamManager } from '../IStreamManager';
import { Header } from '../Models/Header';
import { RequestPayload } from '../Models/RequestPayload';
import { PayloadAssembler } from './PayloadAssembler';
export declare class ReceiveRequestAssembler extends PayloadAssembler {
    private readonly _onCompleted;
    private readonly _streamManager;
    constructor(header: Header, streamManager: IStreamManager, onCompleted: Function);
    createPayloadStream(): Stream;
    onReceive(header: Header, stream: Stream, contentLength: number): void;
    requestPayloadfromJson(json: string): RequestPayload;
    close(): void;
    private processRequest;
}
