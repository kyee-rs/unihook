import type { Conversation, ConversationFlavor } from "@grammyjs/conversations";
import type { Context, SessionFlavor } from "grammy";
export type MyContext = Context & ConversationFlavor<Context> & SessionFlavor<Record<string, unknown>>;
export type MyConversation = Conversation<MyContext>;
