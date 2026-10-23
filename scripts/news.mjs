// Google 뉴스 RSS → news.json (data 브랜치에 올려 정적 파일로 제공)
import { writeFileSync } from 'node:fs';
const Q = 'hl=ko&gl=KR&ceid=KR:ko', GN = 'https://news.google.com/rss';
const FEEDS = {
  top: `${GN}?${Q}`,
  rider: `${GN}/search?q=${encodeURIComponent('배달 라이더 OR 배달기사 OR 이륜차 OR 배달 플랫폼 OR 배달앱 수수료 OR 오토바이 단속 when:7d')}&${Q}`,
  biz: `${GN}/headlines/section/topic/BUSINESS?${Q}`,
  nation: `${GN}/headlines/section/topic/NATION?${Q}`,
  sports: `${GN}/headlines/section/topic/SPORTS?${Q}`,
  ent: `${GN}/headlines/section/topic/ENTERTAINMENT?${Q}`,
  tech: `${GN}/headlines/section/topic/TECHNOLOGY?${Q}`,
  world: `${GN}/headlines/section/topic/WORLD?${Q}`,
};
const un = s => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&').trim();
const tag = (x, t) => { const m = x.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`)); return m ? un(m[1]) : ''; };
export function parse(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 15).map(m => {
    let t = tag(m[1], 'title'), s = tag(m[1], 'source'); const k = t.lastIndexOf(' - ');
    if (k > 0) { if (!s) s = t.slice(k + 3); t = t.slice(0, k); }
    const d = Date.parse(tag(m[1], 'pubDate'));
    return { t, s, l: tag(m[1], 'link'), d: d || 0 };
  }).filter(i => i.t && /^https?:\/\//.test(i.l));
}
if (process.argv[1] && process.argv[1].endsWith('news.mjs')) {
  const c = {}; let ok = 0;
  await Promise.all(Object.entries(FEEDS).map(async ([k, u]) => {
    try { const r = await fetch(u, { headers: { 'user-agent': 'Mozilla/5.0' } }); if (!r.ok) throw r.status; c[k] = parse(await r.text()); if (c[k].length) ok++; }
    catch (e) { console.error(k, 'fail', e); c[k] = []; }
  }));
  if (!ok) { console.error('all feeds failed'); process.exit(1); }
  writeFileSync('news.json', JSON.stringify({ ts: Date.now(), c }));
  console.log('ok', Object.fromEntries(Object.entries(c).map(([k, v]) => [k, v.length])));
}
