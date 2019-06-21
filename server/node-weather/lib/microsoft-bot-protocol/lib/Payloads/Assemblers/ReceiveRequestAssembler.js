"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ContentStream_1 = require("../../ContentStream");
const ReceiveRequest_1 = require("../../ReceiveRequest");
const Stream_1 = require("../../Stream");
const PayloadAssembler_1 = require("./PayloadAssembler");
class ReceiveRequestAssembler extends PayloadAssembler_1.PayloadAssembler {
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
        this.processRequest(stream)
            .then()
            .catch();
    }
    requestPayloadfromJson(json) {
        return JSON.parse((json.charCodeAt(0) === 0xFEFF) ? json.slice(1) : json);
    }
    close() {
        throw new Error('Method not implemented.');
    }
    async processRequest(stream) {
        let ps = stream.read(stream.length).toString('utf8');
        let rp = this.requestPayloadfromJson(ps);
        let rr = new ReceiveRequest_1.ReceiveRequest();
        rr.Path = rp.path;
        rr.Verb = rp.verb;
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
exports.ReceiveRequestAssembler = ReceiveRequestAssembler;
//# sourceMappingURL=ReceiveRequestAssembler.js.map