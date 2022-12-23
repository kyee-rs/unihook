import type { Context, SessionFlavor } from '../../dependencies.deno.ts';
import type {
    Conversation,
    ConversationFlavor,
} from '../../dependencies.deno.ts';
import { ParseModeFlavor } from '../../dependencies.deno.ts';

export type MyContext =
    & Context
    & ConversationFlavor<Context>
    & SessionFlavor<Record<string, unknown>>
    & ParseModeFlavor<Context>;
export type MyConversation = Conversation<MyContext>;
