import { MyContext } from "../../types/bot";

export default {
    command: "add",
    description: "Add a new webhook pattern.",
    in_list: true,
    run: async (ctx: MyContext) => {
        await ctx.conversation.enter("add");
    },
};
