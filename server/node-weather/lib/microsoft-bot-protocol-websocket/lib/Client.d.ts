import { CancellationToken, IStreamingTransportClient, ReceiveResponse, Request } from 'microsoft-bot-protocol';
export declare class Client implements IStreamingTransportClient {
    private readonly _url;
    private readonly _requestHandler;
    private readonly _sender;
    private readonly _receiver;
    private readonly _requestManager;
    private readonly _protocolAdapter;
    private readonly _autoReconnect;
    constructor({ url, requestHandler, autoReconnect }: {
        url?: any;
        requestHandler?: any;
        autoReconnect?: boolean;
    });
    connectAsync(): Promise<void>;
    disconnect(): void;
    sendAsync(request: Request, cancellationToken: CancellationToken): Promise<ReceiveResponse>;
    private onConnectionDisocnnected;
}
