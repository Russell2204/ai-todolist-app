import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_QcBjGEO7il5p@ep-muddy-bar-ba35o4yx.c-8.eu-central-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require');

async function migrate() {
  console.log('Migrating user_settings columns in Neon...');
  
  await sql`
    ALTER TABLE user_settings
    ADD COLUMN IF NOT EXISTS model TEXT DEFAULT 'gemini-2.5-flash',
    ADD COLUMN IF NOT EXISTS auto_analyze_on_add BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()
  `;

  // Sync any existing preferred_model into model
  await sql`
    UPDATE user_settings
    SET model = COALESCE(model, preferred_model, 'gemini-2.5-flash')
  `;

  const cols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'user_settings'
  `;
  console.log('Updated user_settings columns:', cols);
}

migrate().catch(console.error);
