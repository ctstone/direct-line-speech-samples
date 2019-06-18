// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ActivityTypes, Middleware, TurnContext, ActivityHandler, BotHandler } from 'botbuilder';

export class HelloWorldBot extends ActivityHandler {
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
  };

  private message: BotHandler = async (context, next) => {
    const { name, id } = context.activity.from;
    const { text } = context.activity;
    await context.sendActivity(`${name || id} said "${text}"`);
    await next();
  };
}