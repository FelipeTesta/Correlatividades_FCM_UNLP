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
        const { email: rawEmail, codes, names, home } = body;
        if (!rawEmail || !codes || !Array.isArray(codes)) {
          return new Response(JSON.stringify({ error: 'email and codes[] required' }), {
            status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
        if (typeof rawEmail !== 'string') return new Response(JSON.stringify({error:'email must be a string'}), {status:400, headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
        const email = rawEmail.toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return new Response(JSON.stringify({ error: 'invalid email format' }), {
            status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
        // Store subscription first (always, even if welcome email fails)
        await env.CARTELERA_SUBS.put(email, JSON.stringify({ codes, names: names || {}, home: !!home }));

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

        // Fetch home general pubs if opted-in (initialize snapshot + welcome section)
        let homePubs = [];
        if (home) {
          try {
            homePubs = await fetchHomePubs();
            await env.CARTELERA_SNAPSHOTS.put('home', JSON.stringify(homePubs));
          } catch (e) {
            console.error('Welcome home fetch error: ' + e.message);
            homePubs = [];
          }
        }

        // Send welcome email (don't block if it fails)
        let welcomeEmailSent = false;
        if (Object.keys(catedraPubs).length > 0 || homePubs.length > 0) {
          try {
            const subject = '🔔 Cartelera UNLP - Suscripción confirmada';
            const html = buildWelcomeHtml(catedraPubs, names || {}, homePubs.slice(0, 5));
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

    // POST /test-send — send a test email to verify Resend works
    if (url.pathname === '/test-send' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { email: rawEmail } = body;
        if (!rawEmail) return new Response(JSON.stringify({ error: 'email required' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        const email = rawEmail.toLowerCase().trim();
        
        const subject = '🔔 Test - Cartelera UNLP';
        const html = '<h2>🔔 Cartelera UNLP</h2><p>Este es un email de prueba. Si lo recibes, las notificaciones por email funcionan correctamente.</p><p>Próximamente recibirás emails cuando haya nuevas publicaciones en tus cátedras suscritas.</p><hr><p style="color:#888;font-size:12px">Cartelera UNLP - Test</p>';
        
        await sendEmail(email, subject, html, env);
        return new Response(JSON.stringify({ ok: true, message: 'Test email sent to ' + email }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message }), {
          status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // GET /test-cron — diagnostic endpoint (simulates scheduled run, doesn't send emails)
    if (url.pathname === '/test-cron') {
      try {
        const results = [];
        let subsList;
        try { subsList = await env.CARTELERA_SUBS.list(); } catch (e) { throw new Error('KV list error: ' + e.message); }

        for (const key of subsList.keys) {
          const email = key.name;
          let codes = [];
          let names = {};
          try {
            const raw = await env.CARTELERA_SUBS.get(email);
            if (raw) {
              const subData = JSON.parse(raw);
              codes = Array.isArray(subData) ? subData : (subData.codes || []);
              names = Array.isArray(subData) ? {} : (subData.names || {});
            }
          } catch (e) { results.push({ email, error: 'KV get parse error: ' + e.message }); continue; }

          for (const catedraId of codes) {
            const info = { email, catedraId, name: (names || {})[catedraId] || 'unknown' };
            try {
              const pubs = await fetchCatedraPubs(catedraId);
              info.fetchedPubs = pubs.length;
              info.parseSuccess = true;

              const snapshotRaw = await env.CARTELERA_SNAPSHOTS.get(catedraId);
              const snapshot = snapshotRaw ? JSON.parse(snapshotRaw) : [];
              info.snapshotExists = !!snapshotRaw;
              info.snapshotPubs = snapshot.length;

              const newPubs = pubs.filter(p => !snapshot.some(s => s.title === p.title && s.date === p.date));
              info.newPubs = newPubs.length;
              info.newPubsTitles = newPubs.map(p => p.title + ' (' + p.date + ')');
            } catch (e) {
              info.error = e.message;
              info.parseSuccess = false;
            }
            results.push(info);
          }
        }

        // Home diagnostic (general faculty publications)
        try {
          const homePubs = await fetchHomePubs();
          const homeSnapshotRaw = await env.CARTELERA_SNAPSHOTS.get('home');
          const homeSnapshot = homeSnapshotRaw ? JSON.parse(homeSnapshotRaw) : [];
          const newHomePubs = homePubs.filter(p => !homeSnapshot.some(s => s.title === p.title && s.date === p.date));
          results.push({
            home: true,
            name: 'Avisos Generales de la Facultad',
            fetchedPubs: homePubs.length,
            parseSuccess: true,
            snapshotExists: !!homeSnapshotRaw,
            snapshotPubs: homeSnapshot.length,
            newPubs: newHomePubs.length,
            newPubsTitles: newHomePubs.map(p => p.title + ' (' + p.date + ')')
          });
        } catch (e) {
          results.push({ home: true, name: 'Avisos Generales de la Facultad', error: e.message, parseSuccess: false });
        }

        return new Response(JSON.stringify({
          ok: true,
          resendConfigured: !!env.RESEND_API_KEY,
          totalSubscriptions: subsList.keys.length,
          results
        }, null, 2), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message }), {
          status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // Default: proxy behavior (existing)
    const id = url.searchParams.get('id');
    const tag = url.searchParams.get('tag');
    if (!id) return new Response('missing id', { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    let target;
    if (id === 'home') {
      // Home: general faculty publications (not tied to a specific catedra)
      target = 'https://cartelera.med.unlp.edu.ar/';
    } else {
      target = `https://cartelera.med.unlp.edu.ar/catedra/${id}`;
      if (tag) target += `/etiqueta/${tag}`;
    }
    let html;
    try {
      html = await (await fetch(target)).text();
    } catch (err) {
      return new Response('proxy error: ' + (err.message || 'fetch failed'), {status:502, headers:{'Access-Control-Allow-Origin':'*','Content-Type':'text/plain'}});
    }
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

    // Build catedraID -> [emails] map + home opted-in emails
    const catedraEmails = {};
    const catedraNames = {};
    const homeEmails = [];
    for (const key of subsList.keys) {
      const email = key.name;
      let codes = [];
      let names = {};
      let home = false;
      try {
        const raw = await env.CARTELERA_SUBS.get(email);
        if (raw) {
          const subData = JSON.parse(raw);
          codes = Array.isArray(subData) ? subData : (subData.codes || []);
          names = Array.isArray(subData) ? {} : (subData.names || {});
          home = !Array.isArray(subData) && !!subData.home;
        }
      } catch (e) { console.error('KV get error for ' + email + ': ' + e.message); continue; }
      if (home) homeEmails.push(email);
      codes.forEach(id => {
        if (!catedraEmails[id]) catedraEmails[id] = [];
        catedraEmails[id].push(email);
        if (!catedraNames[id] && names[id]) catedraNames[id] = names[id];
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
          const displayName = catedraNames[id] || ('Cátedra ' + id);
          const subject = 'Nueva publicación en ' + displayName + ' - Cartelera UNLP';
          const html = '<h2>🔔 Cartelera UNLP</h2><p>Nuevas publicaciones en <strong>' + escapeHtml(displayName) + '</strong>:</p><ul>' +
            newPubs.map(p => {
              const pubLink = p.link ? (p.link.startsWith('http') ? p.link : 'https://cartelera.med.unlp.edu.ar' + p.link) : null;
              const titleHtml = pubLink
                ? '<a href="' + escapeHtml(pubLink) + '" style="color:#0066cc;text-decoration:none"><strong>' + escapeHtml(p.title) + '</strong></a>'
                : '<strong>' + escapeHtml(p.title) + '</strong>';
              return '<li>' + titleHtml + ' — ' + escapeHtml(p.date) + '</li>';
            }).join('') +
            '</ul><p><a href="https://cartelera.med.unlp.edu.ar/catedra/' + escapeHtml(id) + '">Ver cartelera completa</a></p>' +
            '<hr><p style="color:#888;font-size:12px">Para cancelar la suscripción, visita <a href="https://felipetesta.github.io/Correlatividades_FCM_UNLP/cartelera.html" style="color:#0066cc">Cartelera UNLP</a> y mantén presionado el botón "Remover mi email".</p>';

          let anyEmailSent = false;
          for (const email of emails) {
            try {
              await sendEmail(email, subject, html, env);
              anyEmailSent = true;
            } catch (e) {
              console.error('Email send failed for ' + email + ': ' + e.message);
            }
          }

          // Only update snapshot if at least one email was delivered
          if (anyEmailSent) {
            await env.CARTELERA_SNAPSHOTS.put(id, JSON.stringify(pubs));
          } else {
            console.error('All emails failed for catedra ' + id + ', snapshot NOT updated — will retry next cron');
          }
        }
      } catch (e) {
        console.error('Error checking catedra ' + id + ': ' + e.message);
      }
    }

    // 3. Home general publications (fetched once, sent to opted-in subscribers)
    if (homeEmails.length > 0) {
      try {
        const homePubs = await fetchHomePubs();
        const homeSnapshotRaw = await env.CARTELERA_SNAPSHOTS.get('home');
        const homeSnapshot = homeSnapshotRaw ? JSON.parse(homeSnapshotRaw) : [];
        const newHomePubs = homePubs.filter(p =>
          !homeSnapshot.some(s => s.title === p.title && s.date === p.date)
        );

        if (newHomePubs.length > 0) {
          const subject = 'Nueva publicación general en la Facultad - Cartelera UNLP';
          const html = '<h2>🔔 Cartelera UNLP</h2><p>Nuevas publicaciones generales de la Facultad:</p>' +
            buildHomeEmailSection(newHomePubs) +
            '<p><a href="https://cartelera.med.unlp.edu.ar/">Ver cartelera completa</a></p>' +
            '<hr><p style="color:#888;font-size:12px">Para cancelar la suscripción, visita <a href="https://felipetesta.github.io/Correlatividades_FCM_UNLP/cartelera.html" style="color:#0066cc">Cartelera UNLP</a> y mantén presionado el botón "Remover mi email".</p>';

          let anyHomeEmailSent = false;
          for (const email of homeEmails) {
            try {
              await sendEmail(email, subject, html, env);
              anyHomeEmailSent = true;
            } catch (e) {
              console.error('Home email send failed for ' + email + ': ' + e.message);
            }
          }

          // Only update snapshot if at least one email was delivered
          if (anyHomeEmailSent) {
            await env.CARTELERA_SNAPSHOTS.put('home', JSON.stringify(homePubs));
          } else {
            console.error('All home emails failed, snapshot NOT updated — will retry next cron');
          }
        }
      } catch (e) {
        console.error('Error checking home publications: ' + e.message);
      }
    }
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function parseCatedraHtml(html) {
  const results = [];
  // Split by ribbon-wrapper card blocks
  const blocks = html.split(/class="ribbon-wrapper card"/);
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    // Extract title + link: href and text inside first <a> within card-title
    const titleMatch = block.match(/class="card-title"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/);
    const link = titleMatch ? titleMatch[1].trim() : '';
    const title = titleMatch ? titleMatch[2].replace(/<[^>]*>/g, '').trim() : '';
    // Extract date: text after fa-calendar-alt </i>
    const dateMatch = block.match(/fa-calendar-alt[^>]*><\/i>\s*([^<]+)/);
    const dateStr = dateMatch ? dateMatch[1].trim() : '';
    if (title && dateStr) {
      results.push({ title, date: dateStr, link });
    }
  }
  return results;
}

async function fetchCatedraPubs(id) {
  const url = `https://cartelera.med.unlp.edu.ar/catedra/${id}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('Upstream HTTP ' + r.status);
  const html = await r.text();
  return parseCatedraHtml(html);
}

function parseHomeHtml(html) {
  const results = [];
  // Home uses .card.card-outline-success (NOT .ribbon-wrapper.card)
  const blocks = html.split(/class="card card-outline-success"/);
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    // Title + link (href=/noticia/N)
    const titleMatch = block.match(/class="card-title"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/);
    const link = titleMatch ? titleMatch[1].trim() : '';
    const title = titleMatch ? titleMatch[2].replace(/<[^>]*>/g, '').trim() : '';
    // Date inside .card-header h5 after fa-calendar-alt </i>
    const dateMatch = block.match(/fa-calendar-alt[^>]*><\/i>\s*([^<]+)/);
    const dateStr = dateMatch ? dateMatch[1].trim() : '';
    // Subtitle
    let subtitle = '';
    const subMatch = block.match(/class="card-subtitle[^>]*>([^<]*)/);
    if (subMatch) subtitle = subMatch[1].trim();
    // Author (department)
    let professor = '';
    const profMatch = block.match(/class="card-text text-right"[^>]*>\s*([^<]+)/);
    if (profMatch) professor = profMatch[1].trim();
    if (title && dateStr) {
      results.push({ title, date: dateStr, link, subtitle, professor });
    }
  }
  return results;
}

async function fetchHomePubs() {
  const url = 'https://cartelera.med.unlp.edu.ar/';
  const r = await fetch(url);
  if (!r.ok) throw new Error('Upstream HTTP ' + r.status);
  const html = await r.text();
  return parseHomeHtml(html);
}

function buildHomeEmailSection(homePubs) {
  if (!homePubs || homePubs.length === 0) return '';
  let html = '<div style="margin-bottom:16px;padding:12px;background:#f0f4ff;border-radius:8px">';
  html += '<h3 style="margin:0 0 8px">🏛 Avisos Generales de la Facultad</h3><ul style="margin:0">';
  homePubs.forEach(p => {
    const pubLink = p.link ? (p.link.startsWith('http') ? p.link : 'https://cartelera.med.unlp.edu.ar' + p.link) : null;
    const titleHtml = pubLink
      ? '<a href="' + escapeHtml(pubLink) + '" style="color:#0066cc;text-decoration:none"><strong>' + escapeHtml(p.title) + '</strong></a>'
      : '<strong>' + escapeHtml(p.title) + '</strong>';
    html += '<li>' + titleHtml + ' — ' + escapeHtml(p.date) + '</li>';
  });
  html += '</ul></div>';
  return html;
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

function buildWelcomeHtml(catedraPubs, names, homePubs) {
  let html = '<h2>🔔 Cartelera UNLP</h2><p>¡Suscripción confirmada! Estas son las publicaciones recientes de tus cátedras:</p>';
  if (homePubs && homePubs.length > 0) {
    html += buildHomeEmailSection(homePubs);
  }
  for (const [id, pubs] of Object.entries(catedraPubs)) {
    const displayName = names[id] || ('Cátedra ' + id);
    html += '<div style="margin-bottom:16px;padding:12px;background:#f5f5f5;border-radius:8px">';
    html += '<h3 style="margin:0 0 8px">' + escapeHtml(displayName) + '</h3><ul style="margin:0">';
    pubs.forEach(p => {
      const pubLink = p.link ? (p.link.startsWith('http') ? p.link : 'https://cartelera.med.unlp.edu.ar' + p.link) : null;
      const titleHtml = pubLink
        ? '<a href="' + escapeHtml(pubLink) + '" style="color:#0066cc;text-decoration:none"><strong>' + escapeHtml(p.title) + '</strong></a>'
        : '<strong>' + escapeHtml(p.title) + '</strong>';
      html += '<li>' + titleHtml + ' — ' + escapeHtml(p.date) + '</li>';
    });
    html += '</ul></div>';
  }
  html += '<hr><p style="color:#888;font-size:12px">Para cancelar la suscripción, visita <a href="https://felipetesta.github.io/Correlatividades_FCM_UNLP/cartelera.html" style="color:#0066cc">Cartelera UNLP</a> y mantén presionado el botón "Remover mi email".</p>';
  return html;
}
