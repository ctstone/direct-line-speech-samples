"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
class Stream extends stream_1.Duplex {
    constructor(options) {
        super(options);
        this.length = 0;
        this.bufferList = [];
    }
    _write(chunk, encoding, callback) {
        let buffer = Buffer.from(chunk);
        this.bufferList.push(buffer);
        this.length += chunk.length;
        if (this._onData) {
            this._onData(buffer);
        }
        callback();
    }
    _read(size) {
        if (this.bufferList.length === 0) {
            // null signals end of stream
            // tslint:disable-next-line:no-null-keyword
            this.push(null);
        }
        else {
            this.push(this.bufferList.shift());
        }
    }
    subscribe(onData) {
        this._onData = onData;
    }
}
exports.Stream = Stream;
class TransportSendStream extends stream_1.Writable {
    constructor(sender, options) {
        super(options);
        this.sender = sender;
    }
    _write(chunk, encoding, callback) {
        try {
            this.sender.send(chunk);
        }
        catch (e) {
            callback(e);
            return;
        }
        callback();
    }
}
exports.TransportSendStream = TransportSendStream;
//# sourceMappingURL=Stream.js.map