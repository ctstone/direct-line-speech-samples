import { Socket } from "./Socket";
export declare class BrowserSocket implements Socket {
    private url;
    private socket;
    constructor(url: string);
    connectAsync(): Promise<void>;
    isConnected(): boolean;
    write(buffer: Buffer): void;
    closeAsync(): void;
    setOnMessageHandler(handler: (x: any) => void): void;
    setOnErrorHandler(handler: (x: any) => void): void;
    setOnCloseHandler(handler: (x: any) => void): void;
}
