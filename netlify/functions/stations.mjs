import proj4 from 'proj4';
// Korean KATEC / EPSG:5178. Opinet's aroundAll coordinates use this CRS.
export const KATEC = '+proj=tmerc +lat_0=38 +lon_0=128 +k=0.9999 +x_0=400000 +y_0=600000 +ellps=bessel +towgs84=-146.43,507.89,681.46,0,0,0,0 +units=m +no_defs';
export function parseQuery(query={}) {
  const lat=Number(query.lat),lon=Number(query.lon),radius=Number(query.radius),fuel=query.fuel,sort=query.sort;
  if(!query.lat || !query.lon || !Number.isFinite(lat)||!Number.isFinite(lon)||lat<32||lat>40||lon<123||lon>133 || ![1000,3000,5000].includes(radius)||!['B027','D047','K015','B034'].includes(fuel)||!['price','distance'].includes(sort))return null;
  return {lat,lon,radius,fuel,sort};
}
export function normalize(items, radius) {
  return items.map(s=>{
    let lat=null,lon=null;
    if(Number(s.GIS_X_COOR)>0&&Number(s.GIS_Y_COOR)>0){[lon,lat]=proj4(KATEC,'EPSG:4326',[Number(s.GIS_X_COOR),Number(s.GIS_Y_COOR)]);}
    return {id:String(s.UNI_ID||''),name:String(s.OS_NM||'주유소'),brand:String(s.POLL_DIV_CD||s.POLL_DIV_CO||''),price:Number(s.PRICE),distance:Number(s.DISTANCE),lat,lon};
  }).filter(s=>s.price>0&&Number.isFinite(s.price)&&Number.isFinite(s.distance)&&s.distance>=0&&s.distance<=radius);
}
export const handler = async event => {
  const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'};
  const reply=(statusCode,body)=>({statusCode,headers,body:JSON.stringify(body)});
  if(event.httpMethod!=='GET')return reply(405,{code:'METHOD_NOT_ALLOWED'});
  const q=parseQuery(event.queryStringParameters);
  if(!q)return reply(400,{code:'INVALID_QUERY'});
  const key=process.env.OPINET_API_KEY;
  if(!key)return reply(503,{code:'NOT_CONFIGURED'});
  const [x,y]=proj4('EPSG:4326',KATEC,[q.lon,q.lat]);
  const params=new URLSearchParams({certkey:key,out:'json',x:String(x),y:String(y),radius:String(q.radius),prodcd:q.fuel,sort:q.sort==='price'?'1':'2'});
  try{
    const response=await fetch('https://www.opinet.co.kr/api/aroundAll.do?'+params,{signal:AbortSignal.timeout(10000)});
    if(!response.ok)return reply(502,{code:'UPSTREAM_ERROR'});
    const data=await response.json(), rows=data?.RESULT?.OIL;
    if(!Array.isArray(rows))return reply(502,{code:'UPSTREAM_ERROR'});
    const stations=normalize(rows,q.radius);
    stations.sort((a,b)=>q.sort==='price'?a.price-b.price||a.distance-b.distance:a.distance-b.distance||a.price-b.price);
    return reply(200,{stations,upstreamCount:rows.length,sample:rows.slice(0,1),fetchedAt:new Date().toISOString(),source:'한국석유공사 오피넷'});
  }catch{return reply(502,{code:'UPSTREAM_ERROR'});}
};
