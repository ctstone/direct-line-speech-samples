import { ContentStream } from '../../ContentStream';
import { Stream } from '../../Stream';
import { ContentStreamAssembler } from '../Assemblers/ContentStreamAssembler';
import { Header } from './Header';
export declare abstract class IStreamManager {
    abstract getPayloadAssembler(id: string): ContentStreamAssembler;
    abstract getPayloadStream(header: Header): Stream;
    abstract onReceive(header: Header, contentStream: ContentStream, contentLength: number): void;
    abstract closeStream(id: string): void;
}
