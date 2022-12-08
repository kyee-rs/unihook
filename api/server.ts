import { json } from "body-parser";
import compression from "compression";
import express from "express";
import { webhookCallback } from "grammy";
import { bot } from "./bot";
import { handle } from "./internals/api_handler";
import { Database } from "./internals/database";
const app = express();
export const database = new Database();
database.init();

app.use(json());
app.use(compression());

app.post(`/${process.env.BOT_TOKEN}`, webhookCallback(bot, "express"));
app.post("/:id/:token/:hookid", handle);

app.listen(3000);
if (process.argv[2] === "--dev" || process.env.NODE_ENV === "development") {
    bot.start();
}
