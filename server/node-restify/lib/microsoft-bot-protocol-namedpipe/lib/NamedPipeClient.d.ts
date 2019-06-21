import { CancellationToken, IStreamingTransportClient, ReceiveResponse, Request, RequestHandler } from 'microsoft-bot-protocol';
export declare class NamedPipeClient implements IStreamingTransportClient {
    private readonly _baseName;
    private readonly _requestHandler;
    private readonly _sender;
    private readonly _receiver;
    private readonly _requestManager;
    private readonly _protocolAdapter;
    private readonly _autoReconnect;
    private _isDisconnecting;
    constructor(baseName: string, requestHandler?: RequestHandler, autoReconnect?: boolean);
    connectAsync(): Promise<void>;
    disconnect(): void;
    sendAsync(request: Request, cancellationToken: CancellationToken): Promise<ReceiveResponse>;
    private onConnectionDisconnected;
}
