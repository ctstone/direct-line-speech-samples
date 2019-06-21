import { Stream } from '../../Stream';
import { Header } from '../Models/Header';
export declare abstract class PayloadAssembler {
    id: string;
    end: boolean;
    private stream;
    constructor(id: string);
    getPayloadStream(): Stream;
    abstract createPayloadStream(): Stream;
    onReceive(header: Header, stream?: Stream, contentLength?: number): void;
    abstract close(): void;
}
