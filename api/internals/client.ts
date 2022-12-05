import { autoRetry } from "@grammyjs/auto-retry";
import { readdirSync } from "fs";
import { Bot, BotConfig, Context } from "grammy";
import { MyContext } from "../../types/bot";
import { bot } from "../bot";
import Command from "../commands";

export class CustomClient<C extends Context = MyContext> extends Bot<C> {
    public commands: Command[] = [];
    constructor(token: string, config?: BotConfig<C>) {
        super(token, config);
    }
    public prepate() {
        this.api.config.use(autoRetry());
        readdirSync("./dist/commands").forEach(async (file) => {
            if (file.endsWith(".js")) {
                const data: Command = (await import(`../commands/${file}`)).default;
                this.commands.push(data);
            }
        });
    }
    public async handleCommand(ctx: C, command?: string) {
        if (!command) throw new Error("Command is undefined");
        if (command.startsWith("/")) command = command.slice(1);
        if (command.includes("@")) {
            if (command.split("@")[1] !== bot.botInfo.username) return;
            command = command.split("@")[0];
        }
        if (this.commands.filter((cmd) => cmd.command === command).length > 0) {
            return this.commands.filter((cmd) => cmd.command === command)[0].run(ctx);
        }
    }
}
