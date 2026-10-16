'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// Supabase에서 Google 로그인을 켠 뒤에만 버튼을 보여 준다(.env의 NEXT_PUBLIC_GOOGLE_LOGIN=on)
const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_LOGIN === 'on';

export function LoginForm({ failed }: { failed: boolean }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(failed ? '로그인하지 못했어요. 다시 시도해 주세요.' : '');

  async function oauth(provider: 'google') {
    setMessage('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setMessage('이 로그인 방법이 아직 설정되지 않았어요. 아래 이메일 로그인을 써 주세요.');
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

  // 메일 양식에 {{ .Token }}을 넣으면(사용자 SMTP 필요) 링크 대신 숫자 코드로도 로그인할 수 있다.
  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' });
    setBusy(false);
    if (error) setMessage('코드가 맞지 않거나 시간이 지났어요. 가장 최근 메일의 숫자를 넣어 주세요.');
    else window.location.assign('/dashboard');
  }

  return (
    <div className="card">
      {googleEnabled ? (
        <>
          <button className="btn primary" type="button" onClick={() => oauth('google')} style={{ justifyContent: 'center' }}>
            구글 계정으로 로그인
          </button>
          <div className="hint" style={{ textAlign: 'center' }}>
            또는
          </div>
        </>
      ) : null}
      {sent ? (
        <form className="stack" onSubmit={verifyCode}>
          <p className="notice">
            <b>{email}</b>로 로그인 메일을 보냈어요. 메일의 링크를 이 브라우저에서 눌러 주세요. 메일에 <b>숫자 코드</b>가 있으면 아래에 넣어도 돼요.
          </p>
          <div className="field">
            <label htmlFor="code">메일로 받은 숫자 코드</label>
            <input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6,10}"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
            />
          </div>
          <button className="btn primary" type="submit" disabled={busy}>
            {busy ? '확인 중…' : '로그인'}
          </button>
        </form>
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
