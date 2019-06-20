import { ActivityHandler, BotFrameworkAdapterSettings } from 'botbuilder';
export declare class NamedPipeConnector {
    private logger;
    private readonly pipeName;
    private readonly bot;
    private readonly defaultPipeName;
    constructor(bot: ActivityHandler, pipeName?: string, logger?: any);
    processAsync(settings: BotFrameworkAdapterSettings): Promise<void>;
}
