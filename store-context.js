(() => {
  const sb = window.senfySupabase;
  const STORE_KEY = 'senfy:active-store-id';

  const redirectLogin = () => {
    if (!/login\.html$/.test(location.pathname)) location.href = 'login.html';
  };

  const setStoreUI = (store) => {
    const nameEl = document.querySelector('.sidebar-user-name');
    const planEl = document.querySelector('.sidebar-footer .small.muted');
    const avatarEl = document.querySelector('.sidebar-footer .avatar');
    if (nameEl) nameEl.textContent = store.nome_loja || 'Minha loja';
    if (planEl) planEl.textContent = store.ativo ? 'Plano ativo' : 'Loja inativa';
    if (avatarEl) {
      const parts = String(store.nome_loja || 'LJ').trim().split(/\s+/).filter(Boolean);
      avatarEl.textContent = ((parts[0]?.[0] || 'L') + (parts[1]?.[0] || parts[0]?.[1] || 'J')).toUpperCase();
    }
    if (store.cor_primaria) {
      const color = store.cor_primaria;
      const root = document.documentElement.style;
      root.setProperty('--primary', color);
      root.setProperty('--green-500', color);
      root.setProperty('--green-700', color);
      root.setProperty('--side-bg', `color-mix(in oklab, ${color} 18%, #07110d)`);
      root.setProperty('--side-surface', `color-mix(in oklab, ${color} 32%, #0c1a14)`);
      root.setProperty('--side-surface-hover', `color-mix(in oklab, ${color} 46%, #10261d)`);
      root.setProperty('--side-border', color);
      root.setProperty('--side-text', '#e8f1e9');
    }
    // Logo da loja não substitui a marca Senfy no menu/topbar.
    document.body.dataset.storeId = store.id;
  };

  async function load() {
    if (!sb) { redirectLogin(); return null; }
    const { data: sessionData } = await sb.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) { redirectLogin(); return null; }

    let storeId = localStorage.getItem(STORE_KEY);
    let store = null;
    if (storeId) {
      const { data } = await sb.from('stores').select('*').eq('id', storeId).maybeSingle();
      if (data && data.owner_id === user.id) store = data;
    }
    if (!store) {
      const { data } = await sb
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .order('criado_em', { ascending: true })
        .limit(1)
        .maybeSingle();
      store = data || null;
      if (store?.id) localStorage.setItem(STORE_KEY, store.id);
    }
    if (!store) { redirectLogin(); return null; }
    setStoreUI(store);
    return store;
  }

  const ready = load().catch((err) => {
    console.error('store-context', err);
    redirectLogin();
    return null;
  });

  window.SenfyStore = {
    ready,
    get id() { return localStorage.getItem(STORE_KEY); },
    async get() { return await ready; }
  };

  const bindUI = async () => {
    const store = await ready;
    if (!store) return;
    const qrBtn = document.getElementById('store-qr-btn');
    const logoutBtn = document.getElementById('store-logout-btn');
    const dialog = document.getElementById('store-qr-dialog');
    const closeBtn = document.getElementById('store-qr-close');
    const qrBox = document.getElementById('store-qr-code');
    const urlInput = document.getElementById('store-qr-url');
    const copyBtn = document.getElementById('store-qr-copy');
    const openLink = document.getElementById('store-qr-open');

    const checkoutUrl = new URL('checkout.html', window.location.href);
    checkoutUrl.searchParams.set('store', store.id);
    const url = checkoutUrl.toString();

    const openQr = () => {
      if (!dialog) return;
      if (qrBox && qrBox.childElementCount === 0 && window.QRCode) {
        new window.QRCode(qrBox, { text: url, width: 220, height: 220, correctLevel: window.QRCode.CorrectLevel.M });
      }
      if (urlInput) urlInput.value = url;
      if (openLink) openLink.href = url;
      const subtitle = document.getElementById('store-qr-subtitle');
      if (subtitle) {
        subtitle.textContent = location.protocol === 'file:'
          ? 'Atenção: link file:// não abre no celular. Rode um servidor local (http://localhost) ou publique o app para usar o QR Code.'
          : 'O cliente escaneia para registrar a compra e receber pontos.';
      }
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    };

    qrBtn?.addEventListener('click', openQr);
    closeBtn?.addEventListener('click', () => dialog?.close());
    dialog?.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    copyBtn?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(url);
        copyBtn.textContent = 'Copiado!';
        setTimeout(() => { copyBtn.textContent = 'Copiar link'; }, 1500);
      } catch (_) {
        urlInput?.select();
        document.execCommand('copy');
      }
    });

    logoutBtn?.addEventListener('click', async () => {
      try { await sb.auth.signOut(); } catch (_) {}
      localStorage.removeItem(STORE_KEY);
      window.location.href = 'login.html';
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindUI);
  else bindUI();
})();
