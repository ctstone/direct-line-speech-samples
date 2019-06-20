// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ActivityHandler, BotHandler } from 'botbuilder';

import { voice } from './voice';

const VERSION = '0.5';
const LANGUAGE = 'en-US';
const VOICE_ID = 'Microsoft Server Speech Text to Speech Voice (en-US, JessaNeural)';

export class HelloWorldBot extends ActivityHandler {

  speaker = voice(VOICE_ID, LANGUAGE);

  constructor() {
    super();
    this.onMembersAdded(this.membersAdded.bind(this));
    this.onMessage(this.message.bind(this));
  }

  private membersAdded: BotHandler = async (context, next) => {
    for (const added of context.activity.membersAdded) {
      const { name, id } = added;
      await context.sendActivity(`${name || id} has joined the chat!`);
    }

    await next();
  }

  private message: BotHandler = async (context, next) => {
    const { name, id } = context.activity.from;
    const { text } = context.activity;
    const speak = this.speaker(`You said: "${text}"`);
    await context.sendActivity(`[ v${VERSION} ] : ${name || id} said "${text}"`, speak);
    await next();
  }
}
