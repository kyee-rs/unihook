# 📡 UniHook - A simple webhook handler for Telegram. [@uniwebhookbot](https://uniwebhookbot.t.me/)

## 📝 Description

UniHook is a free webhook handler for Telegram, powered by Deno and the grammY framework. It enables you to create a webhook listener on your webserver and receive updates in Telegram quickly and easily. Unlike the main branch, this branch uses Deno Deploy instead of a VPS, meaning that you can use UniHook at no cost.

## 🚀 Deploy

1. Click [here](https://dash.deno.com/new?url=https://raw.githubusercontent.com/voxelin/unihook/master/api/edge.ts&env=BOT_TOKEN,DATABASE_URL,WEBHOOK_SECRET) to deploy UniHook to Deno Deploy.
2. Enter your bot token, database URL, and webhook secret into the environment variables, then click "Deploy". 
3. Once you've done that, open `https://api.telegram.org/bot{BOT_TOKEN}/setWebhook?url={DEPLOY_URL}/bot/{BOT_TOKEN}`, replacing `{BOT_TOKEN}` with your own bot token and `{DEPLOY_URL}` with your own deploy URL.
4. You're all set - you can now use UniHook!

> ⚠ WARNING: If you are using Deno Deploy, you must use the Prisma Data Proxy due to edge limits on query execution time.
> For more information about the Prisma Data Proxy, please refer to the relevant documentation
> [here](https://www.prisma.io/docs/data-platform/data-proxy/use-data-proxy).

## 👏 Credits

- [grammY](https://grammy.dev) - The framework used to create UniHook.
- [Deno Deploy](https://deno.com/deploy) - The platform used to host UniHook.
- [Deno](https://deno.land) - The runtime used to run UniHook.
- [TypeScript](https://www.typescriptlang.org) - The language used to write
  UniHook.
