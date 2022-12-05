import { json } from "body-parser";
import { createHash } from "crypto";
import express from "express";
import { webhookCallback } from "grammy";
import { bot } from "./bot";
import { Database } from "./internals/database";
const app = express();
export const database = new Database();
app.use(json());

app.post(`/${process.env.BOT_TOKEN}`, webhookCallback(bot, "express"));
app.post("/:id/:token/:hookid", (req, res) => {
    if (!req.params.id) return res.status(400).send("Missing id");
    if (isNaN(<any>req.params.id)) return res.status(400).send("Invalid token");
    if (!req.params.token) return res.status(400).send("Missing token");
    if (!req.params.hookid) return res.status(400).send("Missing hookid");
    if (
        req.params.token !==
        createHash("sha256")
            .update(req.params.id + process.env.WEBHOOK_SECRET)
            .digest("hex")
    )
        return res.status(400).send("Invalid token");
    const data = req.body;
    if (!data) return res.status(400).send("Missing payload");
    database.user.findUnique({ where: { id: parseInt(req.params.id) } }).then((user) => {
        if (!user) return res.status(400).send("Invalid user");
        database.pattern
            .findUnique({ where: { id: req.params.hookid } })
            .then((webhook) => {
                if (!webhook) return res.status(400).send("Invalid webhook");
                let message = webhook.pattern;
                if (!message) return res.status(400).send("Invalid webhook");
                try {
                    const regex = /{([^}]+)}/g;
                    const matches = message.match(regex);
                    if (matches) {
                        for (const match of matches) {
                            const key = match.replace("{", "").replace("}", "");
                            if (key.includes(".")) {
                                const keys = key.split(".");
                                let value = data;
                                for (const key of keys) {
                                    value = value[key] ?? "";
                                }
                                message = message.replace(match, value);
                            } else if (key.includes("[")) {
                                const keys = key.split("[");
                                let value = data;
                                for (const key of keys) {
                                    value = value[key.replace("]", "")];
                                }
                                message = message.replace(match, value ?? "");
                            } else {
                                message = message.replace(match, data[key] ?? "<undefined>");
                            }
                        }
                    }
                    bot.api.sendMessage(req.params.id, message, { parse_mode: "Markdown" });
                    res.send("ok");
                } catch (e) {
                    res.status(500).send("Internal server error");
                }
            })
            .then(() => database.$disconnect())
            .catch(() => {
                res.status(500).send("Internal server error");
                database.$disconnect();
            });
    });
});

app.listen(3000);
