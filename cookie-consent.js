(function(){
  var STORE      = 'motiv_consent';
  var CHAT_STORE = 'motiv_chat_consent';
  var GHL_SRC    = 'https://widgets.leadconnectorhq.com/loader.js';
  var GHL_RES    = 'https://widgets.leadconnectorhq.com/chat-widget/loader.js';
  var GHL_ID     = '69aebb41d72daa22e5a8e193';
  var ELF_SRC    = 'https://elfsightcdn.com/platform.js';

  /* ── Chat consent overlay ── */
  function showChatConsent(onAccept) {
    if (document.getElementById('lb-chat-consent')) return;

    var style = document.createElement('style');
    style.textContent =
      '#lb-chat-consent{position:fixed;bottom:80px;right:20px;z-index:2147483647;' +
      'background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.22);' +
      'padding:22px 20px 18px;max-width:300px;font-family:"Inter",sans-serif;' +
      'animation:lb-slide-up .3s cubic-bezier(.16,1,.3,1) both;}' +
      '@keyframes lb-slide-up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}' +
      '#lb-chat-consent h3{margin:0 0 8px;font-size:14px;color:#1a1a1a;font-weight:700;line-height:1.3;}' +
      '#lb-chat-consent p{margin:0 0 14px;font-size:12px;color:#555;line-height:1.65;}' +
      '#lb-chat-consent a{color:#c8a06a;text-decoration:none;}' +
      '#lb-chat-consent a:hover{text-decoration:underline;}' +
      '#lb-chat-btn-start{width:100%;padding:11px;background:#c8a06a;color:#fff;' +
      'border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;' +
      'font-family:"Inter",sans-serif;letter-spacing:.02em;}' +
      '#lb-chat-btn-start:hover{background:#d4b07a;}' +
      '#lb-chat-close{position:absolute;top:10px;right:12px;background:none;border:none;' +
      'font-size:18px;color:#aaa;cursor:pointer;line-height:1;padding:2px 6px;}' +
      '#lb-chat-close:hover{color:#555;}';
    document.head.appendChild(style);

    var el = document.createElement('div');
    el.id = 'lb-chat-consent';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.innerHTML =
      '<button id="lb-chat-close" aria-label="Schließen">&times;</button>' +
      '<h3>Datenschutzhinweis</h3>' +
      '<p>Dieser Chat wird zur Bearbeitung Ihrer Anfrage aufgezeichnet und gespeichert. ' +
      'Mit dem Starten des Chats stimmen Sie unserer ' +
      '<a href="datenschutz.html">Datenschutzerklärung</a> zu.</p>' +
      '<button id="lb-chat-btn-start">Chat starten</button>';
    document.body.appendChild(el);

    function dismiss() {
      el.style.animation = 'lb-slide-up .2s cubic-bezier(.16,1,.3,1) reverse';
      setTimeout(function(){ el.remove(); style.remove(); }, 200);
    }

    document.getElementById('lb-chat-close').addEventListener('click', dismiss);

    document.getElementById('lb-chat-btn-start').addEventListener('click', function(){
      localStorage.setItem(CHAT_STORE, 'accepted');
      dismiss();
      onAccept();
    });
  }

  /* ── Open the GHL chat widget ── */
  function openChat(cw) {
    try {
      var btn = cw.shadowRoot && cw.shadowRoot.querySelector('#lc_text-widget--btn');
      if (btn) btn.click();
    } catch(e) {}
  }

  /* ── Intercept first click on <chat-widget>, show consent if needed ── */
  function setupChatConsent(cw) {
    document.addEventListener('click', function handler(e) {
      var path = e.composedPath ? e.composedPath() : [e.target];
      var inWidget = path.indexOf(cw) !== -1;
      if (!inWidget) return;

      if (localStorage.getItem(CHAT_STORE) === 'accepted') return; // already consented

      e.stopImmediatePropagation();
      e.preventDefault();

      showChatConsent(function(){ openChat(cw); });
    }, true);
  }

  /* ── Auto-open chat on desktop (only if chat consent already given) ── */
  function autoOpenChat(){
    if (window.innerWidth < 768) return;
    if (localStorage.getItem(CHAT_STORE) !== 'accepted') return;

    var tries = 0;
    var t = setInterval(function(){
      var cw = document.querySelector('chat-widget');
      if(!cw){ if(++tries < 40) return; clearInterval(t); return; }
      clearInterval(t);
      function doClick(){
        try{
          var btn = cw.shadowRoot && cw.shadowRoot.querySelector('#lc_text-widget--btn');
          if(btn) btn.click();
        }catch(e){}
      }
      if(typeof cw.componentOnReady === 'function'){
        cw.componentOnReady().then(function(){ setTimeout(doClick, 1500); });
      } else {
        setTimeout(doClick, 3000);
      }
    }, 500);
  }

  /* ── Wait for chat-widget element and wire up consent interception ── */
  function waitForWidget(){
    var tries = 0;
    var t = setInterval(function(){
      var cw = document.querySelector('chat-widget');
      if(!cw){ if(++tries < 60) return; clearInterval(t); return; }
      clearInterval(t);
      setupChatConsent(cw);
    }, 500);
  }

  function loadGHL(){
    var s = document.createElement('script');
    s.src = GHL_SRC;
    s.setAttribute('data-resources-url', GHL_RES);
    s.setAttribute('data-widget-id', GHL_ID);
    s.onload = function(){ autoOpenChat(); waitForWidget(); };
    document.body.appendChild(s);
  }

  function loadElfsight(){
    if(!document.querySelector('.elfsight-app-8dcd1c23-64ae-44e6-9440-1bb2eb86b9e8')) return;
    var s = document.createElement('script');
    s.src = ELF_SRC;
    s.async = true;
    document.head.appendChild(s);
  }

  function loadAll(){ loadGHL(); loadElfsight(); }

  function hideBanner(){
    var b = document.getElementById('mc-banner');
    if(b){ b.style.transform = 'translateY(120%)'; setTimeout(function(){ b.remove(); }, 400); }
  }

  function showBanner(){
    var css = [
      '#mc-banner{position:fixed;bottom:0;left:0;right:0;z-index:99999;',
      'background:rgba(8,10,16,.97);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);',
      'border-top:1px solid rgba(200,160,106,.22);padding:18px 5vw;',
      'display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;',
      'transform:translateY(100%);transition:transform .45s cubic-bezier(.16,1,.3,1);}',
      '#mc-banner.mc-show{transform:translateY(0)}',
      '#mc-txt{color:rgba(245,240,232,.65);font-family:"Inter",sans-serif;font-size:12px;',
      'line-height:1.6;letter-spacing:.04em;flex:1;min-width:200px}',
      '#mc-txt a{color:rgba(200,160,106,.8);text-decoration:none}',
      '#mc-txt a:hover{color:#c8a06a}',
      '#mc-btns{display:flex;gap:10px;flex-shrink:0}',
      '#mc-accept,#mc-reject{font-family:"Inter",sans-serif;font-size:10px;font-weight:400;',
      'letter-spacing:.16em;text-transform:uppercase;padding:10px 22px;border-radius:100px;',
      'cursor:pointer;transition:background .25s,border-color .25s,color .25s;white-space:nowrap}',
      '#mc-accept{background:#c8a06a;border:1px solid #c8a06a;color:#08080a}',
      '#mc-accept:hover{background:#d4b07a;border-color:#d4b07a}',
      '#mc-reject{background:transparent;border:1px solid rgba(245,240,232,.2);color:rgba(245,240,232,.55)}',
      '#mc-reject:hover{border-color:rgba(245,240,232,.45);color:rgba(245,240,232,.85)}',
      '@media(max-width:600px){#mc-banner{flex-direction:column;align-items:flex-start}',
      '#mc-btns{width:100%}#mc-accept,#mc-reject{flex:1;text-align:center}}'
    ].join('');

    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var banner = document.createElement('div');
    banner.id = 'mc-banner';
    banner.innerHTML =
      '<div id="mc-txt">Wir verwenden Cookies für Analyse, Marketing (Google Analytics, Google Ads), Chat und Bewertungen.' +
      ' <a href="datenschutz.html">Datenschutzerklärung</a></div>' +
      '<div id="mc-btns">' +
        '<button id="mc-reject">Ablehnen</button>' +
        '<button id="mc-accept">Akzeptieren</button>' +
      '</div>';

    document.body.appendChild(banner);
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ banner.classList.add('mc-show'); });
    });

    document.getElementById('mc-accept').addEventListener('click', function(){
      localStorage.setItem(STORE, 'accepted');
      if(typeof gtag === 'function'){
        gtag('consent','update',{
          ad_storage:'granted',
          analytics_storage:'granted',
          ad_user_data:'granted',
          ad_personalization:'granted'
        });
      }
      loadAll();
      hideBanner();
    });
    document.getElementById('mc-reject').addEventListener('click', function(){
      localStorage.setItem(STORE, 'rejected');
      hideBanner();
    });
  }

  var consent = localStorage.getItem(STORE);
  if(consent === 'accepted'){ loadAll(); return; }
  if(consent === 'rejected'){ return; }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', showBanner);
  } else {
    showBanner();
  }
})();
