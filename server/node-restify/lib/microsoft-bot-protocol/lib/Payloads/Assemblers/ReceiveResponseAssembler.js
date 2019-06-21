"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ContentStream_1 = require("../../ContentStream");
const ReceiveResponse_1 = require("../../ReceiveResponse");
const Stream_1 = require("../../Stream");
const PayloadAssembler_1 = require("./PayloadAssembler");
class ReceiveResponseAssembler extends PayloadAssembler_1.PayloadAssembler {
    constructor(header, streamManager, onCompleted) {
        super(header.Id);
        this._streamManager = streamManager;
        this._onCompleted = onCompleted;
    }
    createPayloadStream() {
        return new Stream_1.Stream();
    }
    onReceive(header, stream, contentLength) {
        super.onReceive(header, stream, contentLength);
        this.processResponse(stream)
            .then()
            .catch();
    }
    responsePayloadfromJson(json) {
        return JSON.parse(json);
    }
    close() {
        throw new Error('Method not implemented.');
    }
    stripBOM(input) {
        return (input.charCodeAt(0) === 0xFEFF) ? input.slice(1) : input;
    }
    async processResponse(stream) {
        let ps = stream.read(stream.length).toString('utf8');
        let rp = this.responsePayloadfromJson(this.stripBOM(ps));
        let rr = new ReceiveResponse_1.ReceiveResponse();
        rr.StatusCode = rp.statusCode;
        if (rp.streams) {
            rp.streams.forEach(s => {
                let a = this._streamManager.getPayloadAssembler(s.id);
                a.contentType = s.payloadType;
                a.contentLength = s.length;
                rr.Streams.push(new ContentStream_1.ContentStream(s.id, a));
            });
        }
        await this._onCompleted(this.id, rr);
    }
}
exports.ReceiveResponseAssembler = ReceiveResponseAssembler;
//# sourceMappingURL=ReceiveResponseAssembler.js.map