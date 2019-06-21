import { BotFrameworkAdapter, BotFrameworkAdapterSettings, TurnContext } from 'botbuilder';
import { ConnectorClient } from 'botframework-connector';
import { IStreamingTransportServer } from 'microsoft-bot-protocol';
export declare class BotFrameworkStreamingAdapter extends BotFrameworkAdapter {
    private readonly server;
    constructor(server: IStreamingTransportServer, settings?: Partial<BotFrameworkAdapterSettings>);
    createConnectorClient(serviceUrl: string): ConnectorClient;
    executePipeline(context: TurnContext, logic: (Context: TurnContext) => Promise<void>): Promise<void>;
    processActivity(req: any, res: any, logic: any): Promise<void>;
}
