// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';

/**
 * Restify+Watershed compatible response object
 */
export class UpgradedResponse extends ServerResponse {
  constructor(req: IncomingMessage, public socket: Socket, public head: Buffer) {
    super(req);
  }

  claimUpgrade() {
    const { socket, head } = this;
    return { socket, head };
  }
}
