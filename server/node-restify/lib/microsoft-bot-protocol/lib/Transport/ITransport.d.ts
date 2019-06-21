export interface ITransport {
    isConnected(): boolean;
    close(): any;
}
