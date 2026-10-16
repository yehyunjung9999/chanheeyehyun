'use client';

// 파트 0 소유. 명렬표(학번 → 이름)는 이 브라우저에만 저장하고 서버로 보내지 않는다(PRD 13.1).
export type Roster = Record<string, string>;

const key = (schoolYear: number) => `roster:${schoolYear}`;
export const ROSTER_EVENT = 'roster-change';

export function loadRoster(schoolYear: number): Roster {
  try {
    const raw = window.localStorage.getItem(key(schoolYear));
    return raw ? (JSON.parse(raw) as Roster) : {};
  } catch {
    return {};
  }
}

export function saveRoster(schoolYear: number, roster: Roster) {
  try {
    window.localStorage.setItem(key(schoolYear), JSON.stringify(roster));
  } catch {
    // 저장 불가(사생활 보호 모드 등). 이번 화면에서만 쓴다.
  }
  window.dispatchEvent(new Event(ROSTER_EVENT));
}

export function clearRoster(schoolYear: number) {
  try {
    window.localStorage.removeItem(key(schoolYear));
  } catch {
    // 무시
  }
  window.dispatchEvent(new Event(ROSTER_EVENT));
}

// 표에서 학번·이름 열을 찾아 명렬표를 만든다. 제목 줄이 없으면 1열=학번, 2열=이름으로 본다.
export function rosterFromTable(table: string[][]): Roster {
  if (!table.length) return {};
  const header = table[0];
  let noCol = header.findIndex((c) => c.includes('학번'));
  let nameCol = header.findIndex((c) => c.includes('이름') || c.includes('성명'));
  let body = table;
  if (noCol >= 0 && nameCol >= 0) body = table.slice(1);
  else {
    noCol = 0;
    nameCol = 1;
  }
  const roster: Roster = {};
  for (const row of body) {
    const no = (row[noCol] ?? '').replace(/\D/g, '');
    const name = (row[nameCol] ?? '').trim();
    if (/^\d{5}$/.test(no) && name) roster[no] = name;
  }
  return roster;
}
