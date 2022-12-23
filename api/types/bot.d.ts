import type { Context, SessionFlavor } from 'grammy';
import type { Conversation, ConversationFlavor } from 'grammy/convs';
import { ParseModeFlavor } from 'grammy/pm';

export type MyContext =
    & Context
    & ConversationFlavor<Context>
    & SessionFlavor<Record<string, unknown>>
    & ParseModeFlavor<Context>;
export type MyConversation = Conversation<MyContext>;
