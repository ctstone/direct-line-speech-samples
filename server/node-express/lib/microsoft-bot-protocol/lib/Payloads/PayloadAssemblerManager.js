"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ReceiveRequestAssembler_1 = require("./Assemblers/ReceiveRequestAssembler");
const ReceiveResponseAssembler_1 = require("./Assemblers/ReceiveResponseAssembler");
const PayloadTypes_1 = require("./Models/PayloadTypes");
class PayloadAssembleManager {
    constructor(streamManager, onReceiveResponse, onReceiveRequest) {
        this.activeAssemblers = {};
        this.streamManager = streamManager;
        this.onReceiveRequest = onReceiveRequest;
        this.onReceiveResponse = onReceiveResponse;
    }
    getPayloadStream(header) {
        if (header.PayloadType === PayloadTypes_1.PayloadTypes.stream) {
            return this.streamManager.getPayloadStream(header);
        }
        else {
            if (this.activeAssemblers[header.Id] === undefined) {
                let assembler = this.createPayloadAssembler(header);
                if (assembler !== undefined) {
                    this.activeAssemblers[header.Id] = assembler;
                    return assembler.getPayloadStream();
                }
            }
        }
        return undefined;
    }
    onReceive(header, contentStream, contentLength) {
        if (header.PayloadType === PayloadTypes_1.PayloadTypes.stream) {
            this.streamManager.onReceive(header, contentStream, contentLength);
        }
        else {
            if (this.activeAssemblers !== undefined && this.activeAssemblers[header.Id] !== undefined) {
                let assembler = this.activeAssemblers[header.Id];
                assembler.onReceive(header, contentStream, contentLength);
            }
            if (header.End) {
                // tslint:disable-next-line: no-dynamic-delete
                delete this.activeAssemblers[header.Id];
            }
        }
    }
    createPayloadAssembler(header) {
        switch (header.PayloadType) {
            case PayloadTypes_1.PayloadTypes.request:
                return new ReceiveRequestAssembler_1.ReceiveRequestAssembler(header, this.streamManager, this.onReceiveRequest);
                break;
            case PayloadTypes_1.PayloadTypes.response:
                return new ReceiveResponseAssembler_1.ReceiveResponseAssembler(header, this.streamManager, this.onReceiveResponse);
                break;
            default:
        }
    }
}
exports.PayloadAssembleManager = PayloadAssembleManager;
//# sourceMappingURL=PayloadAssemblerManager.js.map