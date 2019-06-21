"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const microsoft_bot_protocol_1 = require("microsoft-bot-protocol");
const net_1 = require("net");
const Transport_1 = require("./Transport");
class NamedPipeServer {
    constructor(baseName, requestHandler, autoReconnect = true) {
        this._baseName = baseName;
        this._requestHandler = requestHandler;
        this._autoReconnect = autoReconnect;
        this._requestManager = new microsoft_bot_protocol_1.RequestManager();
        this._sender = new microsoft_bot_protocol_1.PayloadSender();
        this._receiver = new microsoft_bot_protocol_1.PayloadReceiver();
        this._protocolAdapter = new microsoft_bot_protocol_1.ProtocolAdapter(this._requestHandler, this._requestManager, this._sender, this._receiver);
        this._isDisconnecting = false;
        this._sender.disconnected = (x, y) => {
            this.onConnectionDisconnected(this, x, y);
        };
        this._receiver.disconnected = (x, y) => {
            this.onConnectionDisconnected(this, x, y);
        };
    }
    /* tslint:disable:promise-function-async promise-must-complete */
    startAsync() {
        let incomingConnect = false;
        let outgoingConnect = false;
        let result = new Promise((resolve, reject) => {
            this._onClose = resolve;
        });
        let incomingPipeName = Transport_1.Transport.PipePath + this._baseName + Transport_1.Transport.ServerIncomingPath;
        this._incomingServer = new net_1.Server((socket) => {
            this._receiver.connect(new Transport_1.Transport(socket, 'serverReceiver'));
            incomingConnect = true;
            if (incomingConnect && outgoingConnect) {
                this._onClose('connected');
            }
        });
        this._incomingServer.listen(incomingPipeName);
        let outgoingPipeName = Transport_1.Transport.PipePath + this._baseName + Transport_1.Transport.ServerOutgoingPath;
        this._outgoingServer = new net_1.Server((socket) => {
            this._sender.connect(new Transport_1.Transport(socket, 'serverSender'));
            outgoingConnect = true;
            if (incomingConnect && outgoingConnect) {
                this._onClose('connected');
            }
        });
        this._outgoingServer.listen(outgoingPipeName);
        return result;
    }
    disconnect() {
        this._sender.disconnect(undefined);
        this._receiver.disconnect(undefined);
        if (this._incomingServer) {
            this._incomingServer.close();
            this._incomingServer = undefined;
        }
        if (this._outgoingServer) {
            this._outgoingServer.close();
            this._outgoingServer = undefined;
        }
    }
    async sendAsync(request, cancellationToken) {
        return this._protocolAdapter.sendRequestAsync(request, cancellationToken);
    }
    onConnectionDisconnected(s, sender, args) {
        if (!s._isDisconnecting) {
            s._isDisconnecting = true;
            //s._onClose("close");
            try {
                if (s._sender.isConnected) {
                    s._sender.disconnect(undefined);
                }
                if (s._receiver.isConnected) {
                    s._receiver.disconnect(undefined);
                }
                if (s._autoReconnect) {
                    /* tslint:disable:no-floating-promises */
                    s.startAsync()
                        .then(() => {
                        // started
                    });
                }
            }
            finally {
                s._isDisconnecting = false;
            }
        }
    }
}
exports.NamedPipeServer = NamedPipeServer;
//# sourceMappingURL=NamedPipeServer.js.map