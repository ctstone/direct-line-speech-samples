import { Socket } from './Socket';
export declare class NodeSocket implements Socket {
    private url;
    private socket;
    constructor({ url, serverSocket }: {
        url?: any;
        serverSocket?: any;
    });
    isConnected(): boolean;
    write(buffer: Buffer): void;
    connectAsync(): Promise<void>;
    setOnMessageHandler(handler: (x: any) => void): void;
    closeAsync(): any;
    setOnErrorHandler(handler: (x: any) => void): void;
    setOnCloseHandler(handler: (x: any) => void): void;
}
