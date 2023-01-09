import {
    Composer,
    createConversation,
    InlineKeyboard,
} from '../../dependencies.deno.ts';
import { add, deleteMenu } from '../internals/conversations.ts';
import { MyContext } from '../types/bot.d.ts';
import { database } from './bot.ts';
export const commands = new Composer<MyContext>();

commands.use(createConversation(add));
commands.use(deleteMenu);

commands.use(async (ctx, next) => {
    if (!ctx.from) {
        return ctx.reply('🚫 You are not authorized to use this bot.');
    }
    if (!(await database.getUser(ctx.from.id))) {
        await database.createUser(ctx.from.id);
    }
    await next();
});

commands.command('add', async (ctx) => {
    await ctx.conversation.enter('add');
});

commands.command('delete', async (ctx) => {
    if ((await database.getPatterns(ctx.from!.id)).length === 0) {
        return await ctx.reply(
            '🚫 You have *no* patterns. Use /add to add a pattern.',
        );
    }
    await ctx.reply('📡 Please, choose the webhook you want to delete.', {
        reply_markup: deleteMenu,
    });
});

commands.command('delete_all', async (ctx) => {
    await ctx.reply(
        `☑️ Successfully deleted ${
            (
                await database.getPatterns(ctx.from!.id)
            ).length
        } patterns.`,
    );
    await database.deleteAllPatterns(ctx.from!.id);
    await database.close();
});

commands.command('list', async (ctx) => {
    const patterns = await database.getPatterns(ctx.from!.id);
    await database.close();
    if (patterns.length === 0) {
        return await ctx.reply(
            '🚫 You have *no* patterns. Use /add to add a pattern.',
        );
    }
    let text = '📡 Your patterns:\n';
    for (const pattern of patterns) {
        text +=
            `*Pattern*: \`${pattern.pattern}\`\n*ID*: \`${pattern.id}\`\n\n`;
    }
    await ctx.reply(text);
});

commands.command('start', async (ctx) => {
    const inline = new InlineKeyboard().url(
        'Source code 🇺🇦',
        'https://github.com/voxelin/unihook',
    );
    await ctx.reply(
        'Welcome! I am *Universal Webhook Bot* 🇺🇦.\nI can send you templated messages when a webhook is triggered.\nTo get started, add a webhook handler using /add.',
        { reply_to_message_id: ctx.message?.message_id, reply_markup: inline },
    );
});
