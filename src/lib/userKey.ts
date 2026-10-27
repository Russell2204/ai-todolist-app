import { getDb } from './db';

export async function getUserGeminiConfig(userId?: string): Promise<{ apiKey: string; model: string }> {
  let userApiKey = '';
  let model = 'gemini-2.5-flash';

  if (userId) {
    try {
      const sql = getDb();
      const rows = await sql`
        SELECT gemini_api_key, COALESCE(model, preferred_model, 'gemini-2.5-flash') as model
        FROM user_settings
        WHERE user_id = ${userId}
      `;
      if (rows.length > 0) {
        userApiKey = rows[0].gemini_api_key || '';
        if (rows[0].model) {
          model = rows[0].model;
        }
      }
    } catch (e) {
      console.error('Failed to query user_settings:', e);
    }
  }

  // Fallback to server env if user hasn't set their own key
  const finalApiKey = userApiKey.trim() || process.env.GEMINI_API_KEY?.trim() || '';

  return { apiKey: finalApiKey, model };
}
