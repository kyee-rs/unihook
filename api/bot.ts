import { MyContext } from "../types/bot";
import { CustomClient } from "./internals/client";

export const bot = new CustomClient<MyContext>(process.env.BOT_TOKEN!);
bot.prepate();

bot.on("message", async (ctx) => {
    console.log(ctx);
    await bot.handleCommand(ctx, ctx.message.text!);
});
