import { IPayloadSender } from '../../PayloadTransport/IPayloadSender';
import { Request } from '../../Request';
import { PayloadTypes } from '../Models/PayloadTypes';
import { PayloadDisassembler } from './PayloadDisassembler';
import { StreamWrapper } from './StreamWrapper';
export declare class RequestDisassembler extends PayloadDisassembler {
    request: Request;
    payloadType: PayloadTypes;
    constructor(sender: IPayloadSender, id: string, request: Request);
    getStream(): Promise<StreamWrapper>;
}
