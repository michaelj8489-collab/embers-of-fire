# Chat database decommission plan

This application pass disables all chat reads, writes, routes, realtime listeners, bots, and chat push delivery. It makes no remote Supabase changes and does not delete historical data.

## Chat-specific remote objects to review

- `public.chat_messages`
- `public.chat_commands`
- `public.chat_push_deliveries`
- associated row-level-security policies, triggers, indexes, functions, and Realtime publication entries
- `chat_uploads` storage bucket, its objects, and storage policies

## Safe immediate shutdown actions completed here

- The application no longer exposes a chat route, embedded chat UI, chat API, bot controls, or `chat_messages` subscription.
- Legacy chat URLs permanently redirect to `/dashboard`.
- Generic push subscriptions, broadcasts, show-live alerts, and their APIs remain in service.

## Irreversible later purge actions

After confirming retention requirements and taking a backup, an authorized database administrator may separately:

1. Delete historical `chat_messages`, commands, push-delivery records, and chat-upload objects (including voice notes).
2. Drop chat tables, indexes, policies, triggers, functions, and Realtime publication entries.
3. Remove the `chat_uploads` bucket and storage policies.

Do not perform these destructive steps through this application deployment or without a separately reviewed migration and backup plan.
