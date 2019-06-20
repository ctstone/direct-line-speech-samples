"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PayloadAssembler {
    constructor(id) {
        this.id = id;
    }
    getPayloadStream() {
        if (!this.stream) {
            this.stream = this.createPayloadStream();
        }
        return this.stream;
    }
    onReceive(header, stream, contentLength) {
        this.end = header.End;
    }
}
exports.PayloadAssembler = PayloadAssembler;
//# sourceMappingURL=PayloadAssembler.js.map