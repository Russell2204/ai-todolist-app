'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getDb } from '@/lib/db';
import { INITIAL_TASKS } from '@/lib/initialData';

export async function signUpWithEmail(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  if (!name || !email || password.length < 8) {
    return { error: 'Заполните имя, email и пароль минимум 8 символов' };
  }

  const { data, error } = await auth.signUp.email({ name, email, password });
  if (error) {
    return { error: error.message || 'Не удалось создать аккаунт' };
  }

  // Pre-seed demo tasks in Neon DB for the new user
  if (data?.user?.id) {
    try {
      const sql = getDb();
      for (const t of INITIAL_TASKS) {
        await sql`
          INSERT INTO tasks (
            id, user_id, title, description, created_at, due_date, is_completed,
            priority, quadrant, estimated_minutes, tags, subtasks, ai_score, ai_reasoning
          ) VALUES (
            ${`task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`},
            ${data.user.id},
            ${t.title},
            ${t.description || null},
            ${t.createdAt},
            ${t.dueDate || null},
            ${t.isCompleted},
            ${t.priority},
            ${t.quadrant || 'SCHEDULE'},
            ${t.estimatedMinutes || 30},
            ${JSON.stringify(t.tags)}::jsonb,
            ${JSON.stringify(t.subtasks)}::jsonb,
            ${t.aiScore ?? null},
            ${t.aiReasoning || null}
          )
        `;
      }
    } catch (e) {
      console.error('Error pre-seeding demo tasks:', e);
    }
  }

  redirect('/');
}
