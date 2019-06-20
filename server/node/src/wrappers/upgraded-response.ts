// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';

const CRLF = '\r\n';
const EMPTY = '';
const REASON = 'Connection Not Upgraded';

/**
 * Restify+Watershed compatible response object
 */
export class UpgradedResponse extends ServerResponse {
  private body: string;

  constructor(req: IncomingMessage, public socket: Socket, public head: Buffer) {
    super(req);
  }

  claimUpgrade() {
    const { socket, head } = this;
    return { socket, head };
  }

  status(statusCode: number) {
    this.statusCode = statusCode;
  }

  send(body?: string): void;
  send(code: number, body?: string): void;
  send(codeOrData: number | string, body?: string): void {
    if (typeof codeOrData === 'number') {
      this.statusCode = codeOrData;
    } else {
      body = codeOrData;
    }

    this.body = body || '';
    this.end();
  }

  end() {
    const { socket, statusCode, statusMessage, body } = this;
    const content = [
      `HTTP/1.1 ${statusCode} ${statusMessage || REASON}`,
      'Connection: close',
      `Date: ${new Date().toUTCString()}`,
      EMPTY,
      body,
    ].join(CRLF);
    socket.write(content);
    socket.end();
  }
}
