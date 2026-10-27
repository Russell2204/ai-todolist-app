import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { getDb } from '@/lib/db';

async function requireUser() {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sql = getDb();
    const rows = await sql`
      SELECT gemini_api_key, COALESCE(model, preferred_model, 'gemini-2.5-flash') as model, auto_analyze_on_add
      FROM user_settings
      WHERE user_id = ${user.id}
    `;

    if (rows.length === 0) {
      return NextResponse.json({
        hasApiKey: false,
        apiKeyMasked: '',
        model: 'gemini-2.5-flash',
        autoAnalyzeOnAdd: true,
      });
    }

    const setting = rows[0];
    const key = setting.gemini_api_key || '';
    const masked = key.length > 8 ? `${key.slice(0, 4)}...${key.slice(-4)}` : key ? '••••••••' : '';

    return NextResponse.json({
      hasApiKey: Boolean(key && key.trim().length > 0),
      apiKeyMasked: masked,
      model: setting.model || 'gemini-2.5-flash',
      autoAnalyzeOnAdd: setting.auto_analyze_on_add ?? true,
    });
  } catch (error: unknown) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { apiKey, model, autoAnalyzeOnAdd } = body;

    const sql = getDb();
    const selectedModel = model || 'gemini-2.5-flash';
    const isAutoAnalyze = autoAnalyzeOnAdd ?? true;

    // If apiKey is provided, trim it. If empty string was sent, check if user wanted to clear or keep
    const keyToSave = apiKey !== undefined && apiKey !== null ? apiKey.trim() : null;

    if (keyToSave !== null && keyToSave.length > 0) {
      await sql`
        INSERT INTO user_settings (
          user_id, gemini_api_key, model, preferred_model, auto_analyze_on_add, updated_at
        ) VALUES (
          ${user.id}, ${keyToSave}, ${selectedModel}, ${selectedModel}, ${isAutoAnalyze}, NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
          gemini_api_key = EXCLUDED.gemini_api_key,
          model = EXCLUDED.model,
          preferred_model = EXCLUDED.preferred_model,
          auto_analyze_on_add = EXCLUDED.auto_analyze_on_add,
          updated_at = NOW()
      `;
    } else {
      // Just update model and auto_analyze_on_add without touching key if key is null/empty
      await sql`
        INSERT INTO user_settings (
          user_id, model, preferred_model, auto_analyze_on_add, updated_at
        ) VALUES (
          ${user.id}, ${selectedModel}, ${selectedModel}, ${isAutoAnalyze}, NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
          model = EXCLUDED.model,
          preferred_model = EXCLUDED.preferred_model,
          auto_analyze_on_add = EXCLUDED.auto_analyze_on_add,
          updated_at = NOW()
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error saving user settings:', error);
    const msg = error instanceof Error ? error.message : 'Database error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
