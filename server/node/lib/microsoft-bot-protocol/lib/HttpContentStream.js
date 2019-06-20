"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const protocol_base_1 = require("./Utilities/protocol-base");
class HttpContentStream {
    constructor(content) {
        this.id = protocol_base_1.generateGuid();
        this.content = content;
    }
}
exports.HttpContentStream = HttpContentStream;
class HttpContent {
    constructor(headers, stream) {
        this.headers = headers;
        this.stream = stream;
    }
    getStream() {
        return this.stream;
    }
}
exports.HttpContent = HttpContent;
class HttpContentHeaders {
}
exports.HttpContentHeaders = HttpContentHeaders;
//# sourceMappingURL=HttpContentStream.js.map