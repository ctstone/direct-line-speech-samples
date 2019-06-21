"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Stream_1 = require("../../Stream");
const Header_1 = require("../Models/Header");
const StreamDescription_1 = require("../Models/StreamDescription");
const StreamWrapper_1 = require("./StreamWrapper");
class PayloadDisassembler {
    constructor(sender, id) {
        this.sender = sender;
        this.id = id;
    }
    static async getStreamDescription(stream) {
        let description = new StreamDescription_1.StreamDescription(stream.id);
        description.payloadType = stream.content.headers.contentType;
        description.length = stream.content.headers.contentLength;
        return description;
    }
    static serialize(item) {
        let stream = new Stream_1.Stream();
        stream.write(JSON.stringify(item));
        stream.end();
        return new StreamWrapper_1.StreamWrapper(stream, stream.length);
    }
    async disassemble() {
        let w = await this.getStream();
        this.stream = w.stream;
        this.streamLength = w.streamLength;
        return this.send();
    }
    async send() {
        let header = new Header_1.Header(this.payloadType, this.streamLength, this.id, true);
        this.sender.sendPayload(header, this.stream, undefined);
    }
}
exports.PayloadDisassembler = PayloadDisassembler;
//# sourceMappingURL=PayloadDisassembler.js.map