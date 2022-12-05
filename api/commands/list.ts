import { MyContext } from "../../types/bot";
import { database } from "../server";

export default {
    command: "list",
    description: "List all your patterns.",
    in_list: true,
    run: async (ctx: MyContext) => {
        if (!(await database.getUser(ctx.from!.id))) {
            await database.createUser(ctx.from!.id);
        }
        const patterns = await database.getPatterns(ctx.from!.id);
        await database.close();
        if (patterns.length === 0) {
            return await ctx.reply("You have no patterns. Use /add to add a pattern.");
        }
        let text = "Your patterns:\n\n";
        for (const pattern of patterns) {
            text += `Pattern: ${pattern.pattern}\nWebhook ID: ${pattern.id}\n\n`;
        }
        await ctx.reply(text);
    },
};
