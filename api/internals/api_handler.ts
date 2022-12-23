import {
    crypto,
    RouterContext,
    toHashString,
} from '../../dependencies.deno.ts';
import { bot } from '../core/bot.ts';
import { database } from '../edge.ts';
export const handle = async (
    ctx: RouterContext<
        '/:id/:token/:webhook_id',
        {
            id: string;
        } & {
            token: string;
        } & {
            webhook_id: string;
        } & Record<string | number, string | undefined>,
        Record<string, any>
    >,
) => {
    if (!ctx.params.id) {
        ctx.response.status = 400;
        ctx.response.body = '400: Missing ID.';
        return;
    }
    if (isNaN(<any> ctx.params.id)) {
        ctx.response.status = 400;
        ctx.response.body =
            '400: Invalid ID, check your request and try again later.';
        return;
    }
    if (!ctx.params.token) {
        ctx.response.status = 400;
        ctx.response.body = '400: Missing token in your request.';
        return;
    }
    if (!ctx.params.webhook_id) {
        ctx.response.status = 400;
        ctx.response.body = '400: Missing webhook id in your request.';
        return;
    }
    if (
        ctx.params.token !==
            toHashString(
                await crypto.subtle.digest(
                    'SHA-256',
                    new TextEncoder().encode(
                        ctx.params.id +
                            (Deno.env.get('WEBHOOK_SECRET') ||
                                '0xIFORGOTTOSETWEBHOOKSECRET'),
                    ),
                ),
            )
    ) {
        ctx.response.status = 400;
        ctx.response.body =
            '400: Invalid token, check your request and try again later.';
        return;
    }
    if (!ctx.request.hasBody) {
        ctx.response.status = 400;
        ctx.response.body = '400: Missing request payload.';
        return;
    }
    const data = await ctx.request.body({ 'type': 'json' }).value;
    await database.getUser(parseInt(ctx.params.id)).then(async (user) => {
        if (!user) {
            ctx.response.status = 400;
            ctx.response.body = '400: Invalid user.';
            return;
        }
        await database
            .getPattern(ctx.params.webhook_id)
            .then(async (webhook) => {
                if (!webhook) {
                    ctx.response.status = 400;
                    ctx.response.body =
                        '400: Invalid webhook, check your request and try again later.';
                    return;
                }
                let message = webhook.pattern;
                if (!message) {
                    ctx.response.status = 400;
                    ctx.response.body =
                        '400: Invalid webhook, check your request and try again later.';
                    return;
                }
                try {
                    if (message === '{}') {
                        await bot.api.sendMessage(
                            ctx.params.id,
                            `\`\`\`\n${JSON.stringify(data, null, 4)}\n\`\`\``,
                        );
                        ctx.response.status = 200;
                        ctx.response.body = '200: OK.';
                        return;
                    }
                    const regex = /{([^}]+)}/g;
                    const matches = message.match(regex);
                    if (matches) {
                        for (const match of matches) {
                            const key = match.replace('{', '').replace('}', '');
                            if (key.includes('.')) {
                                const keys = key.split('.');
                                let value = data;
                                for (const key of keys) {
                                    value = value[key] ?? '';
                                }
                                message = message.replace(match, value);
                            } else if (key.includes('[')) {
                                const keys = key.split('[');
                                let value = data;
                                for (const key of keys) {
                                    value = value[key.replace(']', '')];
                                }
                                message = message.replace(match, value ?? '');
                            } else {
                                message = message.replace(
                                    match,
                                    data[key] ?? '<undefined>',
                                );
                            }
                        }
                    }
                    await bot.api.sendMessage(ctx.params.id, message);
                    ctx.response.body = 'ok';
                } catch (e) {
                    console.error(e);
                    ctx.response.status = 500;
                    ctx.response.body =
                        '500: Internal server error. Try again later.';
                    return;
                }
            })
            .then(() => database.close())
            .catch((e) => {
                console.error(e);
                ctx.response.status = 500;
                ctx.response.body =
                    '500: Internal server error. Try again later.';
                database.close();
            });
    });
};
