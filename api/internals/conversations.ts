import { Menu, MenuRange } from "@grammyjs/menu";
import { createHash } from "crypto";
import { MyContext, MyConversation } from "../../types/bot";
import { database } from "../server";

export async function add(conversation: MyConversation, ctx: MyContext) {
    if (!(await database.getUser(ctx.from!.id))) {
        await database.createUser(ctx.from!.id);
    }

    await ctx.reply("📟 Please set the webhook unique ID. \n\n📲 Example: `my-webhook`");
    const id = await conversation.waitFor(":text");
    if (!id.message?.text) return;
    if (await database.getPattern(id.message.text)) {
        return await ctx.reply("🚫 This webhook already exists.");
    }

    await ctx.reply(
        "📔 **Enter a new webhook pattern**\n\n📲 Example: `You got an alert with payload {message}`, where *{message}* is parsed from webhook.\n📝 You can use *{}* to send pretty-formatted JSON payload.",
    );
    const pattern = await conversation.waitFor(":text");
    if (!pattern.message?.text) return;

    await database.createPattern(id.message.text, pattern.message.text, ctx.from!.id);
    await database.close();

    await ctx.reply("☑️ Pattern successfully added.");
    await ctx.reply(
        `Webhook URL: \n\n\`${encodeURI(
            "https://hook.ieljit.lol/" +
                ctx.from?.id +
                "/" +
                createHash("sha256")
                    .update(ctx.from?.id + process.env.WEBHOOK_SECRET!)
                    .digest("hex") +
                "/" +
                id.message?.text,
        )}\``,
    );
}

export const deleteMenu = new Menu("deleteMenu")
    .dynamic(async (ctx) => {
        const range = new MenuRange();
        for (const pattern of await database.getPatterns(ctx.from!.id)) {
            range
                .text(pattern.id, async (ctx) => {
                    ctx.reply(`☑️ Successfully deleted pattern \`${pattern.id}\`.`);
                    await database.deletePattern(pattern.id);
                })
                .row();
        }
        return range;
    })
    .text("🚫 Cancel", (ctx) => ctx.deleteMessage());
