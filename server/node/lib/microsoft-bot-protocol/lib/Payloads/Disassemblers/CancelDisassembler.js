"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Header_1 = require("../Models/Header");
class CancelDisassembler {
    constructor(sender, id, payloadType) {
        this.sender = sender;
        this.id = id;
        this.payloadType = payloadType;
    }
    disassemble() {
        const header = new Header_1.Header(this.payloadType, 0, this.id, true);
        this.sender.sendPayload(header, undefined, undefined);
    }
}
exports.CancelDisassembler = CancelDisassembler;
//# sourceMappingURL=CancelDisassembler.js.map