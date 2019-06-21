"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const microsoft_bot_protocol_1 = require("microsoft-bot-protocol");
const BotFrameworkStreamingAdapter_1 = require("./BotFrameworkStreamingAdapter");
class StreamingRequestHandler {
    constructor(bot, logger, settings) {
        if (bot === undefined) {
            throw new Error('Undefined Argument: Bot can not be undefined.');
        }
        else {
            this.bot = bot;
        }
        if (logger === undefined) {
            this.logger = console;
        }
        else {
            this.logger = logger;
        }
        this.adapterSettings = settings;
    }
    setServer(server) {
        this.server = server;
        this.adapter = new BotFrameworkStreamingAdapter_1.BotFrameworkStreamingAdapter(server, this.adapterSettings);
    }
    async processRequestAsync(request, logger) {
        let response = new microsoft_bot_protocol_1.Response();
        let body = await this.readRequestBodyAsString(request);
        if (body === undefined || request.Streams === undefined) {
            response.statusCode = 500;
            this.logger.log('Request missing body and/or streams.');
            return response;
        }
        try {
            let activity = body;
            let adapter = new BotFrameworkStreamingAdapter_1.BotFrameworkStreamingAdapter(this.server, this.adapterSettings);
            let context = new botbuilder_1.TurnContext(adapter, activity);
            await adapter.executePipeline(context, async (turnContext) => {
                await this.bot.run(turnContext);
            });
            if (activity.type === botbuilder_1.ActivityTypes.Invoke) {
                // tslint:disable-next-line: no-backbone-get-set-outside-model
                let invokeResponse = context.turnState.get('BotFrameworkStreamingAdapter.InvokeResponse');
                if (invokeResponse && invokeResponse.value) {
                    const value = invokeResponse.value;
                    response.statusCode = value.status;
                    response.setBody(value.body);
                }
                else {
                    response.statusCode = 501;
                }
            }
            else {
                response.statusCode = 200;
            }
        }
        catch (error) {
            response.statusCode = 500;
            this.logger.log(error);
            return response;
        }
        return response;
    }
    async readRequestBodyAsString(request) {
        if (request.Streams !== undefined && request.Streams[0] !== undefined) {
            let contentStream = request.Streams[0];
            // tslint:disable-next-line: no-unnecessary-local-variable
            let streamAsString = await contentStream.readAsJson();
            return streamAsString;
        }
        return undefined;
    }
}
exports.StreamingRequestHandler = StreamingRequestHandler;
//# sourceMappingURL=StreamingRequestHandler.js.map