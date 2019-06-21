import { HttpContent, HttpContentStream } from './HttpContentStream';
export declare class Request {
    Verb: string;
    Path: string;
    Streams: HttpContentStream[];
    static create(method: string, route?: string, body?: HttpContent): Request;
    addStream(content: HttpContent): void;
    setBody(body: any): void;
}
