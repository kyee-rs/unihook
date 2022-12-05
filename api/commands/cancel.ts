import { MyContext } from "../../types/bot";

export default {
    command: "cancel",
    description: "Cancel the current operation",
    in_list: true,
    run: async (ctx: MyContext) => {
        await ctx.conversation.exit();
        await ctx.reply("Canceled.", {
            reply_to_message_id: ctx.message?.message_id,
            reply_markup: { remove_keyboard: true },
        });
    },
};
