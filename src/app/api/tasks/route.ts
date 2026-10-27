import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { getDb } from '@/lib/db';
import { Task } from '@/types/todo';

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
      SELECT
        id,
        title,
        description,
        created_at as "createdAt",
        due_date as "dueDate",
        is_completed as "isCompleted",
        priority,
        quadrant,
        estimated_minutes as "estimatedMinutes",
        tags,
        subtasks,
        ai_score as "aiScore",
        ai_reasoning as "aiReasoning"
      FROM tasks
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ tasks: rows });
  } catch (error: unknown) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const sql = getDb();

    const id = body.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const title = body.title;
    const description = body.description || null;
    const dueDate = body.dueDate || null;
    const isCompleted = Boolean(body.isCompleted);
    const priority = body.priority || 'MEDIUM';
    const quadrant = body.quadrant || 'SCHEDULE';
    const estimatedMinutes = body.estimatedMinutes || 30;
    const tags = JSON.stringify(body.tags || []);
    const subtasks = JSON.stringify(body.subtasks || []);
    const aiScore = body.aiScore ?? null;
    const aiReasoning = body.aiReasoning || null;

    await sql`
      INSERT INTO tasks (
        id, user_id, title, description, due_date, is_completed,
        priority, quadrant, estimated_minutes, tags, subtasks, ai_score, ai_reasoning
      ) VALUES (
        ${id}, ${user.id}, ${title}, ${description}, ${dueDate}, ${isCompleted},
        ${priority}, ${quadrant}, ${estimatedMinutes}, ${tags}::jsonb, ${subtasks}::jsonb, ${aiScore}, ${aiReasoning}
      )
    `;

    const newTask: Task = {
      id,
      title,
      description: description || undefined,
      createdAt: new Date().toISOString(),
      dueDate: dueDate || undefined,
      isCompleted,
      priority,
      quadrant,
      estimatedMinutes,
      tags: body.tags || [],
      subtasks: body.subtasks || [],
      aiScore: aiScore ?? undefined,
      aiReasoning: aiReasoning || undefined,
    };

    return NextResponse.json({ success: true, task: newTask });
  } catch (error: unknown) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
