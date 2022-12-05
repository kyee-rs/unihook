import { InlineKeyboard } from "grammy";
import { MyContext } from "../../types/bot";

export default {
    command: "start",
    description: "Initialize the bot.",
    in_list: true,
    run: async (ctx: MyContext) => {
        const inline = new InlineKeyboard().url("Source code 🇺🇦", "https://github.com/voxelin/unihook");
        await ctx.reply(
            "Welcome! I am *Universal Webhook Bot* 🇺🇦.\nI can send you templated messages when a webhook is triggered.\nTo get started, add a webhook handler using /add.",
            { reply_to_message_id: ctx.message?.message_id, reply_markup: inline },
        );
    },
};
