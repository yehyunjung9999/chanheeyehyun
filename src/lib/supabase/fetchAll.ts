// Supabase는 한 번에 1000행까지만 준다. 그보다 많을 수 있는 표는 이 함수로 나눠서 모두 읽는다.
// 사용: const rows = await fetchAll<Score>((from, to) => supabase.from('scores').select('*').order('id').range(from, to));
export async function fetchAll<T>(
  build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  pageSize = 1000,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await build(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < pageSize) break;
  }
  return rows;
}
