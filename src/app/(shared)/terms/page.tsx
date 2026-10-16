import type { Metadata } from 'next';

export const metadata: Metadata = { title: '이용약관' };

export default function TermsPage() {
  return (
    <article className="doc stack">
      <div>
        <div className="crumb">보장지도 매니저</div>
        <h1>이용약관</h1>
      </div>
      <section className="card">
        <h2>1. 이용 대상</h2>
        <p>이 서비스는 학교의 최소 성취수준 보장지도 업무를 맡은 교사만 이용합니다. 처음 로그인하면 담당 교사의 승인을 받아야 합니다.</p>
      </section>
      <section className="card">
        <h2>2. 이용자의 의무</h2>
        <ul>
          <li>학생 이름·연락처·민감정보를 입력하지 않습니다. 이름은 명렬표 불러오기(이 컴퓨터에만 저장)로만 봅니다.</li>
          <li>계정을 다른 사람과 함께 쓰지 않고, 공용 컴퓨터에서는 사용 후 로그아웃하고 명렬표를 지웁니다.</li>
          <li>서비스가 계산한 시수·판정은 업무 보조 자료이며, 최종 판단은 학업성적관리위원회 심의와 학교장 결정에 따릅니다.</li>
        </ul>
      </section>
      <section className="card">
        <h2>3. 서비스 변경과 중단</h2>
        <p>학교 업무와 관련 지침이 바뀌면 기능과 기준값이 바뀔 수 있습니다. 점검이나 장애로 잠시 중단될 수 있습니다.</p>
      </section>
      <section className="card">
        <h2>4. 문의</h2>
        <p>학교 최소 성취수준 보장지도 담당 교사에게 문의합니다.</p>
      </section>
    </article>
  );
}
