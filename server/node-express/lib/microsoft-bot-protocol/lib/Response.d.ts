import { HttpContent, HttpContentStream } from './HttpContentStream';
export declare class Response {
    statusCode: number;
    streams: HttpContentStream[];
    static create(statusCode: number, body?: HttpContent): Response;
    addStream(content: HttpContent): void;
    setBody(body: any): void;
}
