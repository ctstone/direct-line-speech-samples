import { CancellationToken } from './CancellationToken';
import { IRequestManager } from './Payloads/IRequestManager';
import { IPayloadReceiver } from './PayloadTransport/IPayloadReceiver';
import { IPayloadSender } from './PayloadTransport/IPayloadSender';
import { ReceiveRequest } from './ReceiveRequest';
import { ReceiveResponse } from './ReceiveResponse';
import { Request } from './Request';
import { RequestHandler } from './RequestHandler';
export declare class ProtocolAdapter {
    private readonly requestHandler;
    private readonly payloadSender;
    private readonly payloadReceiver;
    private readonly requestManager;
    private readonly sendOperations;
    private readonly streamManager;
    private readonly assemblerManager;
    constructor(requestHandler: RequestHandler, requestManager: IRequestManager, sender: IPayloadSender, receiver: IPayloadReceiver);
    sendRequestAsync(request: Request, cancellationToken?: CancellationToken): Promise<ReceiveResponse>;
    onReceiveRequest(id: string, request: ReceiveRequest): Promise<void>;
    private onReceiveResponse;
    private onCancelStream;
}
