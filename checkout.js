(function () {
  'use strict';

  // Regras e prêmios: carrega do Supabase quando disponível, com fallback local.
  // A chave do cliente é o telefone (nome pode se repetir).
  let RULES = [
    { maxValue: 50, points: 2 },
    { maxValue: 100, points: 5 },
    { maxValue: 200, points: 12 },
    { maxValue: 350, points: 22 },
    { maxValue: 500, points: 35 },
    { maxValue: 750, points: 55 },
    { maxValue: 1000, points: 80 }
  ].sort((a, b) => a.maxValue - b.maxValue);

  let PRIZES = [
    { description: 'Frete grátis (serviço)', points: 500 },
    { description: 'Desconto de R$ 20,00', points: 800 },
    { description: 'Brinde especial', points: 1200 }
  ].sort((a, b) => a.points - b.points);

  const loadSupabaseConfig = async () => {
    if (!sb) return;
    try {
      // Prefer secure RPC (works with hardened RLS)
      if (STORE_ID) {
        const { data, error } = await sb.rpc('get_checkout_store', { p_store_id: STORE_ID });
        if (!error && data && !data.error) {
          if (data.store) { STORE = data.store; applyStoreBranding(STORE); }
          if (Array.isArray(data.rules) && data.rules.length) {
            RULES = data.rules
              .filter((r) => r.active !== false)
              .map((r) => ({ maxValue: Number(r.max_value), points: Number(r.points), description: r.description || '' }))
              .sort((a, b) => a.maxValue - b.maxValue);
          }
          if (Array.isArray(data.prizes) && data.prizes.length) {
            PRIZES = data.prizes
              .filter((p) => p.active !== false)
              .map((p) => ({ description: p.description, points: Number(p.points), comment: p.comment || '' }))
              .sort((a, b) => a.points - b.points);
          }
          return true;
        }
      }

      // Legacy fallback (before security migration)
      let rulesQ = sb.from('rules').select('max_value, points, description, active').order('max_value', { ascending: true });
      let prizesQ = sb.from('prizes').select('description, points, comment, start_date, end_date, active').order('points', { ascending: true });
      if (STORE_ID) { rulesQ = rulesQ.eq('store_id', STORE_ID); prizesQ = prizesQ.eq('store_id', STORE_ID); }
      const [rulesRes, prizesRes] = await Promise.all([rulesQ, prizesQ]);
      if (!rulesRes.error && Array.isArray(rulesRes.data) && rulesRes.data.length) {
        RULES = rulesRes.data
          .filter((r) => r.active !== false)
          .map((r) => ({ maxValue: Number(r.max_value), points: Number(r.points), description: r.description || '' }))
          .sort((a, b) => a.maxValue - b.maxValue);
      }
      if (!prizesRes.error && Array.isArray(prizesRes.data) && prizesRes.data.length) {
        PRIZES = prizesRes.data
          .filter((p) => p.active !== false)
          .map((p) => ({ description: p.description, points: Number(p.points), comment: p.comment || '' }))
          .sort((a, b) => a.points - b.points);
      }
      return false;
    } catch (err) {
      /* fallback local */
      return false;
    }
  };

  const sb = window.senfySupabase || null;
  const STORE_ID = new URLSearchParams(window.location.search).get('store') || localStorage.getItem('senfy:active-store-id') || null;
  const STORAGE_PREFIX = `senfy:cliente:${STORE_ID || 'default'}:`;

  const $ = (id) => document.getElementById(id);
  const form = $('checkout-form');
  const nameInput = $('checkout-name');
  const phoneInput = $('checkout-phone');
  const valueInput = $('checkout-value');
  const preview = $('checkout-preview');
  const errorBox = $('checkout-error');
  const resultCard = $('checkout-result');
  const headTitle = document.querySelector('.checkout-head h1');
  const headText = document.querySelector('.checkout-head p');
  let STORE = null;

  const applyStoreBranding = (store) => {
    if (!store) return;
    const name = store.nome_loja || 'Senfy';
    document.querySelectorAll('.brand-name').forEach((el) => { el.textContent = name; });
    document.title = `Registrar compra — ${name}`;
    if (headTitle) headTitle.textContent = 'Registre sua compra';
    if (headText) headText.textContent = `Informe seus dados para receber pontos em ${name}.`;
    if (store.logo_url) {
      document.querySelectorAll('.brand-logo').forEach((img) => { img.src = store.logo_url; img.alt = name; img.removeAttribute('aria-hidden'); });
    }
    if (store.cor_primaria) {
      document.documentElement.style.setProperty('--primary', store.cor_primaria);
      document.documentElement.style.setProperty('--green-500', store.cor_primaria);
    }
  };

  const loadStore = async () => {
    if (!sb || !STORE_ID) return null;
    try {
      // Prefer secure RPC
      const { data, error } = await sb.rpc('get_checkout_store', { p_store_id: STORE_ID });
      if (!error && data && !data.error && data.store) {
        STORE = data.store;
        applyStoreBranding(STORE);
        return STORE;
      }
      // Legacy fallback
      const { data: legacy, error: legacyErr } = await sb.from('stores').select('id, nome_loja, cor_primaria, logo_url, tipo_programa, ativo').eq('id', STORE_ID).eq('ativo', true).maybeSingle();
      if (legacyErr) throw legacyErr;
      STORE = legacy || null;
      if (STORE) applyStoreBranding(STORE);
      return STORE;
    } catch (err) {
      console.error('loadStore', err);
      return null;
    }
  };

  const nameParticles = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
  const formatName = (value) => String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part, index) => {
      const lower = part.toLowerCase();
      if (index > 0 && nameParticles.has(lower)) return lower;
      return lower.replace(/(^|['’-])([a-zà-ÿ])/g, (_, prefix, letter) => prefix + letter.toUpperCase());
    })
    .join(' ');

  const onlyDigits = (value) => String(value || '').replace(/\D/g, '');
  const formatPhone = (value) => {
    const d = onlyDigits(value).slice(0, 11);
    if (!d) return '';
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };
  const findRule = (amount) => RULES.find((rule) => amount <= rule.maxValue) || null;

  const readClient = (key) => {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  };

  const saveClient = (key, client) => {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(client));
    } catch (err) {
      /* armazenamento indisponível: segue com os dados em memória */
    }
  };

  const showError = (message) => {
    if (!errorBox) return;
    errorBox.textContent = message;
    errorBox.hidden = !message;
  };

  if (nameInput) {
    nameInput.addEventListener('blur', () => { nameInput.value = formatName(nameInput.value); });
  }
  if (phoneInput) {
    phoneInput.addEventListener('input', () => { phoneInput.value = formatPhone(phoneInput.value); });
  }
  if (valueInput) {
    valueInput.addEventListener('input', () => {
      const amount = parseFloat(valueInput.value);
      const rule = Number.isFinite(amount) && amount > 0 ? findRule(amount) : null;
      if (preview) preview.textContent = rule ? `${rule.points} pts` : '0 pts';
      showError('');
    });
  }

  let activeClient = null;
  let activeKey = null;
  let activePrize = null;

  const showActions = (ready) => {
    $('normal-actions').classList.toggle('hidden', ready);
    $('prize-actions').classList.toggle('hidden', !ready);
    $('prize-ready').classList.toggle('hidden', !ready);
  };

  const reset = () => {
    if (headTitle) headTitle.classList.remove('hidden');
    if (headText) headText.classList.remove('hidden');
    form.classList.remove('hidden');
    resultCard.classList.add('hidden');
    $('checkout-redeemed').classList.add('hidden');
    $('checkout-done').classList.add('hidden');
    const fill = $('progress-fill');
    fill.style.transition = 'none';
    fill.style.width = '0%';
    void fill.offsetWidth;
    fill.style.transition = '';
    showActions(false);
    activeClient = null;
    activeKey = null;
    activePrize = null;
    form.reset();
    if (preview) preview.textContent = '0 pts';
    showError('');
    if (nameInput) nameInput.focus();
  };

  const finish = () => {
    if (headTitle) headTitle.classList.add('hidden');
    if (headText) headText.classList.add('hidden');
    form.classList.add('hidden');
    resultCard.classList.add('hidden');
    $('checkout-redeemed').classList.add('hidden');
    $('checkout-done').classList.remove('hidden');
  };

  $('checkout-understood').addEventListener('click', finish);
  $('redeem-done').addEventListener('click', finish);
  $('checkout-keep').addEventListener('click', reset);

  const upsertCustomerAndSale = async ({ name, phone, phoneDigits, amount, pointsEarned }) => {
    if (!sb) return { client: null, error: null };
    try {
      // Prefer secure RPC (server-side validation + points calculation)
      if (STORE_ID) {
        const { data, error } = await sb.rpc('register_checkout_purchase', {
          p_store_id: STORE_ID,
          p_name: name,
          p_phone: phoneDigits,
          p_value: amount
        });
        if (!error && data?.ok && data.customer) {
          return {
            client: {
              id: data.customer.id,
              name: data.customer.name,
              phone: formatPhone(data.customer.phone || phoneDigits),
              points: Number(data.customer.points || 0),
              purchases: Number(data.customer.purchases || 0),
              redemptions: Number(data.customer.redemptions || 0)
            },
            error: null,
            pointsEarned: Number(data.points_earned ?? pointsEarned)
          };
        }
        if (error || data?.error) {
          console.warn('checkout RPC failed, trying legacy', error || data?.error);
        }
      }

      // Legacy fallback (before security migration)
      let findQ = sb.from('customers').select('*').eq('phone', phone);
      if (STORE_ID) findQ = findQ.eq('store_id', STORE_ID);
      const { data: existing, error: findErr } = await findQ.maybeSingle();
      if (findErr) throw findErr;

      const base = existing || { name, phone, points: 0, redemptions: 0, purchases: 0 };
      const payload = {
        name,
        phone,
        points: Number(base.points || 0) + pointsEarned,
        redemptions: Number(base.redemptions || 0),
        purchases: Number(base.purchases || 0) + 1,
        updated_at: new Date().toISOString(),
        ...(STORE_ID ? { store_id: STORE_ID } : {})
      };

      const onConflict = STORE_ID ? 'store_id,phone' : 'phone';
      const { data: customer, error: upsertErr } = await sb
        .from('customers')
        .upsert(payload, { onConflict })
        .select('*')
        .single();
      if (upsertErr) throw upsertErr;

      const { error: saleErr } = await sb.from('sales').insert({
        store_id: STORE_ID || null,
        customer_id: customer.id,
        customer_name: name,
        customer_phone: phone,
        value: amount,
        points: pointsEarned,
        purchased_at: new Date().toISOString()
      });
      if (saleErr) throw saleErr;

      if (STORE_ID) {
        try {
          const tipoRegistro = STORE?.tipo_programa === 'pontos' ? 'ponto' : 'stamp';
          await sb.from('vendas_fidelidade').insert({
            store_id: STORE_ID,
            nome_cliente: name,
            telefone_cliente: phoneDigits,
            valor_venda: amount,
            tipo_registro: tipoRegistro,
            resgatado: false
          });
        } catch (err) { /* não bloqueia fluxo MVP */ }
      }

      return {
        client: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          points: Number(customer.points || 0),
          purchases: Number(customer.purchases || 0),
          redemptions: Number(customer.redemptions || 0)
        },
        error: null
      };
    } catch (error) {
      return { client: null, error };
    }
  };

  $('checkout-redeem').addEventListener('click', async () => {
    if (!activeClient || !activePrize || !activeKey) return;
    const prizePoints = Number(activePrize.points || 0);
    let redeemedOk = false;

    if (sb && STORE_ID) {
      try {
        const { data, error } = await sb.rpc('register_checkout_redeem', {
          p_store_id: STORE_ID,
          p_phone: activeKey,
          p_prize_points: prizePoints
        });
        if (!error && data?.ok && data.customer) {
          activeClient = { ...activeClient, ...data.customer, phone: formatPhone(data.customer.phone || activeKey) };
          redeemedOk = true;
        } else {
          console.warn('redeem RPC failed, trying legacy', error || data?.error);
        }
      } catch (err) { console.warn('redeem RPC error', err); }
    }

    if (!redeemedOk) {
      activeClient.points = Math.max(0, Number(activeClient.points) - prizePoints);
      activeClient.redemptions = Number(activeClient.redemptions || 0) + 1;
      activeClient.updatedAt = new Date().toISOString();
      if (sb && activeClient.id) {
        try {
          let q = sb.from('customers').update({ points: activeClient.points, redemptions: activeClient.redemptions }).eq('id', activeClient.id);
          if (STORE_ID) q = q.eq('store_id', STORE_ID);
          await q;
        } catch (err) { /* mantém estado local */ }
      } else if (sb && activeClient.phone) {
        try {
          let q = sb.from('customers').update({ points: activeClient.points, redemptions: activeClient.redemptions }).eq('phone', activeClient.phone);
          if (STORE_ID) q = q.eq('store_id', STORE_ID);
          await q;
        } catch (err) { /* mantém estado local */ }
      }
    }

    saveClient(activeKey, activeClient);
    const code = 'SNFY-' + activeKey.slice(-4) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    $('redeemed-prize').textContent = activePrize.description;
    $('redeem-code').textContent = code;
    resultCard.classList.add('hidden');
    $('checkout-redeemed').classList.remove('hidden');
    $('redeem-done').focus();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = formatName(nameInput.value);
    const phoneDigits = onlyDigits(phoneInput.value);
    const amount = parseFloat(valueInput.value);
    const rule = findRule(amount);

    if (!name || name.length < 2 || name.length > 120) return showError('Informe um nome válido.');
    if (phoneDigits.length < 10 || phoneDigits.length > 11) return showError('Informe um telefone válido com DDD.');
    if (!Number.isFinite(amount) || amount <= 0 || amount > 999999) return showError('Informe um valor de compra válido.');
    if (!rule) return showError('Não há regra de pontos para esse valor.');

    const key = phoneDigits;
    const phone = formatPhone(phoneDigits);
    let client = readClient(key) || { name, phone, points: 0, purchases: 0, redemptions: 0 };

    let earnedPoints = rule.points;
    if (sb) {
      const remote = await upsertCustomerAndSale({ name, phone, phoneDigits, amount, pointsEarned: rule.points });
      if (remote.client) {
        client = { ...client, ...remote.client };
        if (Number.isFinite(Number(remote.pointsEarned))) earnedPoints = Number(remote.pointsEarned);
      } else {
        client.name = name;
        client.phone = phone;
        client.points = Number(client.points || 0) + rule.points;
        client.purchases = Number(client.purchases || 0) + 1;
        client.updatedAt = new Date().toISOString();
      }
    } else {
      client.name = name;
      client.phone = phone;
      client.points = Number(client.points) + rule.points;
      client.purchases = Number(client.purchases) + 1;
      client.updatedAt = new Date().toISOString();
    }
    saveClient(key, client);

    const achieved = PRIZES.filter((prize) => client.points >= prize.points);
    const targetPrize = achieved.length ? achieved[achieved.length - 1] : PRIZES[0];
    const reached = achieved.length > 0;
    const goal = targetPrize.points;
    const progress = reached ? 100 : Math.min(100, Math.round((client.points / goal) * 100));
    const remaining = reached ? 0 : Math.max(0, goal - client.points);

    $('result-client').textContent = `Obrigado, ${client.name}!`;
    $('result-earned').textContent = String(earnedPoints);
    $('result-total').textContent = String(client.points);
    $('result-prize').textContent = reached ? targetPrize.description : `Próximo: ${targetPrize.description}`;
    $('result-missing').textContent = reached ? 'Disponível!' : `${remaining} pts`;
    $('progress-current').textContent = `${client.points} pts`;
    $('progress-goal').textContent = `${goal} pts`;
    $('progress-track').setAttribute('aria-valuenow', String(progress));
    showActions(reached);

    activeClient = client;
    activeKey = key;
    activePrize = targetPrize;

    const fill = $('progress-fill');
    requestAnimationFrame(() => { fill.style.width = progress + '%'; });

    form.classList.add('hidden');
    resultCard.classList.remove('hidden');
    if (reached) $('checkout-redeem').focus();
    else $('checkout-understood').focus();
  });

  (async () => {
    await loadStore();
    if (STORE_ID && !STORE) {
      showError('Loja não encontrada ou inativa. Verifique o QR Code.');
      form.querySelectorAll('input,button').forEach((el) => { el.disabled = true; });
      return;
    }
    await loadSupabaseConfig();
  })();
})();
