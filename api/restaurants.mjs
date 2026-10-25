const origins=new Set(['https://riderstool.com','https://www.riderstool.com']);
const clean=v=>String(v||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
export default async function restaurants(req,res){
  const origin=req.headers.origin;
  if(origin&&!origins.has(origin)){res.status(403).json({code:'ORIGIN_NOT_ALLOWED'});return;}
  if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');}
  res.setHeader('Cache-Control','no-store');
  if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Methods','GET, OPTIONS');res.status(204).end();return;}
  if(req.method!=='GET'){res.status(405).json({code:'METHOD_NOT_ALLOWED'});return;}
  const query=String(req.query.query||'').trim(),sort=String(req.query.sort||'random');
  if(query.length<2||query.length>80||!['random','comment'].includes(sort)){res.status(400).json({code:'INVALID_QUERY'});return;}
  const id=process.env.NAVER_CLIENT_ID,secret=process.env.NAVER_CLIENT_SECRET;
  if(!id||!secret){res.status(503).json({code:'NOT_CONFIGURED'});return;}
  try{
    const legacy=process.env.NAVER_API_MODE==='legacy';
    const base=legacy?'https://openapi.naver.com/v1/search/local.json':'https://naverapihub.apigw.ntruss.com/search/v1/local';
    const auth=legacy?{'X-Naver-Client-Id':id,'X-Naver-Client-Secret':secret}:{'X-NCP-APIGW-API-KEY-ID':id,'X-NCP-APIGW-API-KEY':secret};
    const url=base+'?'+new URLSearchParams({query,display:'5',start:'1',sort});
    const response=await fetch(url,{headers:auth,signal:AbortSignal.timeout(10000)});
    if(!response.ok){res.status(502).json({code:'UPSTREAM_ERROR'});return;}
    const data=await response.json();if(!Array.isArray(data.items))throw new Error('Invalid result');
    res.status(200).json({items:data.items.map(i=>({name:clean(i.title),category:clean(i.category),address:clean(i.roadAddress||i.address),phone:clean(i.telephone)})),source:'네이버 지역 검색',sort});
  }catch{res.status(502).json({code:'UPSTREAM_ERROR'});}
}
