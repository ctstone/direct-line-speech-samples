import { StreamDescription } from './StreamDescription';
export declare class ResponsePayload {
    statusCode: number;
    streams: StreamDescription[];
    constructor(statusCode: number);
}
