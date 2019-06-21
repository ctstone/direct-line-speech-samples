"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const microsoft_bot_protocol_1 = require("microsoft-bot-protocol");
class StreamingHttpClient {
    constructor(server) {
        this.server = server;
    }
    async sendRequest(httpRequest) {
        const request = this.mapHttpRequestToProtocolRequest(httpRequest);
        request.Path = request.Path.substring(request.Path.indexOf('/v3'));
        const res = await this.server.sendAsync(request, undefined);
        return {
            request: httpRequest,
            status: res.StatusCode,
            headers: httpRequest.headers,
            readableStreamBody: res.Streams.length > 0 ? res.Streams[0].getStream() : undefined
        };
    }
    mapHttpRequestToProtocolRequest(httpRequest) {
        // TODO: check url -> path mapping
        return microsoft_bot_protocol_1.Request.create(httpRequest.method, httpRequest.url, httpRequest.body);
    }
}
exports.StreamingHttpClient = StreamingHttpClient;
//# sourceMappingURL=StreamingHttpClient.js.map