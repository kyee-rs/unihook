import { Bot } from "grammy";

const bot = new Bot(process.env.BOT_TOKEN!);

bot.command("start", (ctx) =>
    ctx.reply(
        "Hello, I am a GitGuardian helper bot! I can help you to protect your GitHub repositories from secrets leaks. To get started, please visit https://gitguardian.com",
    ),
);

export default bot;
