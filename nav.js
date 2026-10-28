(function(){
  var me=document.currentScript,root=me?me.src.replace(/nav\.js.*$/,''):'/';
  var p=location.pathname.replace(/\/index\.html$/,'/'),rel=p.replace(/^\/+/,'');
  var T=[['홈','',function(){return rel===''}, 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'],
         ['주유소','#fuel',function(){return false},'M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M5 21h10M15 9h2a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V9l-3-3M8 8h4'],
         ['맛집','menu/',function(){return rel.indexOf('menu/')===0},'M7 3v8a2 2 0 0 0 2 2v8M11 3v8M15 3c2.5 1.2 3.5 4 3.5 8H15v10'],
         ['뉴스','news/',function(){return rel.indexOf('news/')===0},'M4 5h12v14H6a2 2 0 0 1-2-2zM16 9h3a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2M7 9h6M7 13h6'],
         ['꿀팁','tips/',function(){return rel.indexOf('tips/')===0},'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z']];
  var st=document.createElement('style');
  st.textContent='.btab{display:none}@media(max-width:699px){body{padding-bottom:calc(66px + env(safe-area-inset-bottom,0px))!important}.btab{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:60;background:rgba(255,255,255,.97);border-top:1px solid #e3e8ec;padding-bottom:env(safe-area-inset-bottom,0px)}.btab a{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;min-height:60px;text-decoration:none;color:#697972;font-size:12px;font-weight:600}.btab a[aria-current=page]{color:#0b4a43}.btab svg{width:24px;height:24px}}';
  document.head.appendChild(st);
  var n=document.createElement('nav');n.className='btab';n.setAttribute('aria-label','하단 메뉴');
  T.forEach(function(t){var a=document.createElement('a');a.href=root+t[1];if(t[2]())a.setAttribute('aria-current','page');
    a.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+t[3]+'"/></svg><span>'+t[0]+'</span>';n.appendChild(a)});
  document.body.appendChild(n);
})();
