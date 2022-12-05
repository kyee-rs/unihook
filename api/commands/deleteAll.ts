import { MyContext } from "../../types/bot";
import { database } from "../server";
export default {
    command: "delete_all",
    description: "Delete all your webhook patterns.",
    in_list: true,
    run: async (ctx: MyContext) => {
        if (!(await database.getUser(ctx.from!.id))) {
            await database.createUser(ctx.from!.id);
        }
        await ctx.reply(`☑️ Successfully deleted ${(await database.getPatterns(ctx.from!.id)).length} patterns.`);
        await database.deleteAllPatterns(ctx.from!.id);
        await database.close();
    },
};
