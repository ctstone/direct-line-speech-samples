import { Stream } from './Stream';
export declare class HttpContentStream {
    readonly id: string;
    readonly content: HttpContent;
    constructor(content: HttpContent);
}
export declare class HttpContent {
    headers: IHttpContentHeaders;
    private readonly stream;
    constructor(headers: IHttpContentHeaders, stream: Stream);
    getStream(): Stream;
}
export interface IHttpContentHeaders {
    contentType?: string;
    contentLength?: number;
}
export declare class HttpContentHeaders implements IHttpContentHeaders {
    contentType?: string;
    contentLength?: number;
}
