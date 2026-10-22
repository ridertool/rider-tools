// 광고 자리 채우기: <div class="ad-slot" data-size="banner|box"></div>
// 우선순위: 애드센스 → 애드핏 → 쿠팡파트너스. 설정이 없으면 자리를 숨김.
(function () {
  var C = window.SITE_CONFIG || {};
  var slots = [].slice.call(document.querySelectorAll('.ad-slot'));
  if (!slots.length) return;

  function load(src, attrs) {
    var s = document.createElement('script');
    s.async = true; s.src = src;
    if (attrs) for (var k in attrs) s.setAttribute(k, attrs[k]);
    document.head.appendChild(s);
    return s;
  }

  var hasSense = C.adsense && C.adsense.client && C.adsense.slot;
  var hasFit = C.adfit && (C.adfit.banner || C.adfit.box);
  var hasCoupang = C.coupang && C.coupang.id && C.coupang.trackingCode;
  var senseLoaded = false, fitLoaded = false, coupangN = 0;

  var fitN = 0;
  function notice() {
    if (document.querySelector('.ad-notice')) return;
    var n = document.createElement('p');
    n.className = 'ad-notice';
    n.textContent = '이 사이트는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.';
    document.body.appendChild(n);
  }
  function coupangInto(el, size) {
    if (!el.querySelector('.ad-label')) { var l = document.createElement('div'); l.className = 'ad-label'; l.textContent = '광고'; el.appendChild(l); }
    var box = document.createElement('div'); box.id = 'cp-ad-' + (coupangN++);
    var h = size === 'box' ? 250 : 100;
    el.appendChild(box);
    var run = function () {
      try { new window.PartnersCoupang.G({ id: Number(C.coupang.id), template: 'carousel', trackingCode: C.coupang.trackingCode, width: String(Math.min(680, Math.max(300, el.clientWidth || 320))), height: String(h), tsource: '', container: box }); } catch (e) {}
    };
    if (window.PartnersCoupang) run();
    else if (coupangLoading) coupangQueue.push(run);
    else { coupangLoading = true; coupangQueue.push(run); var s = load('https://ads-partners.coupang.com/g.js'); s.addEventListener('load', function () { coupangQueue.splice(0).forEach(function (f) { f(); }); }); }
    notice();
  }
  var coupangLoading = false, coupangQueue = [];

  slots.forEach(function (el) {
    var size = el.getAttribute('data-size') || 'banner';
    var label = document.createElement('div');
    label.className = 'ad-label'; label.textContent = '광고';

    if (hasSense) {
      if (!senseLoaded) { load('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + C.adsense.client, { crossorigin: 'anonymous' }); senseLoaded = true; }
      var ins = document.createElement('ins');
      ins.className = 'adsbygoogle'; ins.style.display = 'block';
      ins.setAttribute('data-ad-client', C.adsense.client);
      ins.setAttribute('data-ad-slot', C.adsense.slot);
      ins.setAttribute('data-ad-format', 'auto');
      ins.setAttribute('data-full-width-responsive', 'true');
      el.append(label, ins);
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      return;
    }
    // 애드핏은 해당 크기의 광고단위가 있을 때만. 광고가 안 들어오면(심사 중·재고 없음) 쿠팡 배너로 대신 채움
    var unit = hasFit && (size === 'box' ? C.adfit.box : C.adfit.banner);
    if (unit) {
      var isBox = size === 'box';
      var a = document.createElement('ins');
      a.className = 'kakao_ad_area'; a.style.display = 'none';
      a.setAttribute('data-ad-unit', unit);
      a.setAttribute('data-ad-width', isBox ? '300' : '320');
      a.setAttribute('data-ad-height', isBox ? '250' : '100');
      var done = false;
      var fail = function () {
        if (done) return; done = true;
        if (a.parentNode) a.parentNode.removeChild(a);
        if (hasCoupang) coupangInto(el, size); else el.hidden = true;
      };
      var fn = '__adfitFail' + (fitN++);
      window[fn] = fail;
      a.setAttribute('data-ad-onfail', fn);
      el.append(label, a);
      // 콜백이 오지 않는 경우(스크립트 차단 등)를 대비해 6초 뒤에도 비어 있으면 대체
      setTimeout(function () { if (!done && !a.querySelector('iframe')) fail(); else done = true; }, 6000);
      if (!fitLoaded) { load('https://t1.kakaocdn.net/kas/static/ba.min.js'); fitLoaded = true; }
      return;
    }
    if (hasCoupang) { el.append(label); coupangInto(el, size); return; }
    el.hidden = true;
  });

})();
