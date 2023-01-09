import {
    autoRetry,
    Bot,
    conversations,
    hydrateReply,
    parseMode,
    session,
} from '../../dependencies.deno.ts';
import { Database } from '../internals/database.ts';
import { MyContext } from '../types/bot.d.ts';
import { commands } from './commands.ts';
export const database = new Database();
export const bot = new Bot<MyContext>(Deno.env.get('BOT_TOKEN')!, {
    botInfo: {
        id: 5889865725,
        is_bot: true,
        first_name: 'Universal Webhook',
        username: 'uniwebhookbot',
        can_join_groups: true,
        can_read_all_group_messages: false,
        supports_inline_queries: false,
    },
    client: {
        canUseWebhookReply: (method) => method === 'sendChatAction',
    },
});

bot.api.config.use(autoRetry());
bot.use(hydrateReply<MyContext>);
bot.api.config.use(parseMode('Markdown'));
bot.use(
    session({
        initial() {
            return {};
        },
    }),
);
bot.use(conversations());
bot.use(commands);

await bot.init();
