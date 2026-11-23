(function () {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');

  if (toggle && nav) {
    const closeMenu = () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
    };

    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (event) => {
      if (!nav.classList.contains('open')) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const backdrop = document.getElementById('sidebar-backdrop');

  if (sidebar && sidebarToggle) {
    const setSidebar = (open) => {
      sidebar.classList.toggle('open', open);
      sidebarToggle.setAttribute('aria-expanded', String(open));
      if (backdrop) backdrop.classList.toggle('show', open);
    };

    sidebarToggle.addEventListener('click', () => {
      setSidebar(!sidebar.classList.contains('open'));
    });

    if (backdrop) {
      backdrop.addEventListener('click', () => setSidebar(false));
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setSidebar(false);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) setSidebar(false);
    });
  }

  const navItems = Array.from(document.querySelectorAll('.nav-item[data-target]'));
  const panels = Array.from(document.querySelectorAll('.section-panel'));
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');

  const subtitles = {
    'resumo': 'Vendas e resgates do período.',
    'clientes': 'Pontos e resgates de cada cliente.',
    'vendas': 'Log de vendas com edição de valor e exclusão.',
    'regras': 'Faixas de valor e pontos concedidos.',
    'premios': 'Prêmios, prazos e pontos necessários.',
    'acao': 'Campanhas ativas e ideias para a base.'
  };

  if (navItems.length && panels.length) {
    const activate = (target) => {
      navItems.forEach((item) => {
        const active = item.dataset.target === target;
        item.classList.toggle('active', active);
        item.setAttribute('aria-current', active ? 'page' : 'false');
      });
      panels.forEach((panel) => {
        panel.classList.toggle('active', panel.id === target);
      });
      const activeItem = navItems.find((item) => item.dataset.target === target);
      if (pageTitle && activeItem) pageTitle.textContent = activeItem.textContent.trim();
      if (pageSubtitle) pageSubtitle.textContent = subtitles[target] || '';
      if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        if (sidebarToggle) sidebarToggle.setAttribute('aria-expanded', 'false');
        if (backdrop) backdrop.classList.remove('show');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    navItems.forEach((item) => {
      item.addEventListener('click', () => activate(item.dataset.target));
    });
  }

  const formatCurrency = (value) =>
    Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (value) => {
    if (!value) return '-';
    const parts = String(value).split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return value;
  };

  const formatDateTime = (value) => {
    if (!value) return '-';
    const [date, time = ''] = String(value).split('T');
    return `${formatDate(date)} ${time.slice(0, 5)}`.trim();
  };

  const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  // Nomes: iniciais sempre maiúsculas, preservando partículas e nomes com hífen/apóstrofo
  const nameParticles = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
  const formatCustomerName = (value) => String(value || '')
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
  window.Senfy = window.Senfy || {};
  window.Senfy.formatCustomerName = formatCustomerName;

  // Resumo: métricas e mapa de calor por período
  const periodLabels = {
    hoje: 'Hoje',
    '7d': '7 dias',
    '15d': '15 dias',
    '30d': '30 dias',
    '90d': '90 dias',
    '365d': '365 dias'
  };

  const overviewByPeriod = {
    hoje: {
      salesTotal: 1280,
      salesCount: 14,
      redemptions: [
        { name: 'Desconto R$ 20,00', redemptions: 2 },
        { name: 'Brinde especial', redemptions: 1 },
        { name: 'Frete grátis (serviço)', redemptions: 1 },
        { name: 'Café cortesia', redemptions: 3 },
        { name: 'Voucher R$ 50,00', redemptions: 0 }
      ]
    },
    '7d': {
      salesTotal: 8640,
      salesCount: 96,
      redemptions: [
        { name: 'Desconto R$ 20,00', redemptions: 8 },
        { name: 'Brinde especial', redemptions: 4 },
        { name: 'Frete grátis (serviço)', redemptions: 3 },
        { name: 'Café cortesia', redemptions: 9 },
        { name: 'Voucher R$ 50,00', redemptions: 2 }
      ]
    },
    '15d': {
      salesTotal: 17290,
      salesCount: 188,
      redemptions: [
        { name: 'Desconto R$ 20,00', redemptions: 14 },
        { name: 'Brinde especial', redemptions: 7 },
        { name: 'Frete grátis (serviço)', redemptions: 5 },
        { name: 'Café cortesia', redemptions: 12 },
        { name: 'Voucher R$ 50,00', redemptions: 3 }
      ]
    },
    '30d': {
      salesTotal: 35480,
      salesCount: 392,
      redemptions: [
        { name: 'Desconto R$ 20,00', redemptions: 24 },
        { name: 'Brinde especial', redemptions: 15 },
        { name: 'Frete grátis (serviço)', redemptions: 9 },
        { name: 'Café cortesia', redemptions: 18 },
        { name: 'Voucher R$ 50,00', redemptions: 6 }
      ]
    },
    '90d': {
      salesTotal: 102340,
      salesCount: 1128,
      redemptions: [
        { name: 'Desconto R$ 20,00', redemptions: 61 },
        { name: 'Brinde especial', redemptions: 38 },
        { name: 'Frete grátis (serviço)', redemptions: 22 },
        { name: 'Café cortesia', redemptions: 47 },
        { name: 'Voucher R$ 50,00', redemptions: 19 }
      ]
    },
    '365d': {
      salesTotal: 486920,
      salesCount: 5340,
      redemptions: [
        { name: 'Desconto R$ 20,00', redemptions: 214 },
        { name: 'Brinde especial', redemptions: 132 },
        { name: 'Frete grátis (serviço)', redemptions: 88 },
        { name: 'Café cortesia', redemptions: 175 },
        { name: 'Voucher R$ 50,00', redemptions: 64 }
      ]
    }
  };

  // Série ilustrativa de vendas por período (adaptada de resumo.html)
  const CHART_CFG = {
    hoje: { n: 12, lab: (i) => `${8 + i}h`, tot: 620 },
    '7d': { n: 7, lab: (i) => ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][i], tot: 4300 },
    '15d': { n: 15, lab: (i) => `${i + 1}`, tot: 9100 },
    '30d': { n: 30, lab: (i) => `${i + 1}`, tot: 18400 },
    '90d': { n: 13, lab: (i) => `S${i + 1}`, tot: 52000 },
    '365d': { n: 12, lab: (i) => ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i], tot: 210000 }
  };
  const chartRng = (seed) => {
    let value = seed;
    return () => (value = (value * 9301 + 49297) % 233280) / 233280;
  };
  const series = (period) => {
    const config = CHART_CFG[period] || CHART_CFG['30d'];
    const seed = Number(String(period).replace(/\D/g, '')) || 1;
    const random = chartRng(seed * 7 + 3);
    const raw = Array.from({ length: config.n }, (_, index) =>
      .55 + random() * .9 + Math.sin(index / config.n * Math.PI * 2) * .12 + index / config.n * .25
    );
    const factor = config.tot / raw.reduce((sum, value) => sum + value, 0);
    return raw.map((value) => Math.round(value * factor));
  };

  const heatmapDays = [
    { label: 'Seg', full: 'segunda-feira', values: [4, 6, 9, 12, 18, 22, 20, 16, 14, 11, 8, 5] },
    { label: 'Ter', full: 'terça-feira', values: [5, 7, 10, 14, 19, 24, 21, 17, 15, 12, 9, 6] },
    { label: 'Qua', full: 'quarta-feira', values: [5, 8, 11, 15, 20, 25, 23, 18, 16, 14, 10, 6] },
    { label: 'Qui', full: 'quinta-feira', values: [6, 9, 12, 16, 22, 26, 24, 20, 18, 15, 11, 7] },
    { label: 'Sex', full: 'sexta-feira', values: [7, 10, 14, 18, 24, 28, 25, 21, 19, 17, 13, 8] },
    { label: 'Sáb', full: 'sábado', values: [1, 5, 10, 14, 12, 6] }
  ];
  const heatmapHours = Array.from({ length: 12 }, (_, index) => index + 7);
  const heatmapScale = {
    hoje: 0.4, '7d': 0.6, '15d': 0.8, '30d': 1, '90d': 1.4, '365d': 2
  };

  const heatmapValues = (period) => {
    const scale = heatmapScale[period] || 1;
    const valueAt = (base) => Math.max(1, Math.round(base * scale));
    const matrix = heatmapDays.map((day) => {
      const range = day.full === 'sábado' ? { start: 8, end: 13 } : { start: 7, end: 18 };
      const values = heatmapHours.map((hour) =>
        hour < range.start || hour > range.end ? null : valueAt(day.values[hour - range.start])
      );
      return { day, range, values };
    });
    const max = Math.max(...matrix.flatMap((row) => row.values.filter((value) => value !== null)));
    const levelFor = (value) =>
      value <= max * 0.2 ? 0 :
      value <= max * 0.4 ? 1 :
      value <= max * 0.6 ? 2 :
      value <= max * 0.8 ? 3 : 4;
    let quietest = null;
    matrix.forEach((row) => row.values.forEach((value, index) => {
      if (value === null) return;
      if (!quietest || value < quietest.value) {
        quietest = { day: row.day.full, hour: heatmapHours[index], value };
      }
    }));
    return { days: heatmapDays, hours: heatmapHours, matrix, max, levelFor, quietest };
  };

  const heatmapEl = document.getElementById('heatmap');
  const heatmapNoteEl = document.getElementById('heatmap-note');
  const salesTotalEl = document.getElementById('stat-sales-total');
  const salesCountEl = document.getElementById('stat-sales-count');
  const salesTotalNoteEl = document.getElementById('stat-sales-total-note');
  const salesCountNoteEl = document.getElementById('stat-sales-count-note');
  const redemptionsTotalEl = document.getElementById('stat-redemptions-total');
  const redemptionsTotalNoteEl = document.getElementById('stat-redemptions-total-note');

  const renderHeatmap = (period) => {
    if (!heatmapEl) return;

    const data = heatmapValues(period);
    const rows = data.matrix.map((row) => {
      const cells = row.values.map((value, index) => {
        if (value === null) {
          return '<span class="heatmap-cell off" aria-hidden="true"></span>';
        }
        const hour = heatmapHours[index];
        const unit = value === 1 ? 'compra' : 'compras';
        const level = data.levelFor(value);
        return `<span class="heatmap-cell heat-${level}" title="${row.day.full} às ${hour}h: ${value} ${unit}" aria-label="${row.day.full} às ${hour}h: ${value} ${unit}">${value}</span>`;
      }).join('');
      return `<span class="heatmap-day">${row.day.label}</span>${cells}`;
    }).join('');

    const headers = heatmapHours.map((hour) => `<span class="heatmap-hour">${hour}h</span>`).join('');
    heatmapEl.innerHTML = `<span class="heatmap-corner"></span>${headers}${rows}`;

    if (heatmapNoteEl && data.quietest) {
      const unit = data.quietest.value === 1 ? 'compra' : 'compras';
      heatmapNoteEl.textContent = `Menor movimento: ${data.quietest.day}, ${data.quietest.hour}h (${data.quietest.value} ${unit}).`;
    }
  };

  const renderOverview = (period) => {
    const data = overviewByPeriod[period] || overviewByPeriod['30d'];
    const label = periodLabels[period] || period;
    const redemptions = data.redemptions.reduce((total, item) => total + item.redemptions, 0);

    if (salesTotalEl) salesTotalEl.textContent = formatCurrency(data.salesTotal);
    if (salesCountEl) salesCountEl.textContent = Number(data.salesCount).toLocaleString('pt-BR');
    if (salesTotalNoteEl) salesTotalNoteEl.textContent = `Soma das vendas no período (${label})`;
    if (salesCountNoteEl) salesCountNoteEl.textContent = `Compras no período (${label})`;
    if (redemptionsTotalEl) redemptionsTotalEl.textContent = Number(redemptions).toLocaleString('pt-BR');
    if (redemptionsTotalNoteEl) redemptionsTotalNoteEl.textContent = `Resgates no período (${label})`;

    renderHeatmap(period);
  };

  // Tabs de período (menu superior)
  const periodTabs = Array.from(document.querySelectorAll('.period-tab[data-period]'));
  if (periodTabs.length) {
    periodTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        periodTabs.forEach((item) => {
          const active = item === tab;
          item.classList.toggle('active', active);
          item.setAttribute('aria-selected', String(active));
        });
        renderOverview(tab.dataset.period);
        if (sidebar && sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
          if (sidebarToggle) sidebarToggle.setAttribute('aria-expanded', 'false');
          if (backdrop) backdrop.classList.remove('show');
        }
      });
    });
  }

  const initialPeriod = (periodTabs.find((t) => t.classList.contains('active')) || periodTabs[0] || {}).dataset?.period || 'hoje';
  renderOverview(initialPeriod);

  // Dados reutilizados pelos recursos extras do Resumo no dashboard
  window.Senfy.resumo = {
    periodLabels,
    overviewByPeriod,
    series,
    cfg: CHART_CFG,
    heatmapValues,
    heatmapDays,
    heatmapHours
  };

  // Regras de pontuação usadas no cálculo automático das vendas
  let rules = [
    { id: uid(), maxValue: 50, points: 2, description: 'Compras até R$ 50,00' },
    { id: uid(), maxValue: 100, points: 5, description: 'Compras até R$ 100,00' },
    { id: uid(), maxValue: 200, points: 12, description: 'Compras até R$ 200,00' },
    { id: uid(), maxValue: 350, points: 22, description: 'Compras até R$ 350,00' },
    { id: uid(), maxValue: 500, points: 35, description: 'Compras até R$ 500,00' },
    { id: uid(), maxValue: 750, points: 55, description: 'Compras até R$ 750,00' },
    { id: uid(), maxValue: 1000, points: 80, description: 'Compras até R$ 1.000,00' }
  ];
  let promoMultiplier = 1;

  const findRuleForValue = (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount < 0) return null;
    return [...rules]
      .sort((a, b) => Number(a.maxValue) - Number(b.maxValue))
      .find((rule) => amount <= Number(rule.maxValue)) || null;
  };

  const calculatePointsForValue = (value) => {
    const rule = findRuleForValue(value);
    return rule ? Math.round(Number(rule.points) * promoMultiplier) : 0;
  };

  // Vendas: log com edição de valor e exclusão
  const salesTableBody = document.getElementById('sales-table-body');
  const saleForm = document.getElementById('sale-form');
  const saleIdInput = document.getElementById('sale-id');
  const saleCustomerInput = document.getElementById('sale-customer');
  const saleDateInput = document.getElementById('sale-date');
  const saleValueInput = document.getElementById('sale-value');
  const salePointsInput = document.getElementById('sale-points');
  const saleFormTitle = document.getElementById('sale-form-title');
  const saleSubmit = document.getElementById('sale-submit');
  const saleCancel = document.getElementById('sale-cancel');
  const salePointsHint = document.getElementById('sale-points-hint');

  let sales = [
    { id: uid(), customer: 'Maria Silva', date: '2026-11-18T14:32', value: 128.5, points: 12 },
    { id: uid(), customer: 'João Pereira', date: '2026-11-18T11:05', value: 74.9, points: 5 },
    { id: uid(), customer: 'Ana Lima', date: '2026-11-17T16:20', value: 210, points: 22 },
    { id: uid(), customer: 'Carlos Mendes', date: '2026-11-17T09:48', value: 45, points: 2 },
    { id: uid(), customer: 'Fernanda Costa', date: '2026-11-16T13:15', value: 320, points: 22 }
  ];

  const updateSalePoints = () => {
    if (!salePointsInput) return;
    const value = parseFloat(saleValueInput.value);
    const rule = findRuleForValue(value);

    if (!rule) {
      salePointsInput.value = 0;
      if (salePointsHint) {
        salePointsHint.textContent = Number.isNaN(value)
          ? 'Informe o valor da compra para calcular os pontos.'
          : 'Sem regra para este valor. Cadastre uma faixa em Regras.';
      }
      return;
    }

    const base = Number(rule.points);
    salePointsInput.value = calculatePointsForValue(value);
    if (salePointsHint) {
      const promoNote = promoMultiplier !== 1
        ? ` · promoção x${String(promoMultiplier).replace('.', ',')}`
        : '';
      salePointsHint.textContent = `Regra: até ${formatCurrency(rule.maxValue)} → ${base} pts${promoNote}`;
    }
  };

  const resetSaleForm = () => {
    if (!saleForm) return;
    saleForm.reset();
    saleIdInput.value = '';
    saleFormTitle.textContent = 'Registrar venda';
    saleSubmit.textContent = 'Registrar venda';
    saleCancel.classList.add('hidden');
    const now = new Date();
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    saleDateInput.value = localNow;
    updateSalePoints();
  };

  const salePalette = [
    ['#2F7D5B', '#0B3D2E'], ['#3B82A0', '#1D4E6B'], ['#7A5FC0', '#43308A'],
    ['#C0793A', '#8A4A1A'], ['#C0507A', '#8A2A52'], ['#4A9A9A', '#1F6464']
  ];
  const saleInitials = (name) => String(name || '')
    .split(' ')
    .filter((part) => part && !/^(de|da|do|das|dos|e)$/i.test(part))
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const escapeAttr = (value) => String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const clockIcon = '<svg class="ico" aria-hidden="true"><use href="#i-clock"/></svg>';
  const editIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>';
  const trashIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>';

  const normalizeSaleCustomer = (value) => formatCustomerName(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  const getSalesCountByCustomer = (name) => {
    const key = normalizeSaleCustomer(name);
    if (!key) return 0;
    return sales.filter((sale) => normalizeSaleCustomer(sale.customer) === key).length;
  };
  window.Senfy.getSalesCountByCustomer = getSalesCountByCustomer;
  window.Senfy.getSales = () => sales.map((sale) => ({ ...sale }));

  const renderSales = () => {
    if (!salesTableBody) return;
    const sorted = [...sales].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const maxPoints = Math.max(1, ...sorted.map((sale) => Number(sale.points) || 0));
    salesTableBody.innerHTML = sorted.map((sale, index) => {
      const cleanName = formatCustomerName(sale.customer);
      const pair = salePalette[index % salePalette.length];
      const width = Math.max(4, (Number(sale.points) || 0) / maxPoints * 100).toFixed(1);
      return `
      <tr data-name="${escapeAttr(cleanName)}" data-date="${escapeAttr(sale.date)}" data-value="${Number(sale.value) || 0}" data-points="${Number(sale.points) || 0}" style="animation-delay:${Math.min(index, 10) * 45}ms">
        <td><div class="who"><span class="avatar" style="--a:${pair[0]};--b:${pair[1]}">${saleInitials(cleanName)}</span><span>${cleanName}</span></div></td>
        <td><span class="pill days">${clockIcon}${formatDateTime(sale.date)}</span></td>
        <td><span class="money">${formatCurrency(sale.value)}</span></td>
        <td class="pts"><b>${Number(sale.points).toLocaleString('pt-BR')}</b><div class="mini"><i data-w="${width}"></i></div></td>
        <td>
          <div class="row-actions">
            <button class="btn btn-secondary btn-icon" type="button" data-action="edit-sale" data-id="${sale.id}">${editIcon}Editar</button>
            <button class="btn btn-danger btn-icon" type="button" data-action="delete-sale" data-id="${sale.id}">${trashIcon}Excluir</button>
          </div>
        </td>
      </tr>`;
    }).join('');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      salesTableBody.querySelectorAll('.mini i').forEach((bar) => { bar.style.width = bar.dataset.w + '%'; });
    }));
    if (window.Senfy && typeof window.Senfy.onSalesRendered === 'function') window.Senfy.onSalesRendered(sorted);
  };

  if (saleForm && salesTableBody) {
    resetSaleForm();
    renderSales();

    saleValueInput.addEventListener('input', updateSalePoints);
    if (saleCustomerInput) {
      saleCustomerInput.addEventListener('blur', () => {
        saleCustomerInput.value = formatCustomerName(saleCustomerInput.value);
      });
    }

    saleForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const id = saleIdInput.value;
      const payload = {
        customer: formatCustomerName(saleCustomerInput.value),
        date: saleDateInput.value,
        value: parseFloat(saleValueInput.value),
        points: calculatePointsForValue(saleValueInput.value)
      };
      if (!payload.customer || !payload.date || Number.isNaN(payload.value) || !findRuleForValue(payload.value)) {
        updateSalePoints();
        return;
      }

      if (id) {
        sales = sales.map((sale) => (sale.id === id ? { ...sale, ...payload } : sale));
      } else {
        sales.push({ id: uid(), ...payload });
      }
      renderSales();
      resetSaleForm();
    });

    saleCancel.addEventListener('click', resetSaleForm);

    salesTableBody.addEventListener('click', (event) => {
      const btn = event.target.closest('button[data-action]');
      if (!btn) return;
      const { action, id } = btn.dataset;
      const sale = sales.find((item) => item.id === id);
      if (!sale) return;

      if (action === 'edit-sale') {
        saleIdInput.value = sale.id;
        saleCustomerInput.value = formatCustomerName(sale.customer);
        saleDateInput.value = sale.date;
        saleValueInput.value = sale.value;
        updateSalePoints();
        saleFormTitle.textContent = 'Editar venda';
        saleSubmit.textContent = 'Salvar alterações';
        saleCancel.classList.remove('hidden');
        saleValueInput.focus();
        document.getElementById('sale-form-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      if (action === 'delete-sale') {
        const ok = window.confirm(`Excluir a venda de ${sale.customer} (${formatCurrency(sale.value)})?`);
        if (!ok) return;
        sales = sales.filter((item) => item.id !== id);
        if (saleIdInput.value === id) resetSaleForm();
        renderSales();
      }
    });
  }

  // Modal compartilhado (regras e prêmios)
  const formModal = document.getElementById('form-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const ruleNewBtn = document.getElementById('rule-new');
  const prizeNewBtn = document.getElementById('prize-new');

  // Regras: CRUD + promoção
  const rulesGrid = document.getElementById('rules-grid');
  const ruleForm = document.getElementById('rule-form');
  const ruleIdInput = document.getElementById('rule-id');
  const ruleMaxInput = document.getElementById('rule-max');
  const rulePointsInput = document.getElementById('rule-points');
  const ruleDescriptionInput = document.getElementById('rule-description');
  const ruleSubmit = document.getElementById('rule-submit');
  const ruleCancel = document.getElementById('rule-cancel');
  const promoButtons = Array.from(document.querySelectorAll('.promo-btn[data-multiplier]'));
  const promoStatus = document.getElementById('promo-status');

  const resetRuleForm = () => {
    if (!ruleForm) return;
    ruleForm.reset();
    ruleIdInput.value = '';
    if (modalTitle) modalTitle.textContent = 'Cadastrar nova regra';
    ruleSubmit.textContent = 'Cadastrar regra';
  };

  const updatePromoStatus = () => {
    if (!promoStatus) return;
    if (promoMultiplier === 1) {
      promoStatus.textContent = 'Sem promoção ativa. A pontuação está no valor base das regras.';
    } else {
      promoStatus.textContent = `Promoção ativa: pontuação x${String(promoMultiplier).replace('.', ',')} aplicada às regras (valor base multiplicado).`;
    }
  };

  const medalNames = ['OURO', 'PRATA', 'BRONZE'];
  const medalLabels = ['Ouro — 1º lugar', 'Prata — 2º lugar', 'Bronze — 3º lugar'];
  /* Ícones de rank iguais aos de regras.html: coroa, escudo e gema */
  const rankShapes = {
    1: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5L3 8z"/><path d="M5.5 19h13"/>',
    2: '<path d="M12 3l8 3v6c0 4.5-3.2 7.6-8 9-4.8-1.4-8-4.5-8-9V6l8-3z"/><path d="M12 8.5l1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4L12 8.5z"/>',
    3: '<path d="M6 4h12l3 5-9 11L3 9l3-5z"/><path d="M3 9h18M9 4l-1 5 4 11 4-11-1-5"/>'
  };
  const rankIcon = (rank) => `
    <svg class="rank-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      ${rankShapes[rank]}
    </svg>`;

  /* Efeitos tech: toast, contadores animados e medidores */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const techToast = document.getElementById('tech-toast');
  let toastTimer;
  const techSay = (message) => {
    if (!techToast) return;
    techToast.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg><span></span>';
    const label = techToast.querySelector('span');
    if (label) label.textContent = message;
    techToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => techToast.classList.remove('show'), 2200);
  };
  const boltIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg>';

  const animateEntityCards = (scope) => {
    if (!scope) return;
    scope.querySelectorAll('.meter i[data-w]').forEach((el) => {
      const width = `${Math.max(0, Math.min(100, Number(el.dataset.w) || 0))}%`;
      if (reduceMotion) el.style.transition = 'none';
      el.style.width = width;
    });
    scope.querySelectorAll('.card-metric strong[data-value]').forEach((el) => {
      const target = Number(el.dataset.value) || 0;
      if (reduceMotion) {
        el.textContent = target.toLocaleString('pt-BR');
        return;
      }
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / 700, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased).toLocaleString('pt-BR');
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  };

  const renderRules = () => {
    if (!rulesGrid) return;
    if (!rules.length) {
      rulesGrid.innerHTML = '<p class="muted">Nenhuma regra cadastrada.</p>';
      return;
    }
    const ranked = rules
      .map((rule) => ({ ...rule, effective: Math.round(Number(rule.points) * promoMultiplier) }))
      .sort((a, b) => b.effective - a.effective || Number(a.maxValue) - Number(b.maxValue));
    const maxEffective = Math.max(1, ...ranked.map((rule) => rule.effective));
    const multLabel = String(promoMultiplier).replace('.', ',');

    rulesGrid.innerHTML = ranked.map((rule, index) => {
      const rank = index + 1;
      const isTop = rank <= 3;
      const badge = isTop
        ? `<span class="rank-badge rank-${rank}" role="img" aria-label="${medalLabels[index]}">${rankIcon(rank)}</span>`
        : `<span class="rank-badge rank-rest" aria-label="${rank}º lugar">${String(rank).padStart(2, '0')}</span>`;
      const eyebrow = isTop ? `${medalNames[index]} · FAIXA` : `FAIXA ${String(rank).padStart(2, '0')}`;
      const promoNote = promoMultiplier !== 1
        ? `<div class="small muted">Base: ${rule.points} pts · Promo: x${multLabel}</div>`
        : '';
      const promoTag = promoMultiplier !== 1
        ? `<em class="promo-tag">${boltIcon}x${multLabel}</em>`
        : '';
      return `
      <article class="entity-card rank-card-${rank}${isTop ? ' is-top' : ''}">
        <div class="card-head">
          ${badge}
          <div class="card-heading">
            <span class="card-eyebrow">${eyebrow}</span>
            <h3>Até ${formatCurrency(rule.maxValue)}</h3>
          </div>
        </div>
        <div class="card-metric">
          <strong data-value="${rule.effective}">0</strong>
          <span>pontos</span>
          ${promoTag}
        </div>
        <div class="card-lines">
          ${promoNote}
          <span>${rule.description || '-'}</span>
        </div>
        <div class="meter" aria-hidden="true"><i data-w="${(rule.effective / maxEffective * 100).toFixed(1)}"></i></div>
        <div class="row-actions">
          <button class="btn btn-secondary btn-icon" type="button" data-action="edit-rule" data-id="${rule.id}">${editIcon}Editar</button>
          <button class="btn btn-danger btn-icon" type="button" data-action="delete-rule" data-id="${rule.id}">${trashIcon}Excluir</button>
        </div>
      </article>`;
    }).join('');
    animateEntityCards(rulesGrid);
  };

  const promoBox = document.getElementById('promo-box');
  if (promoButtons.length) {
    promoButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        promoMultiplier = parseFloat(btn.dataset.multiplier || '1');
        promoButtons.forEach((item) => {
          const active = item === btn;
          item.classList.toggle('active', active);
          item.setAttribute('aria-pressed', String(active));
        });
        if (promoBox) promoBox.classList.toggle('on', promoMultiplier > 1);
        updatePromoStatus();
        renderRules();
        updateSalePoints();
        techSay(promoMultiplier === 1
          ? 'Promoção removida'
          : `Promoção x${String(promoMultiplier).replace('.', ',')} aplicada`);
      });
    });
  }

  updatePromoStatus();

  const openRuleModal = () => {
    if (!formModal || !ruleForm) return;
    resetRuleForm();
    ruleForm.hidden = false;
    if (prizeForm) prizeForm.hidden = true;
    if (modalSubtitle) modalSubtitle.textContent = 'Defina a faixa de compra e os pontos concedidos.';
    formModal.hidden = false;
    document.body.style.overflow = 'hidden';
    ruleMaxInput.focus();
  };

  if (ruleForm && rulesGrid) {
    renderRules();

    ruleNewBtn?.addEventListener('click', openRuleModal);

    ruleForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const id = ruleIdInput.value;
      const maxValue = parseFloat(ruleMaxInput.value);
      const points = parseInt(rulePointsInput.value, 10);
      const description = ruleDescriptionInput.value.trim() || `Compras até ${formatCurrency(maxValue)}`;
      if (Number.isNaN(maxValue) || Number.isNaN(points)) return;

      if (id) {
        rules = rules.map((r) => (r.id === id ? { ...r, maxValue, points, description } : r));
      } else {
        rules.push({ id: uid(), maxValue, points, description });
      }
      renderRules();
      resetRuleForm();
      updateSalePoints();
      closeModal();
      techSay(id ? 'Regra atualizada' : 'Regra adicionada');
    });

    ruleCancel?.addEventListener('click', () => {
      resetRuleForm();
      closeModal();
    });

    rulesGrid.addEventListener('click', (event) => {
      const btn = event.target.closest('button[data-action]');
      if (!btn) return;
      const { action, id } = btn.dataset;
      const rule = rules.find((r) => r.id === id);
      if (!rule) return;

      if (action === 'edit-rule') {
        ruleIdInput.value = rule.id;
        ruleMaxInput.value = rule.maxValue;
        rulePointsInput.value = rule.points;
        ruleDescriptionInput.value = rule.description || '';
        if (modalTitle) modalTitle.textContent = 'Editar regra';
        ruleSubmit.textContent = 'Salvar alterações';
        ruleForm.hidden = false;
        if (prizeForm) prizeForm.hidden = true;
        if (modalSubtitle) modalSubtitle.textContent = 'Defina a faixa de compra e os pontos concedidos.';
        if (formModal) formModal.hidden = false;
        document.body.style.overflow = 'hidden';
        ruleMaxInput.focus();
      }

      if (action === 'delete-rule') {
        const ok = window.confirm(`Excluir a regra "Até ${formatCurrency(rule.maxValue)}"?`);
        if (!ok) return;
        rules = rules.filter((r) => r.id !== id);
        if (ruleIdInput.value === id) resetRuleForm();
        renderRules();
        updateSalePoints();
        techSay(`Regra até ${formatCurrency(rule.maxValue)} excluída`);
      }
    });
  }

  // Prêmios: CRUD
  const prizesGrid = document.getElementById('prizes-grid');
  const prizeForm = document.getElementById('prize-form');
  const prizeIdInput = document.getElementById('prize-id');
  const prizeDescriptionInput = document.getElementById('prize-description');
  const prizeCommentInput = document.getElementById('prize-comment');
  const prizeStartInput = document.getElementById('prize-start');
  const prizeEndInput = document.getElementById('prize-end');
  const prizePointsInput = document.getElementById('prize-points');
  const prizeSubmit = document.getElementById('prize-submit');
  const prizeCancel = document.getElementById('prize-cancel');

  let prizes = [
    { id: uid(), description: 'Desconto R$ 20,00', comment: 'Válido para compras acima de R$ 100,00. Código resgatado no caixa.', start: '2026-01-01', end: '2026-12-31', points: 800 },
    { id: uid(), description: 'Brinde especial', comment: 'Retirada na loja mediante apresentação do resgate.', start: '2026-03-01', end: '2026-12-31', points: 1200 },
    { id: uid(), description: 'Frete grátis (serviço)', comment: 'Aplicável em pedidos agendados pelo atendimento.', start: '2026-02-15', end: '2026-08-31', points: 500 }
  ];

  const resetPrizeForm = () => {
    if (!prizeForm) return;
    prizeForm.reset();
    prizeIdInput.value = '';
    if (modalTitle) modalTitle.textContent = 'Cadastrar novo prêmio';
    prizeSubmit.textContent = 'Cadastrar prêmio';
  };

  const renderPrizes = () => {
    if (!prizesGrid) return;
    if (!prizes.length) {
      prizesGrid.innerHTML = '<p class="muted">Nenhum prêmio cadastrado.</p>';
      return;
    }
    const ranked = [...prizes].sort((a, b) =>
      Number(b.points) - Number(a.points) || String(a.description).localeCompare(String(b.description), 'pt-BR'));
    const maxPoints = Math.max(1, ...ranked.map((prize) => Number(prize.points) || 0));

    prizesGrid.innerHTML = ranked.map((prize, index) => {
      const rank = index + 1;
      const isTop = rank <= 3;
      const badge = isTop
        ? `<span class="rank-badge rank-${rank}" role="img" aria-label="${medalLabels[index]}">${rankIcon(rank)}</span>`
        : `<span class="rank-badge rank-rest" aria-label="${rank}º lugar">${String(rank).padStart(2, '0')}</span>`;
      const eyebrow = isTop ? `${medalNames[index]} · RESGATE` : `RESGATE ${String(rank).padStart(2, '0')}`;
      return `
      <article class="entity-card rank-card-${rank}${isTop ? ' is-top' : ''}">
        <div class="card-head">
          ${badge}
          <div class="card-heading">
            <span class="card-eyebrow">${eyebrow}</span>
            <h3>${prize.description}</h3>
          </div>
        </div>
        <div class="card-metric">
          <strong data-value="${Number(prize.points) || 0}">0</strong>
          <span>pts necessários</span>
        </div>
        <div class="card-lines">
          <span>${formatDate(prize.start)} — ${formatDate(prize.end)}</span>
          <span>${prize.comment || '-'}</span>
        </div>
        <div class="meter" aria-hidden="true"><i data-w="${((Number(prize.points) || 0) / maxPoints * 100).toFixed(1)}"></i></div>
        <div class="row-actions">
          <button class="btn btn-secondary btn-icon" type="button" data-action="edit-prize" data-id="${prize.id}">${editIcon}Editar</button>
          <button class="btn btn-danger btn-icon" type="button" data-action="delete-prize" data-id="${prize.id}">${trashIcon}Excluir</button>
        </div>
      </article>`;
    }).join('');
    animateEntityCards(prizesGrid);
  };

  const openPrizeModal = () => {
    if (!formModal || !prizeForm) return;
    resetPrizeForm();
    ruleForm.hidden = true;
    prizeForm.hidden = false;
    if (modalSubtitle) modalSubtitle.textContent = 'Informe os detalhes do prêmio e os pontos necessários.';
    formModal.hidden = false;
    document.body.style.overflow = 'hidden';
    prizeDescriptionInput.focus();
  };

  if (prizeForm && prizesGrid) {
    renderPrizes();

    prizeNewBtn?.addEventListener('click', openPrizeModal);

    prizeForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const id = prizeIdInput.value;
      const payload = {
        description: prizeDescriptionInput.value.trim(),
        comment: prizeCommentInput.value.trim(),
        start: prizeStartInput.value,
        end: prizeEndInput.value,
        points: parseInt(prizePointsInput.value, 10)
      };
      if (!payload.description || Number.isNaN(payload.points)) return;

      if (id) {
        prizes = prizes.map((p) => (p.id === id ? { ...p, ...payload } : p));
      } else {
        prizes.push({ id: uid(), ...payload });
      }
      renderPrizes();
      resetPrizeForm();
      closeModal();
      techSay(id ? 'Prêmio atualizado' : 'Prêmio adicionado');
    });

    prizeCancel?.addEventListener('click', () => {
      resetPrizeForm();
      closeModal();
    });

    prizesGrid.addEventListener('click', (event) => {
      const btn = event.target.closest('button[data-action]');
      if (!btn) return;
      const { action, id } = btn.dataset;
      const prize = prizes.find((p) => p.id === id);
      if (!prize) return;

      if (action === 'edit-prize') {
        prizeIdInput.value = prize.id;
        prizeDescriptionInput.value = prize.description || '';
        prizeCommentInput.value = prize.comment || '';
        prizeStartInput.value = prize.start || '';
        prizeEndInput.value = prize.end || '';
        prizePointsInput.value = prize.points;
        if (modalTitle) modalTitle.textContent = 'Editar prêmio';
        prizeSubmit.textContent = 'Salvar alterações';
        ruleForm.hidden = true;
        prizeForm.hidden = false;
        if (modalSubtitle) modalSubtitle.textContent = 'Informe os detalhes do prêmio e os pontos necessários.';
        if (formModal) formModal.hidden = false;
        document.body.style.overflow = 'hidden';
        prizeDescriptionInput.focus();
      }

      if (action === 'delete-prize') {
        const ok = window.confirm(`Excluir o prêmio "${prize.description}"?`);
        if (!ok) return;
        prizes = prizes.filter((p) => p.id !== id);
        if (prizeIdInput.value === id) resetPrizeForm();
        renderPrizes();
        techSay(`Prêmio "${prize.description}" excluído`);
      }
    });
  }

  // Fechamento do modal
  function closeModal() {
    if (!formModal) return;
    formModal.hidden = true;
    document.body.style.overflow = '';
  }

  formModal?.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && formModal && !formModal.hidden) closeModal();
  });
})();