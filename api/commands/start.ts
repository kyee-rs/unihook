import { InlineKeyboard } from "grammy";
import { MyContext } from "../../types/bot";

export default {
    command: "start",
    description: "Initialize the bot.",
    in_list: true,
    run: async (ctx: MyContext) => {
        const inline = new InlineKeyboard().url("Source code", "https://github.com/voxelin/unihook");
        await ctx.reply(
            "Welcome! I am Universal Webhook Bot. I can send you messages when a webhook is triggered. To get started, please use /register to add your account to a Database.",
            { reply_to_message_id: ctx.message?.message_id, reply_markup: inline },
        );
    },
};
