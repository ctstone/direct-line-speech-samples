"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Transport {
    constructor(ws) {
        this._socket = ws;
        this._queue = [];
        this._activeOffset = 0;
        this._activeReceiveCount = 0;
        this._socket.setOnMessageHandler((d) => this.onReceive(this, d));
        this._socket.setOnErrorHandler((d) => this.onError(this, d));
        this._socket.setOnCloseHandler((d) => this.onClose(this, d));
    }
    send(buffer) {
        if (this._socket) {
            this._socket.write(buffer);
            return buffer.length;
        }
        return 0;
    }
    isConnected() {
        return this._socket.isConnected();
    }
    close() {
        if (this._socket.isConnected()) {
            this._socket.closeAsync();
        }
    }
    receiveAsync(count) {
        if (this._activeReceiveResolve) {
            throw new Error('Cannot call receiveAsync more than once before it has returned.');
        }
        this._activeReceiveCount = count;
        let promise = new Promise((resolve, reject) => {
            this._activeReceiveResolve = resolve;
            this._activeReceiveReject = reject;
        });
        this.trySignalData();
        return promise;
    }
    onReceive(thisObject, data) {
        if (thisObject._queue && data && data.byteLength > 0) {
            thisObject._queue.push(new Buffer(data));
            thisObject.trySignalData();
        }
    }
    trySignalData() {
        if (this._activeReceiveResolve) {
            if (!this._active && this._queue.length > 0) {
                this._active = this._queue.shift();
                this._activeOffset = 0;
            }
            if (this._active) {
                if (this._activeOffset === 0 && this._active.length === this._activeReceiveCount) {
                    // can send the entire _active buffer
                    let buffer = this._active;
                    this._active = undefined;
                    this._activeReceiveResolve(buffer);
                }
                else {
                    // create a new buffer and copy some of the contents into it
                    let available = Math.min(this._activeReceiveCount, this._active.length - this._activeOffset);
                    let buffer = new Buffer(available);
                    this._active.copy(buffer, 0, this._activeOffset, this._activeOffset + available);
                    this._activeOffset += available;
                    // if we used all of active, set it to undefined
                    if (this._activeOffset >= this._active.length) {
                        this._active = undefined;
                        this._activeOffset = 0;
                    }
                    this._activeReceiveResolve(buffer);
                }
                this._activeReceiveCount = 0;
                this._activeReceiveReject = undefined;
                this._activeReceiveResolve = undefined;
                return true;
            }
        }
        return false;
    }
    onClose(thisObject, hadError) {
        if (thisObject._activeReceiveReject) {
            thisObject._activeReceiveReject(new Error('Socket was closed.'));
        }
        thisObject._active = undefined;
        thisObject._activeOffset = 0;
        thisObject._activeReceiveResolve = undefined;
        thisObject._activeReceiveResolve = undefined;
        thisObject._activeReceiveCount = 0;
        thisObject._socket = undefined;
    }
    onError(thisObject, err) {
        if (thisObject._activeReceiveReject) {
            thisObject._activeReceiveReject(err);
        }
        thisObject._active = undefined;
        thisObject._activeOffset = 0;
        thisObject._activeReceiveResolve = undefined;
        thisObject._activeReceiveResolve = undefined;
        thisObject._activeReceiveCount = 0;
        thisObject._socket = undefined;
    }
}
exports.Transport = Transport;
//# sourceMappingURL=Transport.js.map