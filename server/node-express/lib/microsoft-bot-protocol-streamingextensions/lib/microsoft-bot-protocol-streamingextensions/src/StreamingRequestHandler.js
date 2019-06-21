"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var botbuilder_1 = require("botbuilder");
var Response_1 = require("../../microsoft-bot-protocol/lib/Response");
var BotFrameworkStreamingAdapter_1 = require("./BotFrameworkStreamingAdapter");
var StreamingRequestHandler = /** @class */ (function () {
    function StreamingRequestHandler(bot, logger, settings) {
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
    StreamingRequestHandler.prototype.setServer = function (server) {
        this.adapter = new BotFrameworkStreamingAdapter_1.BotFrameworkStreamingAdapter(server, this.adapterSettings);
    };
    StreamingRequestHandler.prototype.processRequestAsync = function (request, logger) {
        return __awaiter(this, void 0, void 0, function () {
            var response, body, activity, adapter, context, invokeResponse, value;
            var _this = this;
            return __generator(this, function (_a) {
                response = new Response_1.Response();
                body = this.readRequestBodyAsString(request);
                if (body === undefined || request.Streams === undefined) {
                    response.statusCode = 500;
                    this.logger.log('Request missing body and/or streams.');
                    return [2 /*return*/, response];
                }
                try {
                    activity = JSON.parse(body);
                    adapter = new BotFrameworkStreamingAdapter_1.BotFrameworkStreamingAdapter(this.server, this.adapterSettings);
                    context = new botbuilder_1.TurnContext(adapter, activity);
                    adapter.executePipeline(context, function (turnContext) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this.bot.run(turnContext)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    if (activity.type === botbuilder_1.ActivityTypes.Invoke) {
                        invokeResponse = context.turnState.get('BotFrameworkStreamingAdapter.InvokeResponse');
                        if (invokeResponse && invokeResponse.value) {
                            value = invokeResponse.value;
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
                    this.logger.Log(error);
                    // TODO: This may need to call the adapter's connectorClient and send the response, instead of returning it.
                    return [2 /*return*/, response];
                }
                return [2 /*return*/];
            });
        });
    };
    StreamingRequestHandler.prototype.readRequestBodyAsString = function (request) {
        if (request.Streams !== undefined && request.Streams[0] !== undefined) {
            var contentStream = request.Streams[0];
            return JSON.stringify(contentStream);
        }
        return undefined;
    };
    return StreamingRequestHandler;
}());
exports.StreamingRequestHandler = StreamingRequestHandler;
//# sourceMappingURL=StreamingRequestHandler.js.map