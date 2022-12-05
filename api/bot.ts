import { MyContext } from "../types/bot";
import { CustomClient } from "./internals/client";

export const bot = new CustomClient<MyContext>(process.env.BOT_TOKEN!, {
    botInfo: {
        id: 5889865725,
        is_bot: true,
        first_name: "Universal Webhook",
        username: "uniwebhookbot",
        can_join_groups: true,
        can_read_all_group_messages: false,
        supports_inline_queries: false,
    },
    client: {
        canUseWebhookReply: (method) => method === "sendChatAction",
    },
});
bot.prepate();

bot.on("message", async (ctx) => {
    await bot.handleCommand(ctx, ctx.message.text!);
});
