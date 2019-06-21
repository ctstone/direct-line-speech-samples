import { IPayloadSender } from '../../PayloadTransport/IPayloadSender';
import { Response } from '../../Response';
import { PayloadTypes } from '../Models/PayloadTypes';
import { PayloadDisassembler } from './PayloadDisassembler';
import { StreamWrapper } from './StreamWrapper';
export declare class ResponseDisassembler extends PayloadDisassembler {
    readonly response: Response;
    readonly payloadType: PayloadTypes;
    constructor(sender: IPayloadSender, id: string, response: Response);
    getStream(): Promise<StreamWrapper>;
}
