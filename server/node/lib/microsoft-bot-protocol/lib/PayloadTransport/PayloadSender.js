"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HeaderSerializer_1 = require("../Payloads/HeaderSerializer");
const TransportConstants_1 = require("../Transport/TransportConstants");
const SendPacket_1 = require("./SendPacket");
const TransportDisconnectedEventArgs_1 = require("./TransportDisconnectedEventArgs");
class PayloadSender {
    constructor() {
        this.sendHeaderBuffer = Buffer.alloc(TransportConstants_1.TransportContants.MaxHeaderLength);
    }
    get isConnected() {
        return this.sender !== undefined;
    }
    connect(sender) {
        this.sender = sender;
    }
    sendPayload(header, payload, sentCallback) {
        this.writePacket(new SendPacket_1.SendPacket(header, payload, sentCallback));
    }
    disconnect(e) {
        if (this.isConnected) {
            this.sender.close();
            this.sender = undefined;
            if (this.disconnected) {
                this.disconnected(this, e || TransportDisconnectedEventArgs_1.TransportDisconnectedEventArgs.Empty);
            }
        }
    }
    writePacket(packet) {
        try {
            HeaderSerializer_1.HeaderSerializer.serialize(packet.header, this.sendHeaderBuffer);
            let length = this.sender.send(this.sendHeaderBuffer);
            if (length === 0) {
                throw new Error('Failed to send header');
            }
            if (packet.header.PayloadLength > 0 && packet.payload) {
                let count = packet.header.PayloadLength;
                while (count > 0) {
                    // TODO: Min(count, a max chunk size)
                    let chunk = packet.payload.read(count);
                    this.sender.send(chunk);
                    count -= chunk.length;
                }
                if (packet.sentCallback) {
                    // tslint:disable-next-line: no-floating-promises
                    packet.sentCallback();
                }
            }
        }
        catch (e) {
            this.disconnect(new TransportDisconnectedEventArgs_1.TransportDisconnectedEventArgs(e.message));
        }
    }
}
exports.PayloadSender = PayloadSender;
//# sourceMappingURL=PayloadSender.js.map