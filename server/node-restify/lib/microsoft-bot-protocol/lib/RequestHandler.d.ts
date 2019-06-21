import { ReceiveRequest } from './ReceiveRequest';
import { Response } from './Response';
export declare abstract class RequestHandler {
    abstract processRequestAsync(request: ReceiveRequest, logger?: any): Promise<Response>;
}
