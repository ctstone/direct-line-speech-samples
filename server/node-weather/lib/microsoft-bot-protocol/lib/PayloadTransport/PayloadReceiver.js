"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HeaderSerializer_1 = require("../Payloads/HeaderSerializer");
const PayloadTypes_1 = require("../Payloads/Models/PayloadTypes");
const TransportConstants_1 = require("../Transport/TransportConstants");
const TransportDisconnectedEventArgs_1 = require("./TransportDisconnectedEventArgs");
class PayloadReceiver {
    //public isConnected(): boolean { return this._receiver !== undefined; }
    connect(receiver) {
        if (this.isConnected) {
            throw new Error('Already connected.');
        }
        else {
            this._receiver = receiver;
            this.isConnected = true;
            this.runReceive();
        }
    }
    subscribe(getStream, receiveAction) {
        this._getStream = getStream;
        this._receiveAction = receiveAction;
    }
    disconnect(disconnectArgs) {
        let didDisconnect = false;
        try {
            if (this.isConnected) {
                this._receiver.close();
                didDisconnect = true;
                this.isConnected = false;
            }
        }
        catch (error) {
            this.isConnected = false;
            this.disconnected(error.message, disconnectArgs);
        }
        this._receiver = undefined;
        this.isConnected = false;
        if (didDisconnect) {
            this.disconnected(Object('PayloadReceiver has been disconnected.'), disconnectArgs);
        }
    }
    runReceive() {
        this.receivePacketsAsync()
            .catch();
    }
    async receivePacketsAsync() {
        let isClosed = false;
        while (this.isConnected && !isClosed) {
            try {
                let readSoFar = 0;
                while (readSoFar < TransportConstants_1.TransportContants.MaxHeaderLength) {
                    this._receiveHeaderBuffer = await this._receiver.receiveAsync(TransportConstants_1.TransportContants.MaxHeaderLength - readSoFar);
                    readSoFar += this._receiveHeaderBuffer.length;
                }
                let header = HeaderSerializer_1.HeaderSerializer.deserialize(this._receiveHeaderBuffer);
                let isStream = header.PayloadType === PayloadTypes_1.PayloadTypes.stream;
                console.log("Got header isStream=", isStream);
                if (header.PayloadLength > 0) {
                    let bytesActuallyRead = 0;
                    let contentStream = this._getStream(header);
                    while (bytesActuallyRead < header.PayloadLength && bytesActuallyRead < TransportConstants_1.TransportContants.MaxPayloadLength) {
                        let count = Math.min(header.PayloadLength - bytesActuallyRead, TransportConstants_1.TransportContants.MaxPayloadLength);
                        //this._receivePayloadBuffer = Buffer.alloc(count);
                        this._receivePayloadBuffer = await this._receiver.receiveAsync(count);
                        bytesActuallyRead += this._receivePayloadBuffer.byteLength;
                        contentStream.write(this._receivePayloadBuffer);
                        // If this is a stream we want to keep handing it up as it comes in
                        if (isStream) {
                            console.log("THIS IS STREAM SO RECEIVEACTION IS CALLED");
                            this._receiveAction(header, contentStream, bytesActuallyRead);
                        }
                    }
                    if (!isStream) {
                        this._receiveAction(header, contentStream, bytesActuallyRead);
                    }
                }
            }
            catch (error) {
                isClosed = true;
                this.disconnect(new TransportDisconnectedEventArgs_1.TransportDisconnectedEventArgs(error.message));
            }
        }
    }
}
exports.PayloadReceiver = PayloadReceiver;
//# sourceMappingURL=PayloadReceiver.js.map