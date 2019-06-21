import { Stream } from '../Stream';
import { ContentStreamAssembler } from './Assemblers/ContentStreamAssembler';
import { IStreamManager } from './IStreamManager';
import { Header } from './Models/Header';
export declare class StreamManager implements IStreamManager {
    private readonly activeAssemblers;
    private readonly onCancelStream;
    constructor(onCancelStream: Function);
    getPayloadAssembler(id: string): ContentStreamAssembler;
    getPayloadStream(header: Header): Stream;
    onReceive(header: Header, contentStream: Stream, contentLength: number): void;
    closeStream(id: string): void;
}
