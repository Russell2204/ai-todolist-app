import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { getDb } from '@/lib/db';

async function requireUser() {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const sql = getDb();

    // Check existing
    const existing = await sql`
      SELECT * FROM tasks WHERE id = ${id} AND user_id = ${user.id}
    `;

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const current = existing[0];
    const title = body.title !== undefined ? body.title : current.title;
    const description = body.description !== undefined ? body.description : current.description;
    const dueDate = body.dueDate !== undefined ? body.dueDate : current.due_date;
    const isCompleted = body.isCompleted !== undefined ? body.isCompleted : current.is_completed;
    const priority = body.priority !== undefined ? body.priority : current.priority;
    const quadrant = body.quadrant !== undefined ? body.quadrant : current.quadrant;
    const estimatedMinutes = body.estimatedMinutes !== undefined ? body.estimatedMinutes : current.estimated_minutes;
    const tags = body.tags !== undefined ? JSON.stringify(body.tags) : JSON.stringify(current.tags || []);
    const subtasks = body.subtasks !== undefined ? JSON.stringify(body.subtasks) : JSON.stringify(current.subtasks || []);
    const aiScore = body.aiScore !== undefined ? body.aiScore : current.ai_score;
    const aiReasoning = body.aiReasoning !== undefined ? body.aiReasoning : current.ai_reasoning;

    await sql`
      UPDATE tasks
      SET
        title = ${title},
        description = ${description},
        due_date = ${dueDate},
        is_completed = ${isCompleted},
        priority = ${priority},
        quadrant = ${quadrant},
        estimated_minutes = ${estimatedMinutes},
        tags = ${tags}::jsonb,
        subtasks = ${subtasks}::jsonb,
        ai_score = ${aiScore},
        ai_reasoning = ${aiReasoning}
      WHERE id = ${id} AND user_id = ${user.id}
    `;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const sql = getDb();

    await sql`
      DELETE FROM tasks WHERE id = ${id} AND user_id = ${user.id}
    `;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
