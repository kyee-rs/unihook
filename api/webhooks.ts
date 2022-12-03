import { json } from "body-parser";
import express from "express";
import { webhookCallback } from "grammy";
import bot from "./bot";

const app = express();
app.use(json());

app.post(`/${process.env.BOT_TOKEN}`, webhookCallback(bot, "express"));
app.post("/webhook/:token", (req, res) => {
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
        req.params.token,
        `📢 *New alert from GitGuardian*:\nAuthor: \`${data.author.name}<${data.author.info}>\`\nDate: \`${new Date(
            data.date,
        ).toDateString()}\`\nType: \`${data.type}\`\nPolicy: \`${data.policy}\`\nGitGuardian link: \`${
            data.gitguardian_link
        }\`\nBreak URL: \`${data.break_url}\`\nValidity: \`${data.validity}\``,
        { parse_mode: "Markdown" },
    );
    res.send("ok");
});
export = app;
