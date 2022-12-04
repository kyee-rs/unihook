import { Conversation, ConversationFlavor, conversations, createConversation } from "@grammyjs/conversations";
import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";
import { Bot, Context, session } from "grammy";
const database = new PrismaClient();
type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

async function set(conversation: MyConversation, ctx: MyContext) {
    if (!(await database.user.findUnique({ where: { id: ctx.from?.id } }))) {
        return await ctx.reply("You are not registered. Please use /start to register.");
    }

    await ctx.reply(
        "Please send me the pattern you want to add. Use /cancel to cancel.\n\nExample: `New alert from Webhook {data.webhook_name}`",
    );
    const pattern = await conversation.waitFor(":text");
    if (!pattern.message?.text) return;
    await ctx.reply("Please send me the webhook ID you want to add this pattern to. \n\nExample: `my-webhook`");
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
bot.use(createConversation(set));

bot.command("start", async (ctx) => {
    // await ctx.reply(
    //     "Hello, I am a GitGuardian helper bot! I can help you to protect your GitHub repositories from secrets leaks. To get started, please follow the instructions: \n" +
    //         "1. Go to https://gitguardian.com/ and sign up.\n" +
    //         "2. Go to https://dashboard.gitguardian.com/integrations and create a new webhook integration.\n" +
    //         "3. Copy the webhook URL from next message and paste it in the field below.\n" +
    //         "4. Save and send test message.",
    // );
    // await ctx.reply(
    //     "https://hook.ieljit.lol/webhook/" +
    //         ctx.from?.id +
    //         "/" +
    //         createHash("sha256")
    //             .update(ctx.from?.id + process.env.WEBHOOK_SECRET!)
    //             .digest("hex"),
    // );
    await ctx.reply("Registering...");
    if (await database.user.findUnique({ where: { id: ctx.from?.id } })) {
        return await ctx.reply("You are already registered.");
    }
    await database.user.create({
        data: {
            id: ctx.from!.id,
        },
    });
    await database.$disconnect();
    await ctx.reply("Registered!");
});

bot.command("set", async (ctx) => {
    await ctx.conversation.enter("set");
});

bot.command("cancel", async (ctx) => {
    await ctx.conversation.exit();
    await ctx.reply("Canceled.");
});
