// 1) Load Google’s script
  (function () {
    var s = document.createElement('script');
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(s);
  })();

  // 2) Init into our hidden container
  function googleTranslateElementInit() {
    new google.translate.TranslateElement({
      pageLanguage: 'en',
      includedLanguages: 'en,fr',
      autoDisplay: false
    }, 'google_translate_container');
  }

  // 3) Robust cookie setter (current host + bare domain)
  function setGoogTrans(val) {
    var d = new Date(); d.setTime(d.getTime() + 365*24*60*60*1000);
    var exp = ';expires=' + d.toUTCString() + ';path=/';
    document.cookie = 'googtrans=' + val + exp; // current host
    try {
      var baseDomain = location.hostname.replace(/^www\./, '');
      document.cookie = 'googtrans=' + val + exp + ';domain=' + baseDomain;
    } catch (e) {}
  }

  // 4) Click handler: set cookie then reload
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-lang]');
    if (!btn) return;
    const to = btn.getAttribute('data-lang'); // 'en' or 'fr'
    setGoogTrans('/en/' + to);
    location.reload(); // cookie makes Google auto-translate on load
  });