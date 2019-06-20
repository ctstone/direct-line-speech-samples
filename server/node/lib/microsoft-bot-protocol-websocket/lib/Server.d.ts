import { CancellationToken, IStreamingTransportServer, ReceiveResponse, Request, RequestHandler } from 'microsoft-bot-protocol';
import { Socket } from './Socket';
export declare class Server implements IStreamingTransportServer {
    private readonly _url;
    private readonly _requestHandler;
    private readonly _sender;
    private readonly _receiver;
    private readonly _requestManager;
    private readonly _protocolAdapter;
    private readonly _webSocketTransport;
    private _closedSignal;
    constructor(socket: Socket, requestHandler?: RequestHandler);
    startAsync(): Promise<string>;
    sendAsync(request: Request, cancellationToken: CancellationToken): Promise<ReceiveResponse>;
    disconnect(): void;
    private onConnectionDisocnnected;
}
