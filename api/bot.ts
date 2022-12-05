import { conversations, createConversation } from "@grammyjs/conversations";
import { createHash } from "crypto";
import { Bot, session } from "grammy";
import { MyContext, MyConversation } from "../types/bot";
import { database } from "./server";

async function add(conversation: MyConversation, ctx: MyContext) {
    if (!(await database.getUser(ctx.from!.id))) {
        await database.createUser(ctx.from!.id);
    }

    await ctx.reply(
        "Please send me the pattern you want to add. Use /cancel to cancel.\n\nExample: `New alert from Webhook {webhook_name}`, where `{webhook_name}` is the parsed value from payload. Markdown is supported.",
        { parse_mode: "Markdown" },
    );
    const pattern = await conversation.waitFor(":text");
    if (!pattern.message?.text) return;

    await ctx.reply("Please send me the webhook ID you want to add this pattern to. \n\nExample: `my-webhook`", {
        parse_mode: "Markdown",
    });
    const id = await conversation.waitFor(":text");
    if (!id.message?.text) return;
    if (await database.getPattern(id.message.text)) {
        return await ctx.reply("This webhook already exists.");
    }

    await database.createPattern(id.message.text, pattern.message.text, ctx.from!.id);
    await database.close();

    await ctx.reply("Pattern added! You can now use /list to see all your patterns.");
    await ctx.reply(
        "URL: " +
            encodeURI(
                "https://hook.ieljit.lol/" +
                    ctx.from?.id +
                    "/" +
                    createHash("sha256")
                        .update(ctx.from?.id + process.env.WEBHOOK_SECRET!)
                        .digest("hex") +
                    "/" +
                    id.message?.text,
            ),
    );
}

async function dlt(conversation: MyConversation, ctx: MyContext) {
    if (!(await database.getUser(ctx.from!.id))) {
        await database.createUser(ctx.from!.id);
    }
    await ctx.reply("Please send me the webhook ID you want to delete. \n\nExample: `my-webhook`", {
        parse_mode: "Markdown",
    });
    const id = await conversation.waitFor(":text");
    if (!id.message?.text) return;
    if (!(await database.pattern.findUnique({ where: { id: id.message?.text } }))) {
        return await ctx.reply("This webhook does not exist.");
    }
    await database.pattern.delete({ where: { id: id.message?.text } });
    await database.$disconnect();
    await ctx.reply("Pattern deleted! You can now use /list to see all your patterns.");
}
export const bot = new Bot<MyContext>(process.env.BOT_TOKEN!);

bot.use(
    session({
        initial() {
            return {};
        },
    }),
);

bot.use(conversations());
bot.use(createConversation(add));
bot.use(createConversation(dlt));

bot.on("message", async (ctx) => {
    await bot;
});
