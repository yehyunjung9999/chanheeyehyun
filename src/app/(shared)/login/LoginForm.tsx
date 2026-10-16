'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// Supabase에서 Google 로그인을 켠 뒤에만 버튼을 보여 준다(.env의 NEXT_PUBLIC_GOOGLE_LOGIN=on)
const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_LOGIN === 'on';

export function LoginForm({ failed }: { failed: boolean }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(failed ? '로그인하지 못했어요. 다시 시도해 주세요.' : '');

  async function google() {
    setMessage('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setMessage('구글 로그인이 아직 설정되지 않았어요. 아래 이메일 로그인을 써 주세요.');
  }

  async function emailLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setBusy(false);
    if (error) setMessage(`로그인 메일을 보내지 못했어요. ${error.message}`);
    else setSent(true);
  }

  return (
    <div className="card">
      {googleEnabled ? (
        <>
          <button className="btn primary" type="button" onClick={google} style={{ justifyContent: 'center' }}>
            구글 계정으로 로그인
          </button>
          <div className="hint" style={{ textAlign: 'center' }}>
            또는
          </div>
        </>
      ) : null}
      {sent ? (
        <p className="notice">
          <b>{email}</b>로 로그인 링크를 보냈어요. 메일함에서 링크를 누르면 이 화면으로 돌아와요. 같은 브라우저에서 눌러 주세요.
        </p>
      ) : (
        <form className="stack" onSubmit={emailLink}>
          <div className="field">
            <label htmlFor="email">학교 메일 주소</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teacher@school.kr" />
          </div>
          <button className="btn" type="submit" disabled={busy}>
            {busy ? '보내는 중…' : '이메일로 로그인 링크 받기'}
          </button>
        </form>
      )}
      {message ? <p className="notice warn">{message}</p> : null}
    </div>
  );
}
