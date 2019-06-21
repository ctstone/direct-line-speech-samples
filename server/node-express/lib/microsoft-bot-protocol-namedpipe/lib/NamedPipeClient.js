"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const microsoft_bot_protocol_1 = require("microsoft-bot-protocol");
const net_1 = require("net");
const Transport_1 = require("./Transport");
class NamedPipeClient {
    constructor(baseName, requestHandler, autoReconnect = true) {
        this._baseName = baseName;
        this._requestHandler = requestHandler;
        this._autoReconnect = autoReconnect;
        this._requestManager = new microsoft_bot_protocol_1.RequestManager();
        this._sender = new microsoft_bot_protocol_1.PayloadSender();
        this._sender.disconnected = (x, y) => this.onConnectionDisconnected(this, x, y);
        this._receiver = new microsoft_bot_protocol_1.PayloadReceiver();
        this._receiver.disconnected = (x, y) => this.onConnectionDisconnected(this, x, y);
        this._protocolAdapter = new microsoft_bot_protocol_1.ProtocolAdapter(this._requestHandler, this._requestManager, this._sender, this._receiver);
        this._isDisconnecting = false;
    }
    async connectAsync() {
        let outgoingPipeName = Transport_1.Transport.PipePath + this._baseName + Transport_1.Transport.ServerIncomingPath;
        let outgoing = net_1.connect(outgoingPipeName);
        let incomingPipeName = Transport_1.Transport.PipePath + this._baseName + Transport_1.Transport.ServerOutgoingPath;
        let incoming = net_1.connect(incomingPipeName);
        this._sender.connect(new Transport_1.Transport(outgoing, 'clientSender'));
        this._receiver.connect(new Transport_1.Transport(incoming, 'clientReceiver'));
    }
    disconnect() {
        this._sender.disconnect(undefined);
        this._receiver.disconnect(undefined);
    }
    async sendAsync(request, cancellationToken) {
        return this._protocolAdapter.sendRequestAsync(request, cancellationToken);
    }
    onConnectionDisconnected(c, sender, args) {
        if (!c._isDisconnecting) {
            c._isDisconnecting = true;
            try {
                if (c._sender.isConnected) {
                    c._sender.disconnect(undefined);
                }
                if (c._receiver.isConnected) {
                    c._receiver.disconnect(undefined);
                }
                if (c._autoReconnect) {
                    /* tslint:disable:no-floating-promises */
                    c.connectAsync()
                        .then(() => {
                        // connected
                    });
                }
            }
            finally {
                c._isDisconnecting = false;
            }
        }
    }
}
exports.NamedPipeClient = NamedPipeClient;
//# sourceMappingURL=NamedPipeClient.js.map