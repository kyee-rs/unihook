import { Menu, MenuRange } from 'grammy/menu';
import { toHashString } from 'https://deno.land/std@0.170.0/crypto/util.ts';
import { database } from '../edge.ts';
import { MyContext, MyConversation } from '../types/bot.d.ts';
export async function add(conversation: MyConversation, ctx: MyContext) {
    if (!ctx.from?.id) {
        return ctx.reply('Failed to read your id. Try again later.');
    }
    if (!(await database.getUser(ctx.from.id))) {
        await database.createUser(ctx.from.id);
    }

    await ctx.reply(
        '📟 Please set the webhook unique ID. \n\n📲 Example: `my-webhook`',
    );
    const id = await conversation.waitFor(':text');
    if (!id.message?.text) return;
    if (await database.getPattern(id.message.text)) {
        return await ctx.reply('🚫 This webhook already exists.');
    }

    await ctx.reply(
        '📔 **Enter a new webhook pattern**\n\n📲 Example: `You got an alert with payload {message}`, where *{message}* is parsed from webhook.\n📝 You can use *{}* to send pretty-formatted JSON payload.',
    );
    const pattern = await conversation.waitFor(':text');
    if (!pattern.message?.text) return;

    await database.createPattern(
        id.message.text,
        pattern.message.text,
        ctx.from!.id,
    );
    await database.close();

    await ctx.reply('☑️ Pattern successfully added.');
    await ctx.reply(
        `Webhook URL: \n\n\`${
            encodeURI(
                'https://volx.deno.dev/' +
                    ctx.from.id +
                    '/' +
                    toHashString(
                        await crypto.subtle.digest(
                            'SHA-256',
                            new TextEncoder().encode(
                                ctx.from.id +
                                    (Deno.env.get('WEBHOOK_SECRET') ||
                                        '0xIFORGOTTOSETWEBHOOKSECRET'),
                            ),
                        ),
                    ) +
                    '/' +
                    id.message?.text,
            )
        }\``,
    );
}

export const deleteMenu = new Menu('deleteMenu')
    .dynamic(async (ctx) => {
        const range = new MenuRange();
        for (const pattern of await database.getPatterns(ctx.from!.id)) {
            range
                .text(pattern.id, async (ctx) => {
                    ctx.reply(
                        `☑️ Successfully deleted pattern \`${pattern.id}\`.`,
                    );
                    await database.deletePattern(pattern.id);
                })
                .row();
        }
        return range;
    })
    .text('🚫 Cancel', (ctx) => ctx.deleteMessage());
