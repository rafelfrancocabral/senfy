(() => {
  const sb = window.senfySupabase;
  const $ = (id) => document.getElementById(id);
  const feedback = $('setup-feedback');
  const colorBtns = Array.from(document.querySelectorAll('.setup-color'));
  const logoInput = $('setup-logo-input');
  const logoImg = $('setup-logo-img');
  const logoFallback = $('setup-logo-fallback');
  const logoRemove = $('setup-logo-remove');
  const logoStatus = $('setup-logo-status');
  const posterLayout = $('setup-poster-layout');
  const poster = $('qr-poster');
  const posterBrand = $('qr-poster-brand');
  const posterLogo = $('qr-poster-logo');
  const posterUrl = $('qr-poster-url');
  const posterQr = $('qr-poster-code');
  const saveBtn = $('setup-save');
  const printBtn = $('setup-poster-print');
  if (!saveBtn || !poster) return;

  let store = null;
  let selectedColor = '#2F7D5B';
  let selectedDark = '#4FB67F';
  let logoUrl = '';
  let logoFile = null;
  let removeLogo = false;

  const setFeedback = (msg = '', type = '') => {
    if (!feedback) return;
    feedback.textContent = msg;
    feedback.className = 'auth-feedback' + (type ? ' is-' + type : '');
  };

  const applyColor = (color, dark) => {
    selectedColor = color;
    selectedDark = dark || color;
    const root = document.documentElement.style;
    root.setProperty('--primary', color);
    root.setProperty('--green-500', color);
    root.setProperty('--green-700', color);
    root.setProperty('--store-primary-dark', selectedDark);
    // Sidebar palette derived from chosen color
    root.setProperty('--side-bg', `color-mix(in oklab, ${color} 18%, #07110d)`);
    root.setProperty('--side-surface', `color-mix(in oklab, ${color} 32%, #0c1a14)`);
    root.setProperty('--side-surface-hover', `color-mix(in oklab, ${color} 46%, #10261d)`);
    root.setProperty('--side-border', color);
    root.setProperty('--side-text', '#e8f1e9');
    colorBtns.forEach((btn) => {
      const on = btn.dataset.color?.toLowerCase() === color.toLowerCase();
      btn.classList.toggle('is-selected', on);
      btn.setAttribute('aria-pressed', String(on));
    });
    if (posterBrand) posterBrand.style.color = color;
  };

  const setLogoPreview = (url) => {
    logoUrl = url || '';
    const show = !!logoUrl;
    if (logoImg) { logoImg.src = logoUrl; logoImg.hidden = !show; }
    if (logoFallback) logoFallback.hidden = show;
    if (posterLogo) { posterLogo.src = logoUrl; posterLogo.hidden = !show; }
  };

  const renderPosterQr = () => {
    if (!posterQr) return;
    posterQr.innerHTML = '';
    const id = store?.id || window.SenfyStore?.id;
    const url = new URL('checkout.html', window.location.href);
    if (id) url.searchParams.set('store', id);
    const text = url.toString();
    if (posterUrl) posterUrl.textContent = text;
    if (window.QRCode) new window.QRCode(posterQr, { text, width: 180, height: 180, correctLevel: window.QRCode.CorrectLevel.M });
  };

  const storageKey = () => `senfy:setup:${store?.id || window.SenfyStore?.id || 'default'}`;
  const saveLocal = () => { try { localStorage.setItem(storageKey(), JSON.stringify({ posterLayout: posterLayout?.value || 'clean' })); } catch (_) {} };
  const loadLocal = () => { try { return JSON.parse(localStorage.getItem(storageKey()) || '{}'); } catch (_) { return {}; } };

  const applyPosterLayout = () => {
    const v = posterLayout?.value || 'clean';
    poster.classList.toggle('layout-clean', v === 'clean');
    poster.classList.toggle('layout-bold', v === 'bold');
  };

  colorBtns.forEach((btn) => btn.addEventListener('click', () => applyColor(btn.dataset.color, btn.dataset.dark)));
  posterLayout?.addEventListener('change', () => { applyPosterLayout(); saveLocal(); });

  logoInput?.addEventListener('change', () => {
    const file = logoInput.files?.[0];
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      setFeedback('Formato inválido. Use PNG, JPG, WEBP ou SVG.', 'error');
      logoInput.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFeedback('Imagem muito grande. Limite de 2 MB.', 'error');
      logoInput.value = '';
      return;
    }
    logoFile = file;
    removeLogo = false;
    setLogoPreview(URL.createObjectURL(file));
    if (logoStatus) logoStatus.textContent = file.name;
    setFeedback('');
  });

  logoRemove?.addEventListener('click', () => {
    logoFile = null;
    removeLogo = true;
    if (logoInput) logoInput.value = '';
    setLogoPreview('');
    if (logoStatus) logoStatus.textContent = 'Logotipo removido (salve para aplicar).';
  });

  printBtn?.addEventListener('click', () => {
    const c = selectedColor || '#2F7D5B';
    const bold = poster.classList.contains('layout-bold');
    const bg = bold
      ? `linear-gradient(180deg, color-mix(in oklab, ${c} 10%, #fff) 0%, #fff 28%, #fff 100%)`
      : '#fff';
    const logoHidden = posterLogo?.hidden ? '.qr-poster-logo{display:none}' : '';
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Cartaz QR - ${store?.nome_loja || 'Loja'}</title>
      <style>
      @page{size:A4;margin:0}
      *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
      body{margin:0;display:grid;place-items:center;min-height:100vh;background:#f3f4f6;font-family:Manrope,Arial,sans-serif}
      .qr-poster{position:relative;overflow:hidden;width:210mm;height:297mm;box-sizing:border-box;background:${bg};color:#102018;padding:30mm 20mm 18mm;display:flex;flex-direction:column;align-items:center;text-align:center;gap:18px}
      .qr-poster::before{content:"";position:absolute;left:0;right:0;top:0;height:${bold ? '16mm' : '12mm'};background:linear-gradient(90deg,color-mix(in oklab,${c} 85%,#000),${c},color-mix(in oklab,${c} 65%,#fff))}
      .qr-poster-logo{width:104px;height:104px;object-fit:contain}${logoHidden}
      .qr-poster-brand{margin:0;font-weight:800;font-size:16px;letter-spacing:.08em;text-transform:uppercase;color:${c};background:color-mix(in oklab,${c} 10%,#fff);padding:10px 18px;border-radius:999px}
      h4{margin:0;font-size:54px;line-height:1.06;letter-spacing:-.04em;color:#101a15;max-width:170mm} p{margin:0}
      .sub{font-size:22px;line-height:1.35;color:#4b5b54;max-width:150mm;margin:0 auto;text-align:center}
      .qr{background:#fff;padding:18px;border:3px solid color-mix(in oklab,${c} 30%,#dbe5df);border-radius:24px;margin-top:auto;box-shadow:0 12px 32px color-mix(in oklab,${c} 22%, transparent)}
      .qr img,.qr canvas{width:320px!important;height:320px!important;display:block}
      .noapp{margin:0 auto;font-size:20px;font-weight:800;line-height:1.3;color:color-mix(in oklab,${c} 80%,#1a2b24);background:color-mix(in oklab,${c} 10%,#fff);padding:14px 20px;border-radius:14px;text-align:center;max-width:155mm}
      .url{font-size:12px;color:#5f6f68;word-break:break-all;max-width:100%}
      .foot{margin-top:auto;font-size:14px;font-weight:700;color:#5f6f68}
      </style></head><body>
      <div class="qr-poster"><img class="qr-poster-logo" src="${posterLogo?.src || ''}" alt="">
      <p class="qr-poster-brand">${store?.nome_loja || 'Minha loja'}</p>
      <h4>Ganhe pontos a cada compra</h4>
      <p class="sub">Apontou, ganhou! Acompanhe seus pontos e resgate seus prêmios por aqui.</p>
      <div class="qr" id="qr"></div>
      <p class="noapp">Não precisa baixar aplicativo. Funciona direto no seu celular!</p>
      <p class="url">${posterUrl?.textContent || ''}</p>
      <p class="foot">Programa de fidelidade Senfy</p></div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
      <script>new QRCode(document.getElementById('qr'),{text:${JSON.stringify(posterUrl?.textContent || '')},width:320,height:320,correctLevel:QRCode.CorrectLevel.M});setTimeout(()=>{window.print()},350);<\/script>
      </body></html>`;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
  });

  const uploadLogo = async (file, ownerId) => {
    const ext = (file.name.split('.').pop() || 'png').toLowerCase();
    const path = `${ownerId}/logo-${Date.now()}.${ext}`;
    const { error } = await sb.storage.from('store-logos').upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw error;
    const { data } = sb.storage.from('store-logos').getPublicUrl(path);
    return data.publicUrl;
  };

  saveBtn.addEventListener('click', async () => {
    if (!sb || !store) { setFeedback('Loja não carregada.', 'error'); return; }
    saveBtn.disabled = true;
    setFeedback('Salvando...', '');
    try {
      let newLogoUrl = logoUrl;
      if (removeLogo) newLogoUrl = '';
      if (logoFile) {
        const { data: sess } = await sb.auth.getSession();
        const user = sess?.session?.user;
        if (!user) throw new Error('Sessão expirada. Faça login novamente.');
        newLogoUrl = await uploadLogo(logoFile, user.id);
      }
      const payload = { cor_primaria: selectedColor, logo_url: newLogoUrl || null };
      const { data, error } = await sb.from('stores').update(payload).eq('id', store.id).eq('owner_id', (await sb.auth.getUser()).data.user?.id).select('*').single();
      if (error) throw error;
      store = data;
      logoFile = null; removeLogo = false;
      setLogoPreview(store.logo_url || '');
      applyStoreBrandingLocal(store);
      setFeedback('Setup salvo com sucesso.', 'success');
    } catch (err) {
      console.error(err);
      setFeedback(err.message || 'Erro ao salvar setup.', 'error');
    } finally {
      saveBtn.disabled = false;
    }
  });

  const applyStoreBrandingLocal = (s) => {
    if (posterBrand) posterBrand.textContent = s.nome_loja || 'Minha loja';
    const nameEl = document.querySelector('.sidebar-user-name');
    if (nameEl) nameEl.textContent = s.nome_loja || 'Minha loja';
    if (s.cor_primaria) {
      const preset = colorBtns.find((b) => b.dataset.color?.toLowerCase() === s.cor_primaria.toLowerCase());
      applyColor(s.cor_primaria, preset?.dataset.dark || s.cor_primaria);
    }
    setLogoPreview(s.logo_url || '');
    renderPosterQr();
  };

  (async () => {
    try {
      if (window.SenfyStore?.ready) store = await window.SenfyStore.ready;
      if (!store) return;
      const local = loadLocal();
      if (posterLayout && local.posterLayout) posterLayout.value = local.posterLayout;
      applyStoreBrandingLocal(store);
      applyPosterLayout();
    } catch (err) { console.error(err); }
  })();
})();