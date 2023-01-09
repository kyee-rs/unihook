import { Menu, MenuRange, toHashString } from "../../dependencies.deno.ts";
import { database } from "../core/bot.ts";
import { MyContext, MyConversation } from "../types/bot.d.ts";
export async function add(conversation: MyConversation, ctx: MyContext) {
    if (!ctx.from?.id) {
        return ctx.reply("Failed to read your id. Try again later.");
    }
    if (!(await database.getUser(ctx.from.id))) {
        await database.createUser(ctx.from.id);
    }

    await ctx.reply(
        "📟 Please set the webhook unique ID. \n\n📲 Example: `my-webhook`"
    );
    const id = await conversation.waitFor(":text");

    if (!id.message?.text) return;
    if (id.message?.text === "/cancel") {
        return await ctx.reply("🚫 Canceled.", {
            reply_to_message_id: ctx.message?.message_id,
            reply_markup: { remove_keyboard: true },
        });
    }
    if (await database.getPattern(id.message.text)) {
        return await ctx.reply("🚫 This webhook already exists.");
    }

    await ctx.reply(
        "📔 **Please, enter a new webhook pattern.**\n\n📲 Example: `You got an alert with payload {message}`, where *{message}* is parsed from webhook.\n📝 You can use *{}* to send pretty-formatted JSON payload."
    );
    const pattern = await conversation.waitFor(":text");
    if (!pattern.message?.text) return;
    if (pattern.message?.text === "/cancel") {
        return await ctx.reply("🚫 Canceled.", {
            reply_to_message_id: ctx.message?.message_id,
            reply_markup: { remove_keyboard: true },
        });
    }
    await database.createPattern(
        id.message.text,
        pattern.message.text,
        ctx.from!.id
    );
    await database.close();

    await ctx.reply("☑️ Pattern added successfully.");
    await ctx.reply(
        `Webhook URL: \n\n\`${encodeURI(
            "https://volx.deno.dev/" +
                ctx.from.id +
                "/" +
                toHashString(
                    await crypto.subtle.digest(
                        "SHA-256",
                        new TextEncoder().encode(
                            ctx.from.id +
                                (Deno.env.get("WEBHOOK_SECRET") ||
                                    "0xIFORGOTTOSETWEBHOOKSECRET")
                        )
                    )
                ) +
                "/" +
                id.message?.text
        )}\``
    );
}

export const deleteMenu = new Menu("deleteMenu")
    .dynamic(async (ctx) => {
        const range = new MenuRange();
        for (const pattern of await database.getPatterns(ctx.from!.id)) {
            range
                .text(pattern.id, async (ctx) => {
                    ctx.reply(
                        `☑️ Pattern \`${pattern.id}\` deleted successfully.`
                    );
                    await database.deletePattern(pattern.id);
                })
                .row();
        }
        return range;
    })
    .text("🚫 Cancel", (ctx) => ctx.deleteMessage());
