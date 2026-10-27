import { NextRequest, NextResponse } from 'next/server';
import { parseTaskNLPWithAI } from '@/lib/gemini';
import { auth } from '@/lib/auth/server';
import { getUserGeminiConfig } from '@/lib/userKey';

export async function POST(req: NextRequest) {
  try {
    const { data: session } = await auth.getSession();
    const user = session?.user;

    const { apiKey, model: userModel } = await getUserGeminiConfig(user?.id);

    const body = await req.json();
    const { text } = body;
    const model = body.model || userModel;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Введите текст задачи для анализа.' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'API-ключ Google Gemini не найден в профиле. Укажите ключ в настройках (иконка ⚙️), чтобы сохранить его в базе данных Neon.',
        },
        { status: 400 }
      );
    }

    const parsed = await parseTaskNLPWithAI(text.trim(), apiKey, model);

    return NextResponse.json({
      success: true,
      data: parsed,
    });
  } catch (error: unknown) {
    console.error('Error in /api/ai/parse-task:', error);
    const message = error instanceof Error ? error.message : 'Ошибка при анализе текста задачи';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
