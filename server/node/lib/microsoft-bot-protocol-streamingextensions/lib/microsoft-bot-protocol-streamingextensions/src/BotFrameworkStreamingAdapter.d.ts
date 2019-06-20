import { BotFrameworkAdapter, BotFrameworkAdapterSettings, TurnContext } from 'botbuilder';
import { IStreamingTransportServer } from '../../microsoft-bot-protocol';
export declare class BotFrameworkStreamingAdapter extends BotFrameworkAdapter {
    constructor(server: IStreamingTransportServer, settings?: Partial<BotFrameworkAdapterSettings>);
    executePipeline(context: TurnContext, logic: (Context: TurnContext) => Promise<void>): void;
    processActivity(req: any, res: any, logic: any): Promise<void>;
}
