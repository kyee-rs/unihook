import type { Conversation, ConversationFlavor } from "@grammyjs/conversations";
import { ParseModeFlavor } from "@grammyjs/parse-mode";
import type { Context, SessionFlavor } from "grammy";
export type MyContext = Context &
    ConversationFlavor<Context> &
    SessionFlavor<Record<string, unknown>> &
    ParseModeFlavor<Context>;
export type MyConversation = Conversation<MyContext>;
