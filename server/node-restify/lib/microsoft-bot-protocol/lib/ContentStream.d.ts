import { ContentStreamAssembler } from './Payloads/Assemblers/ContentStreamAssembler';
import { Stream } from './Stream';
export declare class ContentStream {
    id: string;
    private readonly assembler;
    private stream;
    constructor(id: string, assembler: ContentStreamAssembler);
    readonly payloadType: string;
    readonly length: number;
    getStream(): Stream;
    cancel(): void;
    readAsString(): Promise<string>;
    readAsJson<T>(): Promise<T>;
}
