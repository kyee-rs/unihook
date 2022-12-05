import { conversations, createConversation } from "@grammyjs/conversations";
import { session } from "grammy";
import { MyContext } from "../types/bot";
import { CustomClient } from "./internals/client";
import { add, dlt } from "./internals/conversations";

export const bot = new CustomClient<MyContext>(process.env.BOT_TOKEN!);

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
    console.log(ctx);
    await bot.handleCommand(ctx, ctx.message.text!);
});
