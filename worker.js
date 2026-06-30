// Cloudflare Worker — Cartelera proxy + Cron notifications
// Deploy at: https://cartelera-proxy.felipestesta.workers.dev/
// Set secrets: wrangler secret put RESEND_API_KEY

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    // POST /subscribe — register email + catedra IDs + welcome email + init snapshot
    if (url.pathname === '/subscribe' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { email: rawEmail, codes } = body;
        if (!rawEmail || !codes || !Array.isArray(codes)) {
          return new Response(JSON.stringify({ error: 'email and codes[] required' }), {
            status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
        const email = rawEmail.toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return new Response(JSON.stringify({ error: 'invalid email format' }), {
            status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
        // Store subscription first (always, even if welcome email fails)
        await env.CARTELERA_SUBS.put(email, JSON.stringify(codes));

        // Fetch latest pubs per catedra + initialize snapshots (parallel)
        const catedraPubs = {};
        await Promise.allSettled(codes.map(async (id) => {
          try {
            const pubs = await fetchCatedraPubs(id);
            const latest5 = pubs.slice(0, 5);
            if (latest5.length > 0) catedraPubs[id] = latest5;
            await env.CARTELERA_SNAPSHOTS.put(id, JSON.stringify(pubs)); // store full array
          } catch (e) {
            console.error('Welcome fetch error for catedra ' + id + ': ' + e.message);
            // Skip failed catedras — don't block subscription
          }
        }));

        // Send welcome email (don't block if it fails)
        let welcomeEmailSent = false;
        if (Object.keys(catedraPubs).length > 0) {
          try {
            const subject = '🔔 Cartelera UNLP - Suscripción confirmada';
            const html = buildWelcomeHtml(catedraPubs);
            await sendEmail(email, subject, html, env);
            welcomeEmailSent = true;
          } catch (e) {
            console.error('Welcome email send failed: ' + e.message);
            // Keep subscription stored — partial success
          }
        }

        return new Response(JSON.stringify({ ok: true, welcomeEmailSent }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // POST /unsubscribe — remove email subscription
    if (url.pathname === '/unsubscribe' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { email: rawEmail } = body;
        if (!rawEmail) {
          return new Response(JSON.stringify({ error: 'email required' }), {
            status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
        const email = rawEmail.toLowerCase().trim();
        await env.CARTELERA_SUBS.delete(email);
        return new Response(JSON.stringify({ ok: true }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // GET /health
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ ok: true, cron: '0 8 * * *' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Default: proxy behavior (existing)
    const id = url.searchParams.get('id');
    const tag = url.searchParams.get('tag');
    if (!id) return new Response('missing id', { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    let target = `https://cartelera.med.unlp.edu.ar/catedra/${id}`;
    if (tag) target += `/etiqueta/${tag}`;
    const html = await (await fetch(target)).text();
    return new Response(html, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/html; charset=utf-8'
      }
    });
  },

  async scheduled(event, env, ctx) {
    // 1. List all subscriptions
    let subsList;
    try { subsList = await env.CARTELERA_SUBS.list(); } catch (e) { console.error('KV list error: ' + e.message); return; }

    // Build catedraID -> [emails] map
    const catedraEmails = {};
    for (const key of subsList.keys) {
      const email = key.name;
      let codes = [];
      try {
        const raw = await env.CARTELERA_SUBS.get(email);
        if (raw) codes = JSON.parse(raw);
      } catch (e) { console.error('KV get error for ' + email + ': ' + e.message); continue; }
      codes.forEach(id => {
        if (!catedraEmails[id]) catedraEmails[id] = [];
        catedraEmails[id].push(email);
      });
    }

    // 2. For each unique catedra ID, fetch + check + notify
    for (const [id, emails] of Object.entries(catedraEmails)) {
      try {
        const pubs = await fetchCatedraPubs(id);

        // Get stored snapshot
        const snapshotRaw = await env.CARTELERA_SNAPSHOTS.get(id);
        const snapshot = snapshotRaw ? JSON.parse(snapshotRaw) : [];

        // Find new publications
        const newPubs = pubs.filter(p =>
          !snapshot.some(s => s.title === p.title && s.date === p.date)
        );

        if (newPubs.length > 0) {
          const subject = 'Nueva publicación en tu cátedra - Cartelera UNLP';
          const html = '<p>Nuevas publicaciones detectadas:</p><ul>' +
            newPubs.map(p => '<li><strong>' + escapeHtml(p.title) + '</strong> - ' + escapeHtml(p.date) + '</li>').join('') +
            '</ul><p><a href="https://cartelera.med.unlp.edu.ar/catedra/' + escapeHtml(id) + '">Ver cartelera</a></p>';

          for (const email of emails) {
            try {
              await sendEmail(email, subject, html, env);
            } catch (e) {
              console.error('Email send failed for ' + email + ': ' + e.message);
            }
          }

          // Update snapshot (store full array to avoid false flags)
          await env.CARTELERA_SNAPSHOTS.put(id, JSON.stringify(pubs));
        }
      } catch (e) {
        console.error('Error checking catedra ' + id + ': ' + e.message);
      }
    }
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function parseCatedraHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const cards = doc.querySelectorAll('.ribbon-wrapper.card');
  const results = [];
  cards.forEach(card => {
    const titleEl = card.querySelector('.card-title a');
    const title = titleEl ? titleEl.textContent.trim() : '';
    const dateEl = card.querySelector('p.card-text i.fa-calendar-alt');
    let dateStr = '';
    if (dateEl && dateEl.parentElement) {
      dateStr = dateEl.parentElement.textContent.trim();
    }
    if (title && dateStr) {
      results.push({ title, date: dateStr });
    }
  });
  return results;
}

async function fetchCatedraPubs(id) {
  const url = `https://cartelera.med.unlp.edu.ar/catedra/${id}`;
  const html = await (await fetch(url)).text();
  return parseCatedraHtml(html);
}

async function sendEmail(to, subject, html, env) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + env.RESEND_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Cartelera UNLP <onboarding@resend.dev>',
      to,
      subject,
      html
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error('Resend API error:', res.status, errText);
    throw new Error('Resend API returned ' + res.status);
  }
}

function buildWelcomeHtml(catedraPubs) {
  let html = '<h2>🔔 Cartelera UNLP</h2><p>¡Suscripción confirmada! Estas son las publicaciones recientes de tus cátedras:</p>';
  for (const [id, pubs] of Object.entries(catedraPubs)) {
    html += '<div style="margin-bottom:16px;padding:12px;background:#f5f5f5;border-radius:8px">';
    html += '<h3 style="margin:0 0 8px">Cátedra ' + escapeHtml(id) + '</h3><ul style="margin:0">';
    pubs.forEach(p => {
      html += '<li><strong>' + escapeHtml(p.title) + '</strong> — ' + escapeHtml(p.date) + '</li>';
    });
    html += '</ul></div>';
  }
  html += '<hr><p style="color:#888;font-size:12px">Para cancelar la suscripción, visita Cartelera UNLP y haz clic en "🔔 Notificarme".</p>';
  return html;
}
