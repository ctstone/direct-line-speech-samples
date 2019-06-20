// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3978/api/messages');

ws.on('open', () => {
  console.log('OPEN');
  ws.send(JSON.stringify({ type: 'message', text: 'hello world' }));
});

ws.on('message', (data) => {
  console.log('DATA', data);
});
