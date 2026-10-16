'use client';

// 파트 0 소유. 엑셀·CSV·붙여넣기 표를 읽고, 엑셀 파일로 내려받는 도우미(브라우저 전용).

export type Table = string[][];

function cellText(value: unknown): string {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'object') {
    const v = value as { result?: unknown; text?: unknown; richText?: { text: string }[] };
    if (v.richText) return v.richText.map((r) => r.text).join('').trim();
    if ('result' in v) return String(v.result ?? '').trim();
    if ('text' in v) return String(v.text ?? '').trim();
  }
  return String(value).trim();
}

// 엑셀에서 복사한 표(탭 구분)나 CSV(쉼표 구분) 글을 표로 바꾼다.
export function parseDelimited(text: string): Table {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
  const sep = lines.some((line) => line.includes('\t')) ? '\t' : ',';
  return lines.map((line) => line.split(sep).map((cell) => cell.trim().replace(/^"(.*)"$/, '$1')));
}

// .xlsx 또는 .csv 파일의 첫 번째 시트를 표로 읽는다.
export async function readTableFile(file: File): Promise<Table> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.csv') || name.endsWith('.txt')) return parseDelimited(await file.text());
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];
  const rows: Table = [];
  sheet.eachRow({ includeEmpty: false }, (row) => {
    const values = Array.isArray(row.values) ? row.values.slice(1) : [];
    rows.push(values.map(cellText));
  });
  return rows;
}

// 첫 줄에 제목(예: 학번)이 있으면 빼고 돌려준다.
export function withoutHeader(table: Table, headerWord = '학번'): Table {
  if (table.length && table[0].some((cell) => cell.includes(headerWord))) return table.slice(1);
  return table;
}

export async function downloadWorkbook(
  filename: string,
  sheets: { name: string; rows: (string | number | null)[][] }[],
) {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  for (const s of sheets) {
    const sheet = workbook.addWorksheet(s.name);
    s.rows.forEach((r) => sheet.addRow(r));
    sheet.getRow(1).font = { bold: true };
    sheet.columns.forEach((col) => {
      col.width = 16;
    });
  }
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
