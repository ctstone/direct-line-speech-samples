"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SendPacket {
    constructor(header, payload, sentCallback) {
        this.header = header;
        this.payload = payload;
        this.sentCallback = sentCallback;
    }
}
exports.SendPacket = SendPacket;
//# sourceMappingURL=SendPacket.js.map