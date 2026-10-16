'use client';
import { useRef } from 'react';
import { readTableFile } from '@/lib/excel';
import { clearRoster, rosterFromTable, saveRoster } from '@/lib/roster';
import { useRoster } from './RosterProvider';
import { useToast } from './ToastProvider';

// 파트 0 소유. 명렬표(학번·이름 엑셀)를 이 컴퓨터에만 불러온다. 서버로 보내지 않는다.
export function RosterButton() {
  const { schoolYear, roster } = useRoster();
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const count = Object.keys(roster).length;

  async function onFile(file: File | undefined) {
    if (!file) return;
    try {
      const map = rosterFromTable(await readTableFile(file));
      const n = Object.keys(map).length;
      if (!n) {
        toast('학번과 이름 열을 찾지 못했어요. 첫 줄에 "학번", "이름"이 있는 엑셀을 골라 주세요.', 'error');
        return;
      }
      saveRoster(schoolYear, map);
      toast(`명렬표 ${n}명을 이 컴퓨터에만 불러왔어요. 서버로 보내지 않아요.`);
    } catch {
      toast('파일을 읽지 못했어요. .xlsx 또는 .csv 파일인지 확인해 주세요.', 'error');
    } finally {
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div className="row">
      <input ref={input} type="file" accept=".xlsx,.csv" hidden onChange={(e) => onFile(e.target.files?.[0])} aria-label="명렬표 파일" />
      <button type="button" className={`toggle${count ? ' on' : ''}`} onClick={() => input.current?.click()}>
        {count ? `명렬표 불러옴(이 컴퓨터에만) · ${count}명` : '명렬표 불러오기'}
      </button>
      {count ? (
        <button
          type="button"
          className="btn small"
          onClick={() => {
            clearRoster(schoolYear);
            toast('이 컴퓨터에서 명렬표를 지웠어요. 학번만 보여요.');
          }}
        >
          지우기
        </button>
      ) : null}
    </div>
  );
}
