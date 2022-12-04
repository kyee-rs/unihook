import { Conversation, ConversationFlavor, conversations, createConversation } from "@grammyjs/conversations";
import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";
import { Bot, Context, InlineKeyboard, session } from "grammy";
const database = new PrismaClient();
type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

async function add(conversation: MyConversation, ctx: MyContext) {
    if (!(await database.user.findUnique({ where: { id: ctx.from?.id } }))) {
        return await ctx.reply("You are not registered. Please use /start to register.");
    }

    await ctx.reply(
        "Please send me the pattern you want to add. Use /cancel to cancel.\n\nExample: `New alert from Webhook {data.webhook_name}`",
        { parse_mode: "Markdown" },
    );
    const pattern = await conversation.waitFor(":text");
    if (!pattern.message?.text) return;
    await ctx.reply("Please send me the webhook ID you want to add this pattern to. \n\nExample: `my-webhook`", {
        parse_mode: "Markdown",
    });
    const id = await conversation.waitFor(":text");
    if (!id.message?.text) return;
    if (await database.pattern.findUnique({ where: { id: id.message?.text } })) {
        return await ctx.reply("This webhook already exists.");
    }
    await database.pattern.create({
        data: {
            pattern: pattern.message.text,
            id: id.message.text,
            User: {
                connect: {
                    id: ctx.from?.id,
                },
            },
        },
    });
    await database.$disconnect();
    await ctx.reply("Pattern added! You can now use /list to see all your patterns.");
    await ctx.reply(
        "URL: " +
            "http://localhost:3000/" +
            ctx.from?.id +
            "/" +
            createHash("sha256")
                .update(ctx.from?.id + process.env.WEBHOOK_SECRET!)
                .digest("hex") +
            "/" +
            id.message?.text,
    );
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

bot.command("start", async (ctx) => {
    const inline = new InlineKeyboard().url("Source code", "https://github.com/voxelin/universalwebhook");
    await ctx.reply(
        "Welcome! I am Universal Webhook Bot. I can send you messages when a webhook is triggered. To get started, please use /register to add your account to a Database.",
        { reply_to_message_id: ctx.message?.message_id, reply_markup: inline },
    );
});

bot.command("register", async (ctx) => {
    await ctx.reply("Registering...");
    if (await database.user.findUnique({ where: { id: ctx.from?.id } })) {
        return await ctx.reply("You are already registered. Use /add to add a pattern.");
    }
    await database.user.create({
        data: {
            id: ctx.from!.id,
        },
    });
    await database.$disconnect();
    await ctx.reply("Registered! Use /add to add a pattern.");
});

bot.command("add", async (ctx) => {
    await ctx.conversation.enter("add");
});

bot.command("list", async (ctx) => {
    const patterns = await database.pattern.findMany({
        where: {
            User: {
                id: ctx.from?.id,
            },
        },
    });
    await database.$disconnect();
    if (patterns.length === 0) {
        return await ctx.reply("You have no patterns. Use /add to add a pattern.");
    }
    let text = "Your patterns:\n\n";
    for (const pattern of patterns) {
        text += `Pattern: ${pattern.pattern}\nWebhook ID: ${pattern.id}\n\n`;
    }
    await ctx.reply(text);
});

bot.command("deleteAll", async (ctx) => {
    await database.pattern.deleteMany({
        where: {
            User: {
                id: ctx.from?.id,
            },
        },
    });
    await database.$disconnect();
    await ctx.reply("All patterns deleted! You can now use /list to see all your patterns.");
});

bot.command("cancel", async (ctx) => {
    await ctx.conversation.exit();
    await ctx.reply("Canceled.");
});
