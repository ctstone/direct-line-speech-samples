"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PayloadTypes_1 = require("../Models/PayloadTypes");
const RequestPayload_1 = require("../Models/RequestPayload");
const PayloadDisassembler_1 = require("./PayloadDisassembler");
class RequestDisassembler extends PayloadDisassembler_1.PayloadDisassembler {
    constructor(sender, id, request) {
        super(sender, id);
        this.payloadType = PayloadTypes_1.PayloadTypes.request;
        this.request = request;
    }
    async getStream() {
        let payload = new RequestPayload_1.RequestPayload(this.request.Verb, this.request.Path);
        if (this.request.Streams) {
            payload.streams = [];
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < this.request.Streams.length; i++) {
                let contentStream = this.request.Streams[i];
                let description = await PayloadDisassembler_1.PayloadDisassembler.getStreamDescription(contentStream);
                payload.streams.push(description);
            }
        }
        return PayloadDisassembler_1.PayloadDisassembler.serialize(payload);
    }
}
exports.RequestDisassembler = RequestDisassembler;
//# sourceMappingURL=RequestDisassembler.js.map