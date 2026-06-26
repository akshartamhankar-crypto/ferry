/*
 * Ferry API — Cloudflare Worker (direct Stripe, no database, time-based access)
 * ----------------------------------------------------------------------------
 * Access is purely time-based. Four fares:
 *   1mo / 3mo / 6mo  -> prepaid one-time charges (no auto-renew)
 *   annual           -> auto-renewing subscription (cheapest per month)
 *
 *   POST /checkout  { plan, installId } -> { url }
 *   GET  /status?installId=...          -> { active, until, plan }
 *
 * No DB: installId is written into Stripe metadata at checkout; /status asks
 * Stripe live for the newest valid purchase and computes an expiry. The Stripe
 * secret key lives only here, never in the extension.
 *
 * Vars: SITE_URL, PRICE_1MO, PRICE_3MO, PRICE_6MO, PRICE_ANNUAL
 * Secret: STRIPE_SECRET  (wrangler secret put STRIPE_SECRET)
 */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const MONTH = 2629800; // seconds (30.44 days)
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', ...CORS } });

async function stripe(env, path, method = 'GET', form = null) {
  const opt = { method, headers: { Authorization: 'Bearer ' + env.STRIPE_SECRET } };
  if (form) { opt.headers['Content-Type'] = 'application/x-www-form-urlencoded'; opt.body = form; }
  return (await fetch('https://api.stripe.com/v1' + path, opt)).json();
}

const PLANS = {
  '1mo': { months: 1, mode: 'payment', price: (e) => e.PRICE_1MO },
  '3mo': { months: 3, mode: 'payment', price: (e) => e.PRICE_3MO },
  '6mo': { months: 6, mode: 'payment', price: (e) => e.PRICE_6MO },
  'annual': { months: 12, mode: 'subscription', price: (e) => e.PRICE_ANNUAL },
};

async function createCheckout(env, planKey, installId) {
  const plan = PLANS[planKey] || PLANS['1mo'];
  const p = new URLSearchParams();
  p.set('mode', plan.mode);
  p.set('line_items[0][price]', plan.price(env));
  p.set('line_items[0][quantity]', '1');
  p.set('success_url', env.SITE_URL + '/thanks');
  p.set('cancel_url', env.SITE_URL + '/');
  p.set('client_reference_id', installId);
  p.set('metadata[installId]', installId);
  p.set('allow_promotion_codes', 'true');
  if (plan.mode === 'subscription') {
    p.set('subscription_data[metadata][installId]', installId);
  } else {
    p.set('payment_intent_data[metadata][installId]', installId);
    p.set('payment_intent_data[metadata][months]', String(plan.months));
  }
  const session = await stripe(env, '/checkout/sessions', 'POST', p.toString());
  if (session.error) return { error: session.error.message || 'stripe_error' };
  return { url: session.url };
}

async function checkStatus(env, installId) {
  const q = (s) => encodeURIComponent(s);
  let until = 0;
  let plan = null;

  // auto-renewing subscription (annual)
  const subs = await stripe(env, "/subscriptions/search?limit=1&query=" + q("metadata['installId']:'" + installId + "'"));
  if (subs && subs.data && subs.data.length) {
    const s = subs.data[0];
    if ((s.status === 'active' || s.status === 'trialing') && s.current_period_end > until) {
      until = s.current_period_end; plan = 'annual';
    }
  }

  // prepaid terms: newest expiry wins (created + months)
  const pis = await stripe(env, "/payment_intents/search?limit=20&query=" + q("metadata['installId']:'" + installId + "' AND status:'succeeded'"));
  if (pis && pis.data) {
    for (const pi of pis.data) {
      const months = parseInt((pi.metadata && pi.metadata.months) || '0', 10) || 0;
      if (!months) continue;
      const exp = pi.created + months * MONTH;
      if (exp > until) { until = exp; if (plan !== 'annual') plan = 'prepaid'; }
    }
  }

  const now = Math.floor(Date.now() / 1000);
  return { active: until > now, until: until || null, plan: until > now ? plan : null };
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    try {
      if (url.pathname === '/checkout' && req.method === 'POST') {
        const { plan, installId } = await req.json();
        if (!installId) return json({ error: 'missing installId' }, 400);
        return json(await createCheckout(env, plan || '1mo', installId));
      }
      if (url.pathname === '/status') {
        const installId = url.searchParams.get('installId');
        if (!installId) return json({ error: 'missing installId' }, 400);
        return json(await checkStatus(env, installId));
      }
      return json({ ok: true, service: 'ferry-api' });
    } catch (e) {
      return json({ error: String((e && e.message) || e) }, 500);
    }
  },
};
