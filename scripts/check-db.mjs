import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_QcBjGEO7il5p@ep-muddy-bar-ba35o4yx.c-8.eu-central-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require');

async function run() {
  const userCols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'user_settings'
  `;
  console.log('Columns in user_settings:', userCols);

  const taskCols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'tasks'
  `;
  console.log('Columns in tasks:', taskCols);
}

run().catch(console.error);
