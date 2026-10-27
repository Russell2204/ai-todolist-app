import { neon } from '@neondatabase/serverless';

const url = "postgresql://neondb_owner:npg_QcBjGEO7il5p@ep-muddy-bar-ba35o4yx.c-8.eu-central-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";
const sql = neon(url);

async function main() {
  console.log('Connecting to Neon PostgreSQL...');
  
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
  console.log('Table tasks created/verified.');

  await sql`
    CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)
  `;
  console.log('Index idx_tasks_user_id created/verified.');

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
  console.log('Table user_settings created/verified.');

  const res = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
  console.log('Public tables in Neon DB:', res.map(r => r.table_name));
}

main().catch(console.error);
