export interface Socket {
    isConnected(): boolean;
    write(buffer: Buffer): any;
    connectAsync(): Promise<void>;
    closeAsync(): any;
    setOnMessageHandler(handler: (x: any) => void): any;
    setOnErrorHandler(handler: (x: any) => void): any;
    setOnCloseHandler(handler: (x: any) => void): any;
}
