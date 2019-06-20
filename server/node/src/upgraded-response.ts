import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';

export class UpgradedResponse extends ServerResponse {
  constructor(req: IncomingMessage, public socket: Socket, public head: Buffer) {
    super(req);
  }

  claimUpgrade() {
    const { socket, head } = this;
    return { socket, head };
  }
}
