"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const microsoft_bot_protocol_1 = require("microsoft-bot-protocol");
const Transport_1 = require("./Transport");
class Server {
    constructor(socket, requestHandler) {
        this._webSocketTransport = new Transport_1.Transport(socket);
        this._requestHandler = requestHandler;
        this._requestManager = new microsoft_bot_protocol_1.RequestManager();
        this._sender = new microsoft_bot_protocol_1.PayloadSender();
        this._sender.disconnected = (x, y) => this.onConnectionDisocnnected(this, x, y);
        this._receiver = new microsoft_bot_protocol_1.PayloadReceiver();
        this._receiver.disconnected = (x, y) => this.onConnectionDisocnnected(this, x, y);
        this._protocolAdapter = new microsoft_bot_protocol_1.ProtocolAdapter(this._requestHandler, this._requestManager, this._sender, this._receiver);
    }
    async startAsync() {
        this._sender.connect(this._webSocketTransport);
        this._receiver.connect(this._webSocketTransport);
        return new Promise(resolve => this._closedSignal = resolve);
    }
    async sendAsync(request, cancellationToken) {
        return this._protocolAdapter.sendRequestAsync(request, cancellationToken);
    }
    disconnect() {
        this._sender.disconnect(null);
        this._receiver.disconnect(null);
    }
    onConnectionDisocnnected(s, sender, args) {
        s._closedSignal("close");
    }
}
exports.Server = Server;
//# sourceMappingURL=Server.js.map