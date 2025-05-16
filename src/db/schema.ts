import { pgTable, serial, text, timestamp, varchar, uuid, json, boolean, integer } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Audio recordings table
export const recordings = pgTable('recordings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  audioUrl: text('audio_url').notNull(),
  duration: integer('duration'),
  language: varchar('language', { length: 10 }).default('en'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Transcriptions table
export const transcriptions = pgTable('transcriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  recordingId: uuid('recording_id').references(() => recordings.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  confidence: numeric('confidence', { precision: 5, scale: 2 }),
  sourceLanguage: varchar('source_language', { length: 10 }),
  targetLanguage: varchar('target_language', { length: 10 }),
  isTranslated: boolean('is_translated').default(false),
  whisperResponse: json('whisper_response'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User preferences table
export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  defaultLanguage: varchar('default_language', { length: 10 }).default('en'),
  autoTranscribe: boolean('auto_transcribe').default(true),
  theme: varchar('theme', { length: 20 }).default('light'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Message templates table
export const messageTemplates = pgTable('message_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  content: text('content').notNull(),
  language: varchar('language', { length: 10 }).default('en'),
  category: varchar('category', { length: 50 }),
  isFavorite: boolean('is_favorite').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Contacts/Recipients table
export const recipients = pgTable('recipients', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  shareCount: integer('share_count').default(0),
  lastShared: timestamp('last_shared'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Message sharing history
export const shareHistory = pgTable('share_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  recipientId: uuid('recipient_id').references(() => recipients.id, { onDelete: 'set null' }),
  messageContent: text('message_content'),
  audioUrl: text('audio_url'),
  messageTemplateId: uuid('message_template_id').references(() => messageTemplates.id, { onDelete: 'set null' }),
  language: varchar('language', { length: 10 }),
  shareMethod: varchar('share_method', { length: 50 }).default('whatsapp'), // whatsapp, download, etc.
  createdAt: timestamp('created_at').defaultNow(),
});
