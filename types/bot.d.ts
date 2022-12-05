import type { Conversation, ConversationFlavor } from "@grammyjs/conversations";
import type { Context } from "grammy";
export type MyContext = Context & ConversationFlavor<Context>;
export type MyConversation = Conversation<MyContext>;
