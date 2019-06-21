export declare class Header {
    PayloadType: string;
    PayloadLength: number;
    Id: string;
    End: boolean;
    constructor(payloadType: string, payloadLength: number, id: string, end: boolean);
    private clampLength;
}
