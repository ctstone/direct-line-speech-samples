"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HttpContentStream_1 = require("./HttpContentStream");
const Stream_1 = require("./Stream");
class Request {
    static create(method, route, body) {
        let request = new Request();
        request.Verb = method;
        request.Path = route;
        if (body) {
            request.setBody(body);
        }
        return request;
    }
    addStream(content) {
        if (!this.Streams) {
            this.Streams = [];
        }
        this.Streams.push(new HttpContentStream_1.HttpContentStream(content));
    }
    setBody(body) {
        let stream = new Stream_1.Stream();
        stream.write(body, 'utf8');
        this.addStream(new HttpContentStream_1.HttpContent({
            contentType: 'application/json; charset=utf-8',
            contentLength: stream.length
        }, 
        // tslint:disable-next-line: align
        stream));
    }
}
exports.Request = Request;
//# sourceMappingURL=Request.js.map