'use client';
import { createBrowserClient } from '@supabase/ssr';

// 브라우저용 Supabase. 로그인 화면에서만 쓴다. 데이터 읽기·쓰기는 서버(서버 액션)에서 한다.
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookieOptions: { sameSite: 'lax', secure: window.location.protocol === 'https:', path: '/' },
  });
}
