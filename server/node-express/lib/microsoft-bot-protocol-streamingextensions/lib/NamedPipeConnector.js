"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const microsoft_bot_protocol_namedpipe_1 = require("microsoft-bot-protocol-namedpipe");
const StreamingRequestHandler_1 = require("./StreamingRequestHandler");
class NamedPipeConnector {
    constructor(bot, pipeName, logger) {
        this.defaultPipeName = 'bfv4.pipes';
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
        if (pipeName === undefined) {
            this.pipeName = this.defaultPipeName;
        }
        else {
            this.pipeName = pipeName;
        }
    }
    async processAsync(settings) {
        let handler = new StreamingRequestHandler_1.StreamingRequestHandler(this.bot);
        this.logger.log('Creating server for Named Pipe connection.');
        let server = new microsoft_bot_protocol_namedpipe_1.NamedPipeServer(this.pipeName, handler);
        handler.setServer(server);
        handler.adapterSettings = settings;
        this.logger.log(`Listening on Named Pipe: ${this.pipeName}`);
        await server.startAsync();
    }
}
exports.NamedPipeConnector = NamedPipeConnector;
//# sourceMappingURL=NamedPipeConnector.js.map