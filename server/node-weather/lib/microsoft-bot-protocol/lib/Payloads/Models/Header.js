"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TransportConstants_1 = require("../../Transport/TransportConstants");
class Header {
    constructor(payloadType, payloadLength, id, end) {
        this.PayloadType = payloadType;
        this.clampLength(payloadLength, TransportConstants_1.TransportContants.MaxLength, TransportConstants_1.TransportContants.MinLength);
        this.PayloadLength = payloadLength;
        this.Id = id;
        this.End = end;
    }
    clampLength(value, max, min) {
        if (value > max) {
            throw new Error(`Length must be less than ${TransportConstants_1.TransportContants.MaxLength.toString()}`);
        }
        if (value < min) {
            throw new Error(`Length must be greater than ${TransportConstants_1.TransportContants.MinLength.toString()}`);
        }
    }
}
exports.Header = Header;
//# sourceMappingURL=Header.js.map