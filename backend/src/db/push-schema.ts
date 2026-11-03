import { boolean, index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { user } from './auth-schema';

export const pushToken = pgTable(
  'push_token',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    platform: text('platform'),
    disabled: boolean('disabled').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('push_token_userId_idx').on(table.userId)],
);
