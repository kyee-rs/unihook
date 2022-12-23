# 📡 UniHook - A simple webhook handler for Telegram. [@uniwebhookbot](https://uniwebhookbot.t.me/)

## 📝 Description

UniHook is a simple webhook handler for Telegram. It allows you to create a webhook for your bot and receive updates from Telegram. It is written in Deno and uses the [grammY](https://grammy.dev) framework. This branch differs from the main branch in that it uses Deno Deploy instead of a VPS. This means that you can use UniHook for free.

## 🚀 Deploy

1. Click [here](https://dash.deno.com/new?url=https://raw.githubusercontent.com/voxelin/unihook/deno/api/edge.ts&env=BOT_TOKEN,DATABASE_URL) to deploy UniHook to Deno Deploy.
2. Enter the bot token and database URL in the environment variables.
3. Click "Deploy".
4. Open `https://api.telegram.org/bot{BOT_TOKEN}/setWebhook?url={DEPLOY_URL}/bot/{BOT_TOKEN}` to set the webhook. Replace `{BOT_TOKEN}` with your bot token and `{DEPLOY_URL}` with the URL of your deploy.
5. You're done! You can now use UniHook.

> ⚠ WARNING: If you are using Deno Deploy, you must use the Prisma Data Proxy. It's because edge limits query execution time. You can find more information about the Prisma Data Proxy [here](https://www.prisma.io/docs/data-platform/data-proxy/use-data-proxy).

## 👏 Credits

- [grammY](https://grammy.dev) - The framework used to create UniHook.
- [Deno Deploy](https://deno.com/deploy) - The platform used to host UniHook.
- [Deno](https://deno.land) - The runtime used to run UniHook.
- [TypeScript](https://www.typescriptlang.org) - The language used to write UniHook.