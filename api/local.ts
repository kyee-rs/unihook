import { run } from '../dependencies.deno.ts';
import { bot } from './core/bot.ts';
await bot.api.deleteWebhook();

const runner = run(bot, 300, {});
console.log(`🦄 Initialized as @${bot.botInfo.username}`);

const stopRunner = () => runner.isRunning() && runner.stop();
Deno.addSignalListener('SIGINT', stopRunner);
Deno.addSignalListener('SIGTERM', stopRunner);
