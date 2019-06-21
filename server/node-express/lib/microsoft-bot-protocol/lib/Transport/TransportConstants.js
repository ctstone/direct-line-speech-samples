"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TransportContants {
    get MaxPayloadLength() { return TransportContants.MaxPayloadLength; }
    get MaxHeaderLength() { return TransportContants.MaxHeaderLength; }
    get MaxLength() { return TransportContants.MaxLength; }
    get MinLength() { return TransportContants.MinLength; }
}
TransportContants.MaxPayloadLength = 4096;
TransportContants.MaxHeaderLength = 48;
TransportContants.MaxLength = 999999;
TransportContants.MinLength = 0;
exports.TransportContants = TransportContants;
//# sourceMappingURL=TransportConstants.js.map