import { NextRequest, NextResponse } from 'next/server';
import { testGeminiConnection } from '@/lib/gemini';
import { auth } from '@/lib/auth/server';
import { getUserGeminiConfig } from '@/lib/userKey';

export async function POST(req: NextRequest) {
  try {
    const { data: session } = await auth.getSession();
    const user = session?.user;

    const body = await req.json().catch(() => ({}));
    let apiKey = body.apiKey;
    let model = body.model || 'gemini-2.5-flash';

    if (!apiKey) {
      const config = await getUserGeminiConfig(user?.id);
      apiKey = config.apiKey;
      model = config.model;
    }

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API-ключ не передан и не найден в профиле' },
        { status: 400 }
      );
    }

    const result = await testGeminiConnection(apiKey, model);

    return NextResponse.json({
      success: true,
      message: 'Подключение к Gemini API успешно установлено!',
      reply: result.text,
    });
  } catch (error: unknown) {
    console.error('Error in /api/ai/test:', error);
    const message = error instanceof Error ? error.message : 'Не удалось связаться с Gemini API';

    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
