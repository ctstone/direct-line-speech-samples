import { IncomingMessage, ServerResponse } from 'http';
import { request } from 'https';

const ENDPOINT = 'https://directline.botframework.com/v3/directline/tokens/generate';

export type NextCallback = (err?: any) => void;

export function tokenGenerator(secret: string) {
  const authorization = `Bearer ${secret}`;
  const headers = { authorization };
  const method = 'POST';
  const options = { method, headers };

  return (req: IncomingMessage, res: ServerResponse, next: NextCallback) => {
    const tokenRequest = request(ENDPOINT, options, (tokenRes) => tokenRes.pipe(res))
      .on('error', next);
    tokenRequest.end();
  };
}
