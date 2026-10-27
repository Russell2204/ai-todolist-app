import { NextRequest, NextResponse } from 'next/server';
import { prioritizeTasksWithAI } from '@/lib/gemini';
import { Task } from '@/types/todo';
import { auth } from '@/lib/auth/server';
import { getUserGeminiConfig } from '@/lib/userKey';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { data: session } = await auth.getSession();
    const user = session?.user;

    const { apiKey, model: userModel } = await getUserGeminiConfig(user?.id);

    const body = await req.json();
    const tasks: Task[] = body.tasks || [];
    const model = body.model || userModel;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json(
        { error: 'Список задач пуст. Добавьте задачи для приоритезации.' },
        { status: 400 }
      );
    }

    // Limit context: max 50 active tasks
    const activeTasks = tasks.filter((t) => !t.isCompleted).slice(0, 50);

    if (activeTasks.length === 0) {
      return NextResponse.json(
        { error: 'Нет активных (незавершенных) задач для анализа.' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'API-ключ Google Gemini не найден в вашем профиле. Пожалуйста, откройте настройки (иконка ⚙️) и укажите свой GEMINI_API_KEY (он сохранится в базе данных Neon).',
        },
        { status: 400 }
      );
    }

    const prioritized = await prioritizeTasksWithAI(activeTasks, apiKey, model);

    // If user is authenticated, update the tasks in the Neon database
    if (user?.id) {
      const sql = getDb();
      for (const item of prioritized) {
        await sql`
          UPDATE tasks
          SET
            priority = ${item.priority},
            quadrant = ${item.quadrant},
            estimated_minutes = ${item.estimatedMinutes},
            ai_score = ${item.aiScore},
            ai_reasoning = ${item.aiReasoning}
          WHERE id = ${item.id} AND user_id = ${user.id}
        `;
      }
    }

    return NextResponse.json({
      success: true,
      data: prioritized,
      analyzedCount: activeTasks.length,
    });
  } catch (error: unknown) {
    console.error('Error in /api/ai/prioritize:', error);
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка ИИ при приоритезации';

    const isRateLimit = message.includes('429') || message.toLowerCase().includes('quota');
    const isInvalidKey = message.includes('400') || message.includes('403') || message.includes('API_KEY_INVALID');

    return NextResponse.json(
      {
        error: message,
        isRateLimit,
        isInvalidKey,
      },
      { status: isRateLimit ? 429 : isInvalidKey ? 401 : 500 }
    );
  }
}
