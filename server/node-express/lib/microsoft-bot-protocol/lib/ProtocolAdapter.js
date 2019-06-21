"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PayloadAssemblerManager_1 = require("./Payloads/PayloadAssemblerManager");
const SendOperations_1 = require("./Payloads/SendOperations");
const StreamManager_1 = require("./Payloads/StreamManager");
const protocol_base_1 = require("./Utilities/protocol-base");
class ProtocolAdapter {
    constructor(requestHandler, requestManager, sender, receiver) {
        this.requestHandler = requestHandler;
        this.requestManager = requestManager;
        this.payloadSender = sender;
        this.payloadReceiver = receiver;
        this.sendOperations = new SendOperations_1.SendOperations(this.payloadSender);
        this.streamManager = new StreamManager_1.StreamManager(this.onCancelStream);
        this.assemblerManager = new PayloadAssemblerManager_1.PayloadAssembleManager(this.streamManager, (id, response) => this.onReceiveResponse(id, response), (id, request) => this.onReceiveRequest(id, request));
        this.payloadReceiver.subscribe((header) => this.assemblerManager.getPayloadStream(header), 
        // tslint:disable-next-line: no-void-expression
        (header, contentStream, contentLength) => this.assemblerManager.onReceive(header, contentStream, contentLength));
    }
    async sendRequestAsync(request, cancellationToken) {
        let requestId = protocol_base_1.generateGuid();
        await this.sendOperations.sendRequestAsync(requestId, request);
        if (cancellationToken) {
            cancellationToken.throwIfCancelled();
        }
        let response = await this.requestManager.getResponseAsync(requestId, cancellationToken);
        if (cancellationToken) {
            cancellationToken.throwIfCancelled();
        }
        return response;
    }
    async onReceiveRequest(id, request) {
        if (this.requestHandler !== undefined) {
            let response = await this.requestHandler.processRequestAsync(request);
            if (response !== undefined) {
                await this.sendOperations.sendResponseAsync(id, response);
            }
        }
    }
    async onReceiveResponse(id, response) {
        await this.requestManager.signalResponse(id, response);
    }
    onCancelStream(contentStreamAssembler) {
        this.sendOperations.sendCancelStreamAsync(contentStreamAssembler.id)
            .catch();
    }
}
exports.ProtocolAdapter = ProtocolAdapter;
//# sourceMappingURL=ProtocolAdapter.js.map