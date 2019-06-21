import { HttpContentStream } from '../../HttpContentStream';
import { IPayloadSender } from '../../PayloadTransport/IPayloadSender';
import { PayloadTypes } from '../Models/PayloadTypes';
import { PayloadDisassembler } from './PayloadDisassembler';
import { StreamWrapper } from './StreamWrapper';
export declare class HttpContentStreamDisassembler extends PayloadDisassembler {
    readonly contentStream: HttpContentStream;
    payloadType: PayloadTypes;
    constructor(sender: IPayloadSender, contentStream: HttpContentStream);
    getStream(): Promise<StreamWrapper>;
}
