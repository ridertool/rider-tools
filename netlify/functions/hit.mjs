// 방문자 수: 오늘/전체 숫자만 저장합니다 (개인 식별 정보 없음).
// ?count=1 이면 1 올리고, 아니면 현재 숫자만 돌려줍니다.
import { getStore } from '@netlify/blobs';

export default async (req) => {
  const headers = { 'content-type': 'application/json', 'cache-control': 'no-store' };
  try {
    const store = getStore('visits');
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
    const data = (await store.get('stats', { type: 'json' })) || { total: 0, day: today, today: 0 };
    if (data.day !== today) { data.day = today; data.today = 0; }
    if (new URL(req.url).searchParams.get('count') === '1') {
      data.total += 1; data.today += 1;
      await store.setJSON('stats', data);
    }
    return new Response(JSON.stringify({ ok: true, today: data.today, total: data.total }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false }), { headers, status: 200 });
  }
};

export const config = { path: '/api/hit' };
