import { bot } from './core/bot.ts';

await bot.api.deleteWebhook();

bot.start();
console.log(`🦄 Initialized as @${bot.botInfo.username}`);
