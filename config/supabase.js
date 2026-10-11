require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Trim whitespace/newlines and stray quotes (very common when pasting into Vercel/.env).
const clean = v => String(v || '').trim().replace(/^["']|["']$/g, '').trim();
const supabaseUrl = clean(process.env.SUPABASE_URL).replace(/\/+$/, '').replace(/\/(rest|auth)\/v1$/, '');
// Server-side only. The service-role key must NEVER be sent to the browser.
const serviceKey = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);
const anonKey = clean(process.env.SUPABASE_ANON_KEY);
const supabaseKey = serviceKey || anonKey;
const usingAnonKey = !serviceKey && !!anonKey;
const isPlaceholder = v => /your-|<.*>|example|xxxx/i.test(v);

let supabase = null;
let initError = null;

if (!supabaseUrl || !supabaseKey) {
  initError = 'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (Vercel → Project Settings → Environment Variables).';
} else if (!supabaseUrl.startsWith('https://') || isPlaceholder(supabaseUrl) || isPlaceholder(supabaseKey)) {
  initError = 'SUPABASE_URL / key still contain placeholder values. Use the real Project URL and service_role key from Supabase → Project Settings → API.';
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        // Generous timeout so cold starts / large uploads don't fail, but a dead URL still errors out.
        fetch: (url, options = {}) => {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), 20000);
          return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
        }
      }
    });
  } catch (e) {
    initError = `Supabase initialization failed: ${e.message}`;
  }
}

if (initError) console.warn('⚠️', initError);
if (usingAnonKey) console.warn('⚠️ Using SUPABASE_ANON_KEY: RLS blocks reading the users table, so login will fail. Set SUPABASE_SERVICE_ROLE_KEY.');

// Diagnostic only - the client is usable immediately, this just reports health.
async function checkConnection() {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('departments').select('id').limit(1);
    if (error) { console.warn('⚠️ Supabase check returned error:', error.message); return false; }
    console.log('⚡ Supabase connection verified and ACTIVE');
    return true;
  } catch (err) {
    console.warn('⚠️ Supabase unreachable:', err.message);
    return false;
  }
}

module.exports = {
  supabase,               // the client (null only if env vars are missing/invalid)
  rawClient: supabase,
  initError: () => initError,
  usingAnonKey: () => usingAnonKey,
  checkConnection,
  isConfigured: () => !!supabase,
  isAvailable: () => !!supabase
};
