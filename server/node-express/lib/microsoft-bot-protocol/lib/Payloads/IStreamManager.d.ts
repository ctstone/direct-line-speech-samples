import { Stream } from '../Stream';
import { ContentStreamAssembler } from './Assemblers/ContentStreamAssembler';
import { Header } from './Models/Header';
export declare abstract class IStreamManager {
    abstract getPayloadAssembler(id: string): ContentStreamAssembler;
    abstract getPayloadStream(header: Header): Stream;
    abstract onReceive(header: Header, contentStream: Stream, contentLength: number): void;
    abstract closeStream(id: string): void;
}
