import { Stream } from '../../Stream';
import { IStreamManager } from '../IStreamManager';
import { Header } from '../Models/Header';
import { ResponsePayload } from '../Models/ResponsePayload';
import { PayloadAssembler } from './PayloadAssembler';
export declare class ReceiveResponseAssembler extends PayloadAssembler {
    private readonly _onCompleted;
    private readonly _streamManager;
    constructor(header: Header, streamManager: IStreamManager, onCompleted: Function);
    createPayloadStream(): Stream;
    onReceive(header: Header, stream: Stream, contentLength: number): void;
    responsePayloadfromJson(json: string): ResponsePayload;
    close(): void;
    private stripBOM;
    private processResponse;
}
