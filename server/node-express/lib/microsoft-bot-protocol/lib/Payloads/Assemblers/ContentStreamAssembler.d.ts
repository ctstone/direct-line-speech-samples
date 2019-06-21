import { Stream } from '../../Stream';
import { IStreamManager } from '../IStreamManager';
import { Header } from '../Models/Header';
import { PayloadAssembler } from './PayloadAssembler';
export declare class ContentStreamAssembler extends PayloadAssembler {
    contentLength: number;
    contentType: string;
    private readonly _streamManager;
    constructor(streamManager: IStreamManager, id: string, streamType?: string, length?: number);
    createPayloadStream(): Stream;
    onReceive(header: Header, stream: Stream, contentLength: number): void;
    close(): void;
}
