"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const microsoft_bot_protocol_1 = require("microsoft-bot-protocol");
const Transport_1 = require("./Transport");
const BrowserSocket_1 = require("./BrowserSocket");
const NodeSocket_1 = require("./NodeSocket");
class Client {
    constructor({ url = undefined, requestHandler = undefined, autoReconnect = true }) {
        this._url = url;
        this._requestHandler = requestHandler;
        this._autoReconnect = autoReconnect;
        this._requestManager = new microsoft_bot_protocol_1.RequestManager();
        this._sender = new microsoft_bot_protocol_1.PayloadSender();
        this._sender.disconnected = this.onConnectionDisocnnected;
        this._receiver = new microsoft_bot_protocol_1.PayloadReceiver();
        this._receiver.disconnected = this.onConnectionDisocnnected;
        this._protocolAdapter = new microsoft_bot_protocol_1.ProtocolAdapter(this._requestHandler, this._requestManager, this._sender, this._receiver);
    }
    async connectAsync() {
        if (typeof WebSocket !== 'undefined') {
            const ws = new BrowserSocket_1.BrowserSocket(this._url);
            await ws.connectAsync();
            const transport = new Transport_1.Transport(ws);
            this._sender.connect(transport);
            this._receiver.connect(transport);
        }
        else {
            const ws = new NodeSocket_1.NodeSocket({ url: this._url });
            await ws.connectAsync();
            const transport = new Transport_1.Transport(ws);
            this._sender.connect(transport);
            this._receiver.connect(transport);
        }
    }
    disconnect() {
        this._sender.disconnect('');
        this._receiver.disconnect('');
    }
    async sendAsync(request, cancellationToken) {
        return this._protocolAdapter.sendRequestAsync(request, cancellationToken);
    }
    onConnectionDisocnnected(sender, args) {
    }
}
exports.Client = Client;
//# sourceMappingURL=Client.js.map