import { StreamDescription } from './StreamDescription';
export declare class RequestPayload {
    verb: string;
    path: string;
    streams: StreamDescription[];
    constructor(verb: string, path: string);
}
