"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HttpContentStream_1 = require("./HttpContentStream");
const Stream_1 = require("./Stream");
class Response {
    static create(statusCode, body) {
        let response = new Response();
        response.statusCode = statusCode;
        if (body) {
            response.addStream(body);
        }
        return response;
    }
    addStream(content) {
        if (!this.streams) {
            this.streams = [];
        }
        this.streams.push(new HttpContentStream_1.HttpContentStream(content));
    }
    setBody(body) {
        let stream = new Stream_1.Stream();
        stream.write(JSON.stringify(body), 'utf8');
        this.addStream(new HttpContentStream_1.HttpContent({
            contentType: 'application/json; charset=utf-8',
            contentLength: stream.length
            // tslint:disable-next-line: align
        }, stream));
    }
}
exports.Response = Response;
//# sourceMappingURL=Response.js.map