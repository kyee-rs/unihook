import { PrismaClient } from "@prisma/client";
import { json } from "body-parser";
import { createHash } from "crypto";
import express from "express";
// import { webhookCallback } from "grammy";
import { bot } from "./bot";
const app = express();
const database = new PrismaClient();
app.use(json());

// app.post(`/${process.env.BOT_TOKEN}`, webhookCallback(bot, "express"));
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
                            const value = data[key] || "<undefined_value>";
                            message = message.replace(match, value);
                        }
                    }
                    bot.api.sendMessage(req.params.id, message);
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
bot.start();
app.listen(3000);
