"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ContentStreamAssembler_1 = require("./Assemblers/ContentStreamAssembler");
class StreamManager {
    constructor(onCancelStream) {
        this.activeAssemblers = [];
        this.onCancelStream = onCancelStream;
    }
    getPayloadAssembler(id) {
        if (this.activeAssemblers[id] === undefined) {
            // A new id has come in, kick off the process of tracking it.
            let assembler = new ContentStreamAssembler_1.ContentStreamAssembler(this, id);
            this.activeAssemblers[id] = assembler;
            return assembler;
        }
        else {
            return this.activeAssemblers[id];
        }
    }
    getPayloadStream(header) {
        let assembler = this.getPayloadAssembler(header.Id);
        return assembler.getPayloadStream();
    }
    onReceive(header, contentStream, contentLength) {
        if (this.activeAssemblers[header.Id] === undefined) {
            return;
        }
        else {
            this.activeAssemblers[header.Id].onReceive(header, contentStream, contentLength);
        }
    }
    closeStream(id) {
        if (this.activeAssemblers[id] === undefined) {
            return;
        }
        else {
            let assembler;
            assembler = this.activeAssemblers[id];
            this.activeAssemblers.splice(this.activeAssemblers.indexOf(id), 1);
            let targetStream = assembler.getPayloadStream();
            if ((assembler.contentLength !== undefined
                && targetStream.length < assembler.contentLength)
                || !assembler.end) {
                this.onCancelStream(assembler);
            }
        }
    }
}
exports.StreamManager = StreamManager;
//# sourceMappingURL=StreamManager.js.map