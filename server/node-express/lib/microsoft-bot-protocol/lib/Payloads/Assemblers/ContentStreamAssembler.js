"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Stream_1 = require("../../Stream");
const PayloadAssembler_1 = require("./PayloadAssembler");
class ContentStreamAssembler extends PayloadAssembler_1.PayloadAssembler {
    constructor(streamManager, id, streamType, length) {
        super(id);
        this.contentType = streamType;
        this.contentLength = length;
        this._streamManager = streamManager;
    }
    createPayloadStream() {
        return new Stream_1.Stream();
    }
    onReceive(header, stream, contentLength) {
        super.onReceive(header, stream, contentLength);
        if (header.End) {
            stream.end(); // We don't have DoneProducing, what should happen here?
        }
    }
    close() {
        this._streamManager.closeStream(this.id);
    }
}
exports.ContentStreamAssembler = ContentStreamAssembler;
//# sourceMappingURL=ContentStreamAssembler.js.map