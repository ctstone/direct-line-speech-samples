import { ActivityHandler, BotFrameworkAdapterSettings, WebRequest } from 'botbuilder';
export declare class WebSocketConnector {
    private readonly logger;
    private readonly bot;
    constructor(bot: ActivityHandler, logger?: any);
    authenticateConnection(req: WebRequest, appId?: string, appPassword?: string, channelService?: string): Promise<Boolean>;
    processAsync(req: any, res: any, settings: BotFrameworkAdapterSettings): Promise<void>;
}
