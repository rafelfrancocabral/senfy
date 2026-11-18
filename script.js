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
    'visao-geral': 'Acompanhe o desempenho do seu programa de fidelidade',
    'clientes': 'Consulte sua base, pontos acumulados e histórico de resgates',
    'regras': 'Configure acúmulo, validade e estratégias do programa',
    'premios': 'Gerencie recompensas, custos e métodos de resgate',
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
})();
