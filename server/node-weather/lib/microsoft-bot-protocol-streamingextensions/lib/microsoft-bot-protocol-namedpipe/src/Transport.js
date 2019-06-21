"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Transport = /** @class */ (function () {
    function Transport(socket, name) {
        var _this = this;
        this._socket = socket;
        this._queue = [];
        this._activeOffset = 0;
        this._activeReceiveCount = 0;
        this._name = name;
        if (socket) {
            this._socket.on('data', function (data) {
                _this.socketReceive(data);
            });
            this._socket.on('close', function (hadError) {
                _this.socketClose(hadError);
            });
            this._socket.on('error', function (err) {
                _this.socketError(err);
            });
        }
    }
    Transport.prototype.send = function (buffer) {
        if (this._socket && !this._socket.connecting && this._socket.writable) {
            this._socket.write(buffer);
            return buffer.length;
        }
        return 0;
    };
    Transport.prototype.isConnected = function () {
        return this._socket && !this._socket.destroyed && !this._socket.connecting;
    };
    Transport.prototype.close = function () {
        if (this._socket) {
            this._socket.end('end');
            this._socket = undefined;
        }
    };
    // Returns:
    //  0 if the socket is closed or no more data can be returned
    //  1...count bytes in the buffer
    /* tslint:disable:promise-function-async promise-must-complete */
    Transport.prototype.receiveAsync = function (count) {
        var _this = this;
        if (this._activeReceiveResolve) {
            throw new Error('Cannot call receiveAsync more than once before it has returned.');
        }
        this._activeReceiveCount = count;
        var promise = new Promise(function (resolve, reject) {
            _this._activeReceiveResolve = resolve;
            _this._activeReceiveReject = reject;
        });
        this.trySignalData();
        return promise;
    };
    Transport.prototype.trySignalData = function () {
        if (this._activeReceiveResolve) {
            if (!this._active && this._queue.length > 0) {
                this._active = this._queue.shift();
                this._activeOffset = 0;
            }
            if (this._active) {
                if (this._activeOffset === 0 && this._active.length === this._activeReceiveCount) {
                    // can send the entire _active buffer
                    var buffer = this._active;
                    this._active = undefined;
                    this._activeReceiveResolve(buffer);
                }
                else {
                    // create a new buffer and copy some of the contents into it
                    var available = Math.min(this._activeReceiveCount, this._active.length - this._activeOffset);
                    var buffer = new Buffer(available);
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
    };
    Transport.prototype.socketReceive = function (data) {
        if (this._queue && data && data.length > 0) {
            this._queue.push(data);
            this.trySignalData();
        }
    };
    Transport.prototype.socketClose = function (hadError) {
        if (this._activeReceiveReject) {
            this._activeReceiveReject(new Error('Socket was closed.'));
        }
        this._active = undefined;
        this._activeOffset = 0;
        this._activeReceiveResolve = undefined;
        this._activeReceiveResolve = undefined;
        this._activeReceiveCount = 0;
        this._socket = undefined;
    };
    Transport.prototype.socketError = function (err) {
        if (this._activeReceiveReject) {
            this._activeReceiveReject(err);
        }
        this._active = undefined;
        this._activeOffset = 0;
        this._activeReceiveResolve = undefined;
        this._activeReceiveResolve = undefined;
        this._activeReceiveCount = 0;
        this._socket = undefined;
    };
    Transport.PipePath = '\\\\.\\pipe\\';
    Transport.ServerIncomingPath = '.incoming';
    Transport.ServerOutgoingPath = '.outgoing';
    return Transport;
}());
exports.Transport = Transport;
//# sourceMappingURL=Transport.js.map