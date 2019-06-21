"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PayloadTypes_1 = require("../Models/PayloadTypes");
const ResponsePayload_1 = require("../Models/ResponsePayload");
const PayloadDisassembler_1 = require("./PayloadDisassembler");
class ResponseDisassembler extends PayloadDisassembler_1.PayloadDisassembler {
    constructor(sender, id, response) {
        super(sender, id);
        this.payloadType = PayloadTypes_1.PayloadTypes.response;
        this.response = response;
    }
    async getStream() {
        let payload = new ResponsePayload_1.ResponsePayload(this.response.statusCode);
        if (this.response.streams) {
            payload.streams = [];
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < this.response.streams.length; i++) {
                let contentStream = this.response.streams[i];
                let description = await PayloadDisassembler_1.PayloadDisassembler.getStreamDescription(contentStream);
                payload.streams.push(description);
            }
        }
        return PayloadDisassembler_1.PayloadDisassembler.serialize(payload);
    }
}
exports.ResponseDisassembler = ResponseDisassembler;
//# sourceMappingURL=ResponseDisassembler.js.map