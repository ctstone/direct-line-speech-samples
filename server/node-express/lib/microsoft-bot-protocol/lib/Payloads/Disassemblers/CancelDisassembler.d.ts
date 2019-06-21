import { IPayloadSender } from '../../PayloadTransport/IPayloadSender';
import { PayloadTypes } from '../Models/PayloadTypes';
export declare class CancelDisassembler {
    private readonly sender;
    private readonly id;
    private readonly payloadType;
    constructor(sender: IPayloadSender, id: string, payloadType: PayloadTypes);
    disassemble(): void;
}
