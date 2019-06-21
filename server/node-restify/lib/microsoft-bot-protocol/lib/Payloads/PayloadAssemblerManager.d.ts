import { Stream } from '../Stream';
import { IStreamManager } from './IStreamManager';
import { Header } from './Models/Header';
export declare class PayloadAssembleManager {
    private readonly onReceiveRequest;
    private readonly onReceiveResponse;
    private readonly streamManager;
    private readonly activeAssemblers;
    constructor(streamManager: IStreamManager, onReceiveResponse: Function, onReceiveRequest: any);
    getPayloadStream(header: Header): Stream;
    onReceive(header: Header, contentStream: Stream, contentLength: number): void;
    private createPayloadAssembler;
}
