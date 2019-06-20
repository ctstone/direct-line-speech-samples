import { Header } from '../Payloads/Models/Header';
import { Stream } from '../Stream';
export declare class SendPacket {
    header: Header;
    payload: Stream;
    sentCallback: () => Promise<void>;
    constructor(header: Header, payload: Stream, sentCallback: () => Promise<void>);
}
