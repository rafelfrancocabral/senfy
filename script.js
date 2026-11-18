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
    'visao-geral': 'Acompanhe vendas e a performance de resgates',
    'clientes': 'Consulte nome, telefone, pontos disponíveis e número de resgates',
    'regras': 'Cadastre, edite e exclua regras de pontuação por faixa de compra',
    'premios': 'Cadastre, edite e exclua prêmios e condições de resgate',
    'acao': 'Planeje campanhas e ações para aumentar recorrência'
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

  const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  // Visão geral: gráfico de performance de resgates
  const chartEl = document.getElementById('redemptions-chart');
  if (chartEl) {
    const redemptionData = [
      { name: 'Desconto R$ 20,00', redemptions: 24 },
      { name: 'Brinde especial', redemptions: 15 },
      { name: 'Frete grátis (serviço)', redemptions: 9 },
      { name: 'Café cortesia', redemptions: 18 },
      { name: 'Voucher R$ 50,00', redemptions: 6 }
    ];
    const max = Math.max(1, ...redemptionData.map((d) => d.redemptions));
    chartEl.innerHTML = redemptionData.map((d) => {
      const width = Math.round((d.redemptions / max) * 100);
      return `
        <div class="bar-row">
          <div class="bar-label">${d.name}</div>
          <div class="bar-track" aria-hidden="true"><div class="bar-fill" style="width:${width}%"></div></div>
          <div class="bar-value">${d.redemptions} resgates</div>
        </div>`;
    }).join('');
  }

  // Regras: CRUD
  const rulesTableBody = document.getElementById('rules-table-body');
  const ruleForm = document.getElementById('rule-form');
  const ruleIdInput = document.getElementById('rule-id');
  const ruleMaxInput = document.getElementById('rule-max');
  const rulePointsInput = document.getElementById('rule-points');
  const ruleDescriptionInput = document.getElementById('rule-description');
  const ruleFormTitle = document.getElementById('rule-form-title');
  const ruleSubmit = document.getElementById('rule-submit');
  const ruleCancel = document.getElementById('rule-cancel');

  let rules = [
    { id: uid(), maxValue: 50, points: 2, description: 'Compras até R$ 50,00' },
    { id: uid(), maxValue: 100, points: 5, description: 'Compras até R$ 100,00' },
    { id: uid(), maxValue: 200, points: 12, description: 'Compras até R$ 200,00' },
    { id: uid(), maxValue: 350, points: 22, description: 'Compras até R$ 350,00' },
    { id: uid(), maxValue: 500, points: 35, description: 'Compras até R$ 500,00' },
    { id: uid(), maxValue: 750, points: 55, description: 'Compras até R$ 750,00' },
    { id: uid(), maxValue: 1000, points: 80, description: 'Compras até R$ 1.000,00' }
  ];

  const resetRuleForm = () => {
    if (!ruleForm) return;
    ruleForm.reset();
    ruleIdInput.value = '';
    ruleFormTitle.textContent = 'Cadastrar regra';
    ruleSubmit.textContent = 'Cadastrar regra';
    ruleCancel.classList.add('hidden');
  };

  const renderRules = () => {
    if (!rulesTableBody) return;
    const sorted = [...rules].sort((a, b) => Number(a.maxValue) - Number(b.maxValue));
    if (!sorted.length) {
      rulesTableBody.innerHTML = '<tr><td colspan="4" class="muted">Nenhuma regra cadastrada.</td></tr>';
      return;
    }
    rulesTableBody.innerHTML = sorted.map((rule) => `
      <tr>
        <td>Até ${formatCurrency(rule.maxValue)}</td>
        <td><strong>${rule.points}</strong> pontos</td>
        <td>${rule.description || '-'}</td>
        <td>
          <div class="row-actions">
            <button class="btn btn-secondary btn-icon" type="button" data-action="edit-rule" data-id="${rule.id}">Editar</button>
            <button class="btn btn-danger btn-icon" type="button" data-action="delete-rule" data-id="${rule.id}">Excluir</button>
          </div>
        </td>
      </tr>`).join('');
  };

  if (ruleForm && rulesTableBody) {
    renderRules();

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
    });

    ruleCancel.addEventListener('click', resetRuleForm);

    rulesTableBody.addEventListener('click', (event) => {
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
        ruleFormTitle.textContent = 'Editar regra';
        ruleSubmit.textContent = 'Salvar alterações';
        ruleCancel.classList.remove('hidden');
        ruleMaxInput.focus();
        document.getElementById('rule-form-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      if (action === 'delete-rule') {
        const ok = window.confirm(`Excluir a regra "Até ${formatCurrency(rule.maxValue)}"?`);
        if (!ok) return;
        rules = rules.filter((r) => r.id !== id);
        if (ruleIdInput.value === id) resetRuleForm();
        renderRules();
      }
    });
  }

  // Prêmios: CRUD
  const prizesTableBody = document.getElementById('prizes-table-body');
  const prizeForm = document.getElementById('prize-form');
  const prizeIdInput = document.getElementById('prize-id');
  const prizeDescriptionInput = document.getElementById('prize-description');
  const prizeCommentInput = document.getElementById('prize-comment');
  const prizeStartInput = document.getElementById('prize-start');
  const prizeEndInput = document.getElementById('prize-end');
  const prizePointsInput = document.getElementById('prize-points');
  const prizeFormTitle = document.getElementById('prize-form-title');
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
    prizeFormTitle.textContent = 'Cadastrar prêmio';
    prizeSubmit.textContent = 'Cadastrar prêmio';
    prizeCancel.classList.add('hidden');
  };

  const renderPrizes = () => {
    if (!prizesTableBody) return;
    if (!prizes.length) {
      prizesTableBody.innerHTML = '<tr><td colspan="6" class="muted">Nenhum prêmio cadastrado.</td></tr>';
      return;
    }
    prizesTableBody.innerHTML = prizes.map((prize) => `
      <tr>
        <td><strong>${prize.description}</strong></td>
        <td>${prize.comment || '-'}</td>
        <td>${formatDate(prize.start)}</td>
        <td>${formatDate(prize.end)}</td>
        <td>${Number(prize.points).toLocaleString('pt-BR')} pts</td>
        <td>
          <div class="row-actions">
            <button class="btn btn-secondary btn-icon" type="button" data-action="edit-prize" data-id="${prize.id}">Editar</button>
            <button class="btn btn-danger btn-icon" type="button" data-action="delete-prize" data-id="${prize.id}">Excluir</button>
          </div>
        </td>
      </tr>`).join('');
  };

  if (prizeForm && prizesTableBody) {
    renderPrizes();

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
    });

    prizeCancel.addEventListener('click', resetPrizeForm);

    prizesTableBody.addEventListener('click', (event) => {
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
        prizeFormTitle.textContent = 'Editar prêmio';
        prizeSubmit.textContent = 'Salvar alterações';
        prizeCancel.classList.remove('hidden');
        prizeDescriptionInput.focus();
        document.getElementById('prize-form-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      if (action === 'delete-prize') {
        const ok = window.confirm(`Excluir o prêmio "${prize.description}"?`);
        if (!ok) return;
        prizes = prizes.filter((p) => p.id !== id);
        if (prizeIdInput.value === id) resetPrizeForm();
        renderPrizes();
      }
    });
  }
})();