import { CancellationToken, IStreamingTransportServer, ReceiveResponse, Request, RequestHandler } from 'microsoft-bot-protocol';
export declare class NamedPipeServer implements IStreamingTransportServer {
    private _outgoingServer;
    private _incomingServer;
    private readonly _baseName;
    private readonly _requestHandler;
    private readonly _sender;
    private readonly _receiver;
    private readonly _requestManager;
    private readonly _protocolAdapter;
    private readonly _autoReconnect;
    private _isDisconnecting;
    private _onClose;
    constructor(baseName: string, requestHandler?: RequestHandler, autoReconnect?: boolean);
    startAsync(): Promise<string>;
    disconnect(): void;
    sendAsync(request: Request, cancellationToken: CancellationToken): Promise<ReceiveResponse>;
    private onConnectionDisconnected;
}
