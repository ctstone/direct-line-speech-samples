"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BrowserSocket {
    constructor(url) {
        this.url = url;
    }
    connectAsync() {
        let resolver;
        let rejector;
        this.socket = new WebSocket(this.url);
        this.socket.onerror = (e) => {
            rejector(e);
        };
        this.socket.onopen = (e) => {
            resolver(e);
        };
        return new Promise((resolve, reject) => {
            resolver = resolve;
            rejector = reject;
        });
    }
    isConnected() {
        return this.socket.readyState === WebSocket.OPEN;
    }
    write(buffer) {
        console.log("WRITE BUFFER");
        this.socket.send(buffer);
    }
    closeAsync() {
        return this.socket.close();
    }
    setOnMessageHandler(handler) {
        this.socket.onmessage = (evt) => {
            var fileReader = new FileReader();
            fileReader.onload = (e) => {
                let t = e.target;
                console.log(t.result);
                handler(t.result);
            };
            fileReader.readAsArrayBuffer(evt.data);
        };
    }
    setOnErrorHandler(handler) {
        this.socket.onerror = (error) => { if (error)
            handler(error); };
    }
    setOnCloseHandler(handler) {
        this.socket.onclose = (data) => handler(data);
    }
}
exports.BrowserSocket = BrowserSocket;
//# sourceMappingURL=BrowserSocket.js.map