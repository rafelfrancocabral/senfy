(() => {
  const sb = window.senfySupabase;
  const form = document.getElementById('auth-form');
  if (!form || !sb) return;

  const $ = (id) => document.getElementById(id);
  const feedback = $('auth-feedback');
  const submitBtn = $('auth-submit');
  const tabs = Array.from(document.querySelectorAll('[data-auth-mode]'));
  const switchBtns = Array.from(document.querySelectorAll('[data-auth-switch]'));
  const signupFields = Array.from(document.querySelectorAll('[data-auth-signup]'));
  const companyInput = $('company-name');
  const emailInput = $('email');
  const passwordInput = $('password');
  const countryInput = $('country');
  const title = $('auth-title');
  const subtitle = $('auth-subtitle');
  const eyebrow = $('auth-eyebrow');
  const links = $('auth-links');

  let mode = 'login';
  let loginAttempts = 0;
  let loginLockedUntil = 0;

  const STORE_KEY = 'senfy:active-store-id';

  const setFeedback = (msg = '', type = '') => {
    feedback.textContent = msg;
    feedback.className = 'auth-feedback' + (type ? ' is-' + type : '');
  };

  const setLoading = (loading) => {
    submitBtn.disabled = loading;
    submitBtn.textContent = loading ? 'Aguarde...' : (mode === 'login' ? 'Entrar' : 'Criar conta');
  };

  const setMode = (next) => {
    mode = next === 'signup' ? 'signup' : 'login';
    const isSignup = mode === 'signup';
    tabs.forEach((btn) => {
      const active = btn.dataset.authMode === mode;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
    });
    signupFields.forEach((el) => { el.hidden = !isSignup; });
    companyInput.required = isSignup;
    passwordInput.autocomplete = isSignup ? 'new-password' : 'current-password';
    eyebrow.textContent = isSignup ? 'Cadastro' : 'Acesso';
    title.textContent = isSignup ? 'Crie sua conta' : 'Acesse sua conta';
    subtitle.textContent = isSignup
      ? 'Cadastre sua empresa para começar a usar o programa de fidelidade Senfy.'
      : 'Entre para acompanhar clientes, regras, prêmios e ações do seu programa de fidelidade.';
    submitBtn.textContent = isSignup ? 'Criar conta' : 'Entrar';
    links.innerHTML = isSignup
      ? 'Já tem conta? <button class="auth-link-btn" type="button" data-auth-switch="login">Entrar</button>'
      : 'Ainda não tem conta? <button class="auth-link-btn" type="button" data-auth-switch="signup">Criar conta</button>';
    links.querySelectorAll('[data-auth-switch]').forEach((btn) => btn.addEventListener('click', () => setMode(btn.dataset.authSwitch)));
    setFeedback('');
  };

  tabs.forEach((btn) => btn.addEventListener('click', () => setMode(btn.dataset.authMode)));
  switchBtns.forEach((btn) => btn.addEventListener('click', () => setMode(btn.dataset.authSwitch)));

  const getStoreByOwner = async (userId) => {
    const { data, error } = await sb
      .from('stores')
      .select('*')
      .eq('owner_id', userId)
      .order('criado_em', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  };

  const persistStore = (store) => {
    if (store?.id) localStorage.setItem(STORE_KEY, store.id);
  };

  const redirectToDashboard = () => {
    window.location.href = 'dashboard.html';
  };

  const ensureStoreForUser = async (user, companyName, country) => {
    const existing = await getStoreByOwner(user.id);
    if (existing) return existing;
    const pais = country === 'PT' ? 'PT' : 'BR';
    const moeda = pais === 'PT' ? 'EUR' : 'BRL';
    const payload = {
      owner_id: user.id,
      nome_loja: companyName.trim(),
      pais,
      moeda,
      tipo_programa: 'stamps',
      ativo: true
    };
    const { data, error } = await sb.from('stores').insert(payload).select('*').single();
    if (error) throw error;
    return data;
  };

  const handleSignup = async () => {
    const companyName = companyInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const country = countryInput.value;
    if (!companyName) { setFeedback('Informe o nome da empresa.', 'error'); companyInput.focus(); return; }
    if (!email) { setFeedback('Informe seu e-mail.', 'error'); emailInput.focus(); return; }
    if (!password || password.length < 8) { setFeedback('A senha deve ter pelo menos 8 caracteres.', 'error'); passwordInput.focus(); return; }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) { setFeedback('Use uma senha com letras e números para maior segurança.', 'error'); passwordInput.focus(); return; }

    setLoading(true);
    setFeedback('');
    try {
      const emailRedirectTo = new URL('login.html', window.location.href).toString();
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
          data: { company_name: companyName },
          emailRedirectTo
        }
      });
      if (error) throw error;

      // If email confirmation is enabled, session may be null.
      if (!data.session) {
        setFeedback('Conta criada. Verifique seu e-mail para confirmar o cadastro e depois entre.', 'success');
        setLoading(false);
        return;
      }

      const store = await ensureStoreForUser(data.user || data.session.user, companyName, country);
      persistStore(store);
      setFeedback('Empresa cadastrada com sucesso. Redirecionando...', 'success');
      redirectToDashboard();
    } catch (err) {
      console.error(err);
      const msg = err?.message || 'Não foi possível criar a conta.';
      const hint = /row-level security|permission|policy/i.test(msg)
        ? ' Verifique se a policy de INSERT em public.stores para authenticated foi criada no Supabase.'
        : '';
      setFeedback(msg + hint, 'error');
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email) { setFeedback('Informe seu e-mail.', 'error'); emailInput.focus(); return; }
    if (!password) { setFeedback('Informe sua senha.', 'error'); passwordInput.focus(); return; }

    const now = Date.now();
    if (now < loginLockedUntil) {
      const secs = Math.ceil((loginLockedUntil - now) / 1000);
      setFeedback(`Muitas tentativas. Aguarde ${secs}s para tentar novamente.`, 'error');
      return;
    }

    setLoading(true);
    setFeedback('');
    try {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      loginAttempts = 0;
      loginLockedUntil = 0;
      const user = data.user || data.session?.user;
      const store = await getStoreByOwner(user.id);
      if (!store) {
        setFeedback('Conta autenticada, mas nenhuma empresa foi encontrada. Crie uma conta de empresa.', 'error');
        setLoading(false);
        return;
      }
      persistStore(store);
      setFeedback('Login realizado. Redirecionando...', 'success');
      redirectToDashboard();
    } catch (err) {
      console.error(err);
      loginAttempts += 1;
      const delay = Math.min(30000, 1000 * Math.pow(2, Math.max(0, loginAttempts - 3)));
      if (loginAttempts >= 3) loginLockedUntil = Date.now() + delay;
      // Mensagem genérica para não vazar se o e-mail existe
      setFeedback('E-mail ou senha inválidos. Verifique seus dados e tente novamente.', 'error');
      setLoading(false);
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (mode === 'signup') await handleSignup();
    else await handleLogin();
  });

  // If already authenticated, go to dashboard. Also handles email-confirmation return.
  (async () => {
    try {
      const { data } = await sb.auth.getSession();
      const user = data?.session?.user;
      if (!user) return;
      let store = await getStoreByOwner(user.id);
      if (!store) {
        const companyName = user.user_metadata?.company_name || user.email?.split('@')[0] || 'Minha loja';
        try {
          store = await ensureStoreForUser(user, companyName, 'BR');
        } catch (e) {
          console.error('Falha ao criar loja após confirmação', e);
        }
      }
      if (store) { persistStore(store); redirectToDashboard(); }
    } catch (_) { /* ignore */ }
  })();

  const params = new URLSearchParams(window.location.search);
  setMode(params.get('mode') === 'signup' ? 'signup' : 'login');
})();
