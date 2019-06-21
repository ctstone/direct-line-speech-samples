import { CancellationToken } from '../CancellationToken';
import { ReceiveResponse } from '../ReceiveResponse';
import { IRequestManager } from './IRequestManager';
export declare class RequestManager implements IRequestManager {
    private readonly _pendingRequests;
    pendingRequestCount(): number;
    signalResponse(requestId: string, response: ReceiveResponse): Promise<boolean>;
    getResponseAsync(requestId: string, cancellationToken: CancellationToken): Promise<ReceiveResponse>;
}
