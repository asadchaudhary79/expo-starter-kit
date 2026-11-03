import { index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

import { user } from './auth-schema';

export const notificationResult = pgTable(
  'notification_result',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    kind: text('kind').notNull(),
    messageId: text('message_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('notification_result_userId_idx').on(table.userId),
    uniqueIndex('notification_result_user_kind_message_uidx').on(table.userId, table.kind, table.messageId),
  ],
);
