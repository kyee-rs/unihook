import { MyContext } from "../../types/bot";
import { database } from "../server";
export default {
    command: "deleteAll",
    description: "Delete all your webhook patterns.",
    in_list: true,
    run: async (ctx: MyContext) => {
        if (!(await database.getUser(ctx.from!.id))) {
            await database.createUser(ctx.from!.id);
        }
        await database.deleteAllPatterns(ctx.from!.id);
        await database.close();
        await ctx.reply("All patterns deleted! You can now use /list to see all your patterns.");
    },
};
