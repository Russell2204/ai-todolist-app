import { neon } from '@neondatabase/serverless';

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not configured');
  }
  return neon(url);
}

export async function initDbSchema() {
  const sql = getDb();

  // Create tasks table
  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      due_date TIMESTAMPTZ,
      is_completed BOOLEAN DEFAULT FALSE,
      priority TEXT NOT NULL DEFAULT 'MEDIUM',
      quadrant TEXT DEFAULT 'SCHEDULE',
      estimated_minutes INTEGER DEFAULT 30,
      tags JSONB DEFAULT '[]'::jsonb,
      subtasks JSONB DEFAULT '[]'::jsonb,
      ai_score INTEGER,
      ai_reasoning TEXT
    )
  `;

  // Create index on user_id
  await sql`
    CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)
  `;

  // Create user_settings table to store each user's own Google Gemini API key
  await sql`
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY,
      gemini_api_key TEXT,
      model TEXT DEFAULT 'gemini-2.5-flash',
      auto_analyze_on_add BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}
