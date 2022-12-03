import { createHash } from "crypto";
import { Bot } from "grammy";

const bot = new Bot(process.env.BOT_TOKEN!);

bot.command("start", async (ctx) => {
    await ctx.reply(
        "Hello, I am a GitGuardian helper bot! I can help you to protect your GitHub repositories from secrets leaks. To get started, please follow the instructions: \n" +
            "1. Go to https://gitguardian.com/ and sign up.\n" +
            "2. Go to https://dashboard.gitguardian.com/integrations and create a new webhook integration.\n" +
            "3. Copy the webhook URL from next message and paste it in the field below.\n" +
            "4. Save and send test message.",
    );
    await ctx.reply(
        "https://gg.ieljit.lol/webhook/" +
            ctx.from?.id +
            "/" +
            createHash("sha256")
                .update(ctx.from?.id + process.env.WEBHOOK_SECRET!)
                .digest("hex"),
    );
});

export default bot;
