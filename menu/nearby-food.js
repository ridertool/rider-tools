(()=>{
const $=id=>document.getElementById(id),status=$('food-status'),list=$('food-results'),submit=$('food-submit');let controller=null;
const locate=$('food-locate');
locate.addEventListener('click',()=>{
if(!navigator.geolocation){status.textContent='위치를 사용할 수 없어요. 동네 이름을 입력해주세요.';return;}
locate.disabled=true;submit.disabled=true;status.textContent='현재 위치를 확인하고 있어요…';
const done=()=>{locate.disabled=false;submit.disabled=false;};
navigator.geolocation.getCurrentPosition(async p=>{
try{
const lat=String(Math.round(p.coords.latitude*1000)/1000),lon=String(Math.round(p.coords.longitude*1000)/1000);
status.textContent='현재 동네를 확인하고 있어요…';
const r=await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?'+new URLSearchParams({latitude:lat,longitude:lon,localityLanguage:'ko'}),{signal:AbortSignal.timeout(10000),cache:'no-store',referrerPolicy:'no-referrer'});
if(!r.ok)throw new Error();
const d=await r.json();
if(d.countryCode&&d.countryCode!=='KR'){status.textContent='국내 맛집만 검색할 수 있어요. 국내 동네 이름을 입력해주세요.';return;}
const area=[...new Set([d.principalSubdivision,d.city,d.locality].filter(Boolean))].join(' ');
if(!area)throw new Error();
$('food-area').value=area;done();$('food-search').requestSubmit();
}catch{status.textContent='동네를 확인하지 못했어요. 다시 시도하거나 동네 이름을 입력해주세요.';}finally{done();}
},e=>{done();status.textContent=e.code===1?'브라우저에서 위치를 허용하거나 동네 이름을 입력해주세요.':'위치를 확인하지 못했어요. 다시 시도하거나 동네 이름을 입력해주세요.';},{enableHighAccuracy:true,timeout:12000,maximumAge:0});
});
const el=(tag,text)=>{const n=document.createElement(tag);n.textContent=text;return n;};
$('food-search').addEventListener('submit',async e=>{
e.preventDefault();const area=$('food-area').value.trim();if(!area){status.textContent='동네나 역 이름을 입력해주세요.';return;}
const type=document.querySelector('.cat[aria-pressed="true"] b')?.textContent||'';const query=area+' '+(type==='아무거나'?'맛집':type+' 맛집');
controller?.abort();controller=new AbortController();list.replaceChildren();submit.disabled=true;status.textContent='네이버에서 주변 식당을 찾고 있어요…';
try{const r=await fetch('https://rider-tools-api.vercel.app/api/restaurants?'+new URLSearchParams({query,sort:$('food-sort').value}),{signal:controller.signal,cache:'no-store'});const d=await r.json();if(!r.ok)throw new Error(d.code||'ERROR');
for(const [index,item]of(d.items||[]).entries()){const li=document.createElement('li');li.append(el('h3',(index+1)+'. '+item.name),el('p',item.category),el('p',item.address));if(item.phone)li.append(el('p',item.phone));const a=el('a','네이버지도·길찾기 ↗');a.href='https://map.naver.com/p/search/'+encodeURIComponent(item.address+' '+item.name);a.target='_blank';a.rel='noopener noreferrer';li.append(a);list.append(li);}
status.textContent=d.items?.length?area+' 주변 검색 결과 '+d.items.length+'곳':'검색되는 식당이 없어요. 다른 동네나 역 이름을 입력해주세요.';
}catch(error){if(error.name!=='AbortError')status.textContent=error.message==='NOT_CONFIGURED'?'네이버 검색 연결을 설정 중이에요. 잠시 후 다시 시도해주세요.':'맛집 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.';}finally{submit.disabled=false;}
});})();
