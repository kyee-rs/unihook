import { webhookCallback } from 'grammy';
import { Application, Router } from 'oak';
import { bot } from './core/bot.ts';
import { handle } from './internals/api_handler.ts';
import { Database } from './internals/database.ts';
export const database = new Database();
const webParser = new Router()
    .get('/', (ctx) => {
        ctx.response.body = '200: OK';
    })
    .post(
        `/${Deno.env.get('BOT_TOKEN') || 'some_token'}`,
        webhookCallback(bot, 'oak'),
    );

const webhook = new Router().all('/hook/:id/:token/:webhook_id', handle);

await new Application()
    .use(webParser.routes())
    .use(webhook.routes())
    .listen({ port: 8080 });
