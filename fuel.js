(() => {
  const $ = id => document.getElementById(id);
  const status = $('fuel-status'), results = $('fuel-results'), locate = $('fuel-locate');
  let coords = null, stations = [], sort = 'distance', controller = null, request = 0;
  const brand = {SKE:'SK에너지',GSC:'GS칼텍스',HDO:'현대오일뱅크',SOL:'S-OIL',RTE:'알뜰',RTX:'고속도로 알뜰',NHO:'농협알뜰',E1G:'E1',SKG:'SK가스'};
  const state = (message, error = false) => { status.textContent = message; status.classList.toggle('error',error); status.hidden = false; };
  const node = (tag, cls, text) => { const n = document.createElement(tag); if(cls)n.className=cls; if(text!=null)n.textContent=text;return n; };
  function render() {
    results.replaceChildren();
    const sorted = [...stations].sort((a,b) => sort === 'price' ? a.price-b.price || a.distance-b.distance : a.distance-b.distance || a.price-b.price);
    for(const s of sorted) {
      const item=node('li','station'), top=node('div','station-top'), info=node('div'), price=node('div','station-price',s.price.toLocaleString('ko-KR'));
      info.append(node('h3','',s.name),node('div','station-meta',`${brand[s.brand]||'주유소'} · ${s.distance<1000?Math.round(s.distance)+' m':(s.distance/1000).toFixed(1)+' km'}`));
      price.append(node('small','',' 원/L'));top.append(info,price);item.append(top);
      const a=node('a','','지도·길찾기 ↗');
      a.href=Number.isFinite(s.lat)&&Number.isFinite(s.lon)?`https://map.kakao.com/link/to/${encodeURIComponent(s.name)},${s.lat},${s.lon}`:`https://map.kakao.com/?q=${encodeURIComponent(s.name)}`;
      a.target='_blank';a.rel='noopener noreferrer';item.append(a);results.append(item);
    }
  }
  async function search() {
    if(!coords)return;
    const own=++request;
    controller?.abort();controller=new AbortController();
    stations=[];render();$('fuel-summary').hidden=true;locate.disabled=true;
    state('주변 주유소를 확인하고 있어요…');
    try {
      const endpoint=window.SITE_CONFIG?.fuelApiUrl || '/.netlify/functions/stations';
      const url=new URL(endpoint,location.origin);
      url.search=new URLSearchParams({lat:coords.lat,lon:coords.lon,fuel:$('fuel-type').value,radius:$('fuel-radius').value,sort});
      const r=await fetch(url,{signal:controller.signal,cache:'no-store'});
      if(!r.headers.get('content-type')?.includes('application/json'))throw new Error('NOT_CONFIGURED');
      const data=await r.json();
      if(!r.ok)throw new Error(data.code || 'UPSTREAM_ERROR');
      if(own!==request)return;
      stations=(data.stations||[]).filter(s=>Number.isFinite(s.price)&&s.price>0&&Number.isFinite(s.distance)&&s.distance>=0&&s.distance<=Number($('fuel-radius').value));
      render();state(stations.length?'조회한 가격은 현장 가격과 다를 수 있어요.':'선택한 반경에 판매 가격이 확인되는 주유소가 없어요. 반경을 넓혀보세요.');
      if(stations.length){$('fuel-summary').textContent=`${stations.length}곳 · 조회 ${new Date(data.fetchedAt).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})} · 가격 갱신 시각은 주유소별로 다릅니다`;$('fuel-summary').hidden=false;}
    } catch(e) {
      if(own!==request || e.name==='AbortError')return;
      const setup=['NOT_CONFIGURED','NOT_FOUND'].includes(e.message);
      state(setup?'실시간 유가 서비스 연결을 준비 중이에요. 아래 지도나 오피넷에서 주변 주유소를 확인해주세요.':'주유소 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.',true);
    } finally {if(own===request)locate.disabled=false;}
  }
  locate.addEventListener('click',()=>{
    if(!navigator.geolocation){state('이 브라우저는 위치 조회를 지원하지 않아요. 아래 지도에서 검색해주세요.',true);return;}
    locate.disabled=true;state('위치 권한을 허용하면 내 주변 주유소를 찾을 수 있어요.');
    navigator.geolocation.getCurrentPosition(p=>{coords={lat:p.coords.latitude,lon:p.coords.longitude};search();},e=>{locate.disabled=false;state(e.code===1?'위치 권한이 꺼져 있어요. 브라우저에서 허용하거나 아래 지도로 검색해주세요.':'현재 위치를 확인하지 못했어요. 다시 시도하거나 아래 지도로 검색해주세요.',true);},{timeout:10000,maximumAge:60000,enableHighAccuracy:false});
  });
  for(const select of [$('fuel-type'),$('fuel-radius')])select.addEventListener('change',search);
  document.querySelectorAll('[data-sort]').forEach(button=>button.addEventListener('click',()=>{
    sort=button.dataset.sort;document.querySelectorAll('[data-sort]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    if(stations.length)render();
  }));
})();
