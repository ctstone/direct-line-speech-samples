import { HttpClient, HttpOperationResponse, WebResource } from '@azure/ms-rest-js';
import { IStreamingTransportServer } from 'microsoft-bot-protocol';
export declare class StreamingHttpClient implements HttpClient {
    private readonly server;
    constructor(server: IStreamingTransportServer);
    sendRequest(httpRequest: WebResource): Promise<HttpOperationResponse>;
    private mapHttpRequestToProtocolRequest;
}
