import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { getUserGeminiConfig } from '@/lib/userKey';

export async function GET() {
  const { data: session } = await auth.getSession();
  const user = session?.user;

  const { apiKey, model } = await getUserGeminiConfig(user?.id);
  const hasServerKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  const hasUserKey = Boolean(apiKey && apiKey.trim().length > 0);

  return NextResponse.json({
    hasServerKey,
    hasUserKey,
    isKeyReady: hasUserKey || hasServerKey,
    defaultModel: model,
    user: user ? { id: user.id, name: user.name, email: user.email } : null,
  });
}
