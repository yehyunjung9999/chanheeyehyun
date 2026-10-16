import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 파트 0 소유. 구글 로그인·이메일 링크에서 돌아오는 곳.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/dashboard`);
  }
  return NextResponse.redirect(`${origin}/login?error=1`);
}
