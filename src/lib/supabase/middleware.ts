import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> };

// 요청마다 로그인 세션을 확인·갱신하고, 승인된 교사인지 알려 준다.
export async function readSession(request: NextRequest) {
  const cookiesToApply: CookieToSet[] = [];
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookieOptions: { sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToApply.push(...list);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let approved = false;
  if (user) {
    const { data } = await supabase.from('teachers').select('approved').eq('id', user.id).maybeSingle();
    approved = Boolean(data?.approved);
  }
  return { user, approved, cookiesToApply };
}
