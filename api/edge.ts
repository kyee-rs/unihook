import { webhookCallback } from 'grammy';
import { Application, Router } from 'oak';
import { bot } from './core/bot.ts';
import { handle } from './internals/api_handler.ts';
import { Database } from './internals/database.ts';
export const database = new Database();
const webParser = new Router()
    .redirect('/', `https://${bot.botInfo.username}.t.me`)
    .post(
        `/bot/${bot.token}`,
        webhookCallback(bot, 'oak'),
    );

const webhook = new Router().all('/:id/:token/:webhook_id', handle);

await new Application()
    .use(webParser.routes())
    .use(webhook.routes())
    .listen({ port: 8080 });
