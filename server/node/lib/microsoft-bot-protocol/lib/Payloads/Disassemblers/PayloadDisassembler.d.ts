import { HttpContentStream } from '../../HttpContentStream';
import { IPayloadSender } from '../../PayloadTransport/IPayloadSender';
import { PayloadTypes } from '../Models/PayloadTypes';
import { StreamDescription } from '../Models/StreamDescription';
import { StreamWrapper } from './StreamWrapper';
export declare abstract class PayloadDisassembler {
    abstract payloadType: PayloadTypes;
    private readonly sender;
    private stream;
    private streamLength?;
    private readonly id;
    constructor(sender: IPayloadSender, id: string);
    protected static getStreamDescription(stream: HttpContentStream): Promise<StreamDescription>;
    protected static serialize<T>(item: T): StreamWrapper;
    abstract getStream(): Promise<StreamWrapper>;
    disassemble(): Promise<void>;
    private send;
}
