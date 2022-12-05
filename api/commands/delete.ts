import { MyContext } from "../../types/bot";
import { deleteMenu } from "../internals/conversations";
import { database } from "../server";

export default {
    command: "delete",
    description: "Delete a webhook.",
    in_list: true,
    run: async (ctx: MyContext) => {
        if ((await database.getPatterns(ctx.from!.id)).length === 0) {
            return await ctx.reply("🚫 You have *no* patterns. Use /add to add a pattern.");
        }
        await ctx.reply("📡 Please, choose the webhook you want to delete.", { reply_markup: deleteMenu });
    },
};
