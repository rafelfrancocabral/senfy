// Configuração pública do Supabase (frontend).
// A chave publishable/anon pode ficar no cliente; nunca use secret/service role aqui.
window.SENFY_SUPABASE_URL = 'https://gxxndjjsbxdjjxkstdfw.supabase.co';
window.SENFY_SUPABASE_ANON_KEY = 'sb_publishable_MHJsqoT4bYRk__wirukpCw_IfrLqeq7';

window.senfySupabase = window.supabase
  ? window.supabase.createClient(window.SENFY_SUPABASE_URL, window.SENFY_SUPABASE_ANON_KEY)
  : null;
