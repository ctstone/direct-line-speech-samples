"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const botframework_connector_1 = require("botframework-connector");
const StreamingHttpClient_1 = require("./StreamingHttpClient");
class BotFrameworkStreamingAdapter extends botbuilder_1.BotFrameworkAdapter {
    constructor(server, settings) {
        super(settings);
        this.server = server;
    }
    createConnectorClient(serviceUrl) {
        return new botframework_connector_1.ConnectorClient(this.credentials, {
            baseUri: serviceUrl,
            userAgent: 'TODO',
            httpClient: new StreamingHttpClient_1.StreamingHttpClient(this.server)
        });
    }
    // Used to allow the request handler to run the middleware pipeline for incoming activities.
    async executePipeline(context, logic) {
        await this.runMiddleware(context, logic);
    }
    // Incoming requests should be handled by the request handler, not the adapter.
    async processActivity(req, res, logic) {
        throw new Error('Not implemented.');
    }
}
exports.BotFrameworkStreamingAdapter = BotFrameworkStreamingAdapter;
//# sourceMappingURL=BotFrameworkStreamingAdapter.js.map