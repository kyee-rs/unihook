import { MyContext } from "../../types/bot";

export default {
    command: "delete",
    description: "Delete a webhook.",
    in_list: true,
    run: async (ctx: MyContext) => {
        await ctx.conversation.enter("dlt");
    },
};
