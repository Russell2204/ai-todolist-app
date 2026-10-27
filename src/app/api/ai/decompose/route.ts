import { NextRequest, NextResponse } from 'next/server';
import { decomposeTaskWithAI } from '@/lib/gemini';
import { auth } from '@/lib/auth/server';
import { getUserGeminiConfig } from '@/lib/userKey';

export async function POST(req: NextRequest) {
  try {
    const { data: session } = await auth.getSession();
    const user = session?.user;

    const { apiKey, model: userModel } = await getUserGeminiConfig(user?.id);

    const body = await req.json();
    const { title, description } = body;
    const model = body.model || userModel;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Укажите название задачи для декомпозиции.' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'API-ключ Google Gemini не найден в вашем профиле. Укажите ключ в настройках (иконка ⚙️), чтобы сохранить его в базе данных Neon.',
        },
        { status: 400 }
      );
    }

    const subtasks = await decomposeTaskWithAI(title.trim(), description?.trim(), apiKey, model);

    return NextResponse.json({
      success: true,
      subtasks,
    });
  } catch (error: unknown) {
    console.error('Error in /api/ai/decompose:', error);
    const message = error instanceof Error ? error.message : 'Ошибка при декомпозиции задачи';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
