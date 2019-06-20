"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
class NodeSocket {
    constructor({ url = undefined, serverSocket = undefined }) {
        if (url) {
            this.url = url;
            this.socket = new WebSocket(this.url);
        }
        if (serverSocket) {
            this.socket = serverSocket;
        }
    }
    isConnected() {
        return true;
    }
    write(buffer) {
        this.socket.send(buffer);
    }
    async connectAsync() {
        return Promise.resolve();
    }
    setOnMessageHandler(handler) {
        this.socket.on('text', handler);
        this.socket.on('binary', handler);
    }
    closeAsync() {
        return this.socket.end();
    }
    setOnErrorHandler(handler) {
        // Got from error handling best practives from https://github.com/websockets/ws
        this.socket.on('error', (error) => { if (error) {
            handler(error);
        } });
    }
    setOnCloseHandler(handler) {
        this.socket.on('end', handler);
    }
}
exports.NodeSocket = NodeSocket;
//# sourceMappingURL=NodeSocket.js.map