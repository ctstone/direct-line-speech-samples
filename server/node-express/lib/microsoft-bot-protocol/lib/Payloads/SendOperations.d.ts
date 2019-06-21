import { IPayloadSender } from '../PayloadTransport/IPayloadSender';
import { Request } from '../Request';
import { Response } from '../Response';
export declare class SendOperations {
    private readonly payloadSender;
    constructor(payloadSender: IPayloadSender);
    sendRequestAsync(id: string, request: Request): Promise<void>;
    sendResponseAsync(id: string, response: Response): Promise<void>;
    sendCancelStreamAsync(id: string): Promise<void>;
}
