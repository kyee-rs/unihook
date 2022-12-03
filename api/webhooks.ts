import { json } from "body-parser";
import { createHash } from "crypto";
import express from "express";
import { webhookCallback } from "grammy";
import bot from "./bot";
const app = express();
app.use(json());

app.post(`/${process.env.BOT_TOKEN}`, webhookCallback(bot, "express"));
app.post("/webhook/:id/:token", (req, res) => {
    if (!req.params.id) return res.status(400).send("Missing token");
    if (isNaN(<any>req.params.id)) return res.status(400).send("Invalid token");
    if (
        req.params.token !==
        createHash("sha256")
            .update(req.params.id + process.env.WEBHOOK_SECRET)
            .digest("hex")
    )
        return res.status(400).send("Invalid token");
    const data: {
        author: { info: string; name: string };
        date: Date;
        type: string;
        policy: string;
        gitguardian_link: string;
        break_url: string;
        severity: string;
        validity: string;
        matches: {
            type: string;
            match: string;
        }[];
    } = req.body;
    bot.api.sendMessage(
        req.params.id,
        `📢 *New alert from GitGuardian*:\nAuthor: \`${data.author.name} <${data.author.info}>\`\nDate: \`${new Date(
            data.date,
        ).toDateString()}\`\nType: \`${data.type}\`\nPolicy: \`${data.policy}\`\nGitGuardian link: [GG Link](${
            data.gitguardian_link
        })\nBreak URL: [File link](${data.break_url})\nValidity: \`${data.validity}\``,
        { parse_mode: "Markdown" },
    );
    res.send("ok");
});
export = app;
