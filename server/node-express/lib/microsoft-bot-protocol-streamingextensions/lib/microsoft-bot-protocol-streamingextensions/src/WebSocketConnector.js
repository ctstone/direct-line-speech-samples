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
var botframework_connector_1 = require("botframework-connector");
var microsoft_bot_protocol_websocket_1 = require("../../microsoft-bot-protocol-websocket");
var StreamingRequestHandler_1 = require("./StreamingRequestHandler");
var WebSocketConnector = /** @class */ (function () {
    function WebSocketConnector(bot, logger) {
        if (logger === undefined) {
            this.logger = console;
        }
        if (bot === undefined) {
            throw new Error('Undefined Argument: Bot can not be undefined.');
        }
        else {
            this.bot = bot;
        }
    }
    WebSocketConnector.prototype.authenticateConnection = function (req, appId, appPassword, channelService) {
        return __awaiter(this, void 0, void 0, function () {
            var authHeader, channelIdHeader, credentials, credentialProvider, claims;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        authHeader = req.headers.authorization || req.headers.Authorization || '';
                        channelIdHeader = req.headers.channelid || req.headers.ChannelId || req.headers.ChannelID || '';
                        credentials = new botframework_connector_1.MicrosoftAppCredentials(appId, appPassword);
                        credentialProvider = new botframework_connector_1.SimpleCredentialProvider(credentials.appId, credentials.appPassword);
                        return [4 /*yield*/, botframework_connector_1.JwtTokenValidation.validateAuthHeader(authHeader, credentialProvider, channelService, channelIdHeader)];
                    case 1:
                        claims = _a.sent();
                        return [2 /*return*/, claims.isAuthenticated];
                }
            });
        });
    };
    WebSocketConnector.prototype.processAsync = function (req, res, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var e, upgrade, e, e, handler, nodeSocket, server;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!res.claimUpgrade) {
                            e = new Error('Upgrade to WebSockets required.');
                            this.logger.log(e);
                            res.status(426);
                            res.send(e.message);
                            return [2 /*return*/];
                        }
                        upgrade = res.claimUpgrade();
                        if (req === undefined) {
                            e = new Error('Argument Null Exception: Request cannot be undefined.');
                            this.logger.log(e);
                            res.status(400);
                            res.send(e.message);
                            return [2 /*return*/];
                        }
                        if (res === undefined) {
                            e = new Error('Argument Null Exception: Response cannot be undefined.');
                            this.logger.log(e);
                            res.status(400);
                            res.send(e.message);
                            return [2 /*return*/];
                        }
                        if (!this.authenticateConnection(req, settings.appId, settings.appPassword, settings.channelService)) {
                            this.logger.log('Unauthorized connection attempt.');
                            res.status(406);
                            return [2 /*return*/];
                        }
                        handler = new StreamingRequestHandler_1.StreamingRequestHandler(this.bot);
                        this.logger.log('Creating socket for WebSocket connection.');
                        nodeSocket = new microsoft_bot_protocol_websocket_1.NodeSocket({ serverSocket: upgrade.socket });
                        this.logger.log('Creating server for WebSocket connection.');
                        server = new microsoft_bot_protocol_websocket_1.Server(nodeSocket, handler);
                        handler.setServer(server);
                        handler.adapterSettings = settings;
                        this.logger.log('Listening on WebSocket server.');
                        return [4 /*yield*/, server.startAsync()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return WebSocketConnector;
}());
exports.WebSocketConnector = WebSocketConnector;
//# sourceMappingURL=WebSocketConnector.js.map