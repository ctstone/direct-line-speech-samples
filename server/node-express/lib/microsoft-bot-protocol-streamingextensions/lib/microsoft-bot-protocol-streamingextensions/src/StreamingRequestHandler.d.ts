import { ActivityHandler, BotFrameworkAdapterSettings } from 'botbuilder';
import { IStreamingTransportServer, RequestHandler } from '../../microsoft-bot-protocol/lib';
import { ReceiveRequest } from '../../microsoft-bot-protocol/lib/ReceiveRequest';
import { Response } from '../../microsoft-bot-protocol/lib/Response';
import { BotFrameworkStreamingAdapter } from './BotFrameworkStreamingAdapter';
export declare class StreamingRequestHandler implements RequestHandler {
    bot: ActivityHandler;
    adapterSettings: BotFrameworkAdapterSettings;
    logger: any;
    server: IStreamingTransportServer;
    adapter: BotFrameworkStreamingAdapter;
    constructor(bot: ActivityHandler, logger?: any, settings?: BotFrameworkAdapterSettings);
    setServer(server: IStreamingTransportServer): void;
    processRequestAsync(request: ReceiveRequest, logger: any): Promise<Response>;
    readRequestBodyAsString(request: ReceiveRequest): string;
}
