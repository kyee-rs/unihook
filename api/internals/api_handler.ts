import { createHash } from "crypto";
import { Request, Response } from "express";
import { bot } from "../bot";
import { database } from "../server";

export const handle = async (req: Request, res: Response) => {
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
    await database.getUser(parseInt(req.params.id)).then(async (user) => {
        if (!user) return res.status(400).send("Invalid user");
        await database
            .getPattern(req.params.hookid)
            .then(async (webhook) => {
                if (!webhook) return res.status(400).send("Invalid webhook");
                let message = webhook.pattern;
                if (!message) return res.status(400).send("Invalid webhook");
                try {
                    if (message === "{}") {
                        await bot.api.sendMessage(req.params.id, `\`\`\`\n${JSON.stringify(data, null, 4)}\n\`\`\``);
                        return res.status(200).send("ok");
                    }
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
                    await bot.api.sendMessage(req.params.id, message);
                    res.send("ok");
                } catch (e) {
                    console.error(e);
                    res.status(500).send("Internal server error");
                }
            })
            .then(() => database.close())
            .catch((e) => {
                console.error(e);
                res.status(500).send("Internal server error");
                database.close();
            });
    });
};
