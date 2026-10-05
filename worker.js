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
        const { email: rawEmail, codes, names, home, update } = body;
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

        // UPDATE MODE — diff existing subscription, init snapshots for added only
        if (update) {
          const oldSub = await env.CARTELERA_SUBS.get(email, { type: 'json' });
          if (oldSub) {
            const oldCodes = Array.isArray(oldSub) ? oldSub : (oldSub.codes || []);
            const oldSet = new Set(oldCodes);
            const newSet = new Set(codes);
            const addedCodes = codes.filter(c => !oldSet.has(c));
            const removedCodes = oldCodes.filter(c => !newSet.has(c));

            // Overwrite KV with new subscription
            await env.CARTELERA_SUBS.put(email, JSON.stringify({ codes, names: names || {}, home: !!home }));

            // Initialize snapshots for added catedras only (parallel)
            await Promise.allSettled(addedCodes.map(async (id) => {
              try {
                const pubs = await fetchCatedraPubs(id);
                await env.CARTELERA_SNAPSHOTS.put(id, JSON.stringify(pubs));
              } catch (e) {
                console.error('Update snapshot init error for catedra ' + id + ': ' + e.message);
              }
            }));

            // Send short update email only if new catedras were added
            if (addedCodes.length > 0) {
              try {
                const subject = '🔔 Cartelera UNLP - Cátedras agregadas';
                const html = buildUpdateEmailHtml(addedCodes, names || {});
                await sendEmail(email, subject, html, env);
              } catch (e) {
                console.error('Update email send failed: ' + e.message);
              }
            }

            return new Response(JSON.stringify({ ok: true, welcomeEmailSent: false, updateMode: true, addedCount: addedCodes.length }), {
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
          }
          // If oldSub is null (first time), fall through to normal subscribe below
        }

        // Store subscription first (always, even if welcome email fails)
        await env.CARTELERA_SUBS.put(email, JSON.stringify({ codes, names: names || {}, home: !!home }));

        // Fetch latest pubs per catedra + initialize snapshots (parallel)
        const catedraPubs = {};
        await Promise.allSettled(codes.map(async (id) => {
          try {
            const pubs = await fetchCatedraPubs(id);
            const latest5 = pubsFromLastMonths(pubs, 12, 5);
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
            const html = buildWelcomeHtml(catedraPubs, names || {}, pubsFromLastMonths(homePubs, 12, 5));
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
      return new Response(JSON.stringify({ ok: true, cron: '0 12,16,22 * * *' }), {
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

              const newPubs = pubs.filter(p => !snapshot.some(s => s.title === p.title && s.date === p.date && s.modified === p.modified));
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
          const newHomePubs = homePubs.filter(p => !homeSnapshot.some(s => s.title === p.title && s.date === p.date && s.modified === p.modified));
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

    // GET /test-edits — diagnostic for modification date tracking
    if (url.pathname === '/test-edits') {
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
              info.pubsWithMod = pubs.filter(p => p.modified).length;

              const snapshotRaw = await env.CARTELERA_SNAPSHOTS.get(catedraId);
              const snapshot = snapshotRaw ? JSON.parse(snapshotRaw) : [];
              info.snapshotExists = !!snapshotRaw;

              // Find pubs where modified changed
              const modifiedChanged = pubs.filter(p => {
                if (!p.modified) return false;
                const old = snapshot.find(s => s.title === p.title && s.date === p.date);
                return !old || old.modified !== p.modified;
              });
              info.modifiedChanged = modifiedChanged.length;
              info.modifiedChangedDetails = modifiedChanged.map(p => ({
                title: p.title,
                date: p.date,
                currentModified: p.modified,
                oldModified: (snapshot.find(s => s.title === p.title && s.date === p.date) || {}).modified || null
              }));
            } catch (e) {
              info.error = e.message;
            }
            results.push(info);
          }
        }

        // Home diagnostic
        try {
          const homePubs = await fetchHomePubs();
          const homeSnapshotRaw = await env.CARTELERA_SNAPSHOTS.get('home');
          const homeSnapshot = homeSnapshotRaw ? JSON.parse(homeSnapshotRaw) : [];
          const homeModifiedChanged = homePubs.filter(p => {
            if (!p.modified) return false;
            const old = homeSnapshot.find(s => s.title === p.title && s.date === p.date);
            return !old || old.modified !== p.modified;
          });
          results.push({
            home: true,
            name: 'Avisos Generales de la Facultad',
            fetchedPubs: homePubs.length,
            pubsWithMod: homePubs.filter(p => p.modified).length,
            snapshotExists: !!homeSnapshotRaw,
            modifiedChanged: homeModifiedChanged.length,
            modifiedChangedDetails: homeModifiedChanged.map(p => ({
              title: p.title,
              date: p.date,
              currentModified: p.modified,
              oldModified: (homeSnapshot.find(s => s.title === p.title && s.date === p.date) || {}).modified || null
            }))
          });
        } catch (e) {
          results.push({ home: true, name: 'Avisos Generales de la Facultad', error: e.message });
        }

        return new Response(JSON.stringify({ ok: true, results }, null, 2), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message }), {
          status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // POST /heartbeat — track online session + daily visit count
    // Single request: the response already carries {online, visits} for the badge.
    if (url.pathname === '/heartbeat' && request.method === 'POST') {
      try {
        const { sessionId } = await request.json();
        if (!sessionId || typeof sessionId !== 'string') {
          return new Response(JSON.stringify({ error: 'sessionId required' }), {
            status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
        // Presence lives in D1 (KV free tier allows only 1k writes/day — a 30s/tab
        // heartbeat exhausted it). Row expires 3 min after the last beat (poll: 60s + grace).
        try {
          const expiresAt = Date.now() + 180000;
          await env.DB.prepare('INSERT INTO presence(session_id, expires_at) VALUES(?, ?) ON CONFLICT(session_id) DO UPDATE SET expires_at = excluded.expires_at')
            .bind(sessionId, expiresAt).run();
        } catch (dbe) {
          console.error('D1 presence upsert error: ' + dbe.message);
          // Fallback: legacy KV presence (60s TTL) so the badge keeps working
          await env.CARTELERA_SUBS.put('online:' + sessionId, '1', { expirationTtl: 60 });
        }
        // Count unique visitors per DEVICE (IP), not per browser session.
        // Cross-browser dedup: same IP any browser = 1 count/day.
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const clientIp = request.headers.get('cf-connecting-ip') || '';
        const ip = clientIp || ('sess-' + sessionId);
        const ADMIN_IPS = ['192.168.0.27', '190.17.188.134'];
        const isAdmin = ADMIN_IPS.includes(clientIp);
        if (!isAdmin) {
          // Serialize the first-increment per ip+date via Cache API lock (1h TTL).
          // KV read-then-write is not atomic; two concurrent heartbeats would double-count.
          // The 1h TTL also means `visited:` is re-read ~once/hour/device, not on every beat.
          const lockKey = new Request('https://visit-lock/' + ip + '/' + today);
          const cache = caches.default;
          const haveLock = await cache.match(lockKey);
          if (!haveLock) {
            await cache.put(lockKey, new Response('locked', { headers: { 'Cache-Control': 'max-age=3600' } }));
            const visitedKey = 'visited:' + ip + ':' + today;
            const alreadyVisited = await env.CARTELERA_SUBS.get(visitedKey);
            if (!alreadyVisited) {
              // First device access today — increment daily counter
              const visitKey = 'visits:' + today;
              const current = await env.CARTELERA_SUBS.get(visitKey);
              const count = current ? parseInt(current, 10) + 1 : 1;
              await env.CARTELERA_SUBS.put(visitKey, String(count), { expirationTtl: 172800 }); // 48h TTL
              // Mark this device as counted for today (48h TTL)
              await env.CARTELERA_SUBS.put(visitedKey, '1', { expirationTtl: 172800 });
            }
          }
        }
        // Counts come from the shared 60s memo — no per-tab KV list/read
        const counts = await getCounts(env);
        return new Response(JSON.stringify({ ok: true, online: counts.online, visits: counts.visits }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // GET /online — return online count + daily visits (kept for cached pages; memoized)
    if (url.pathname === '/online') {
      try {
        const counts = await getCounts(env);
        return new Response(JSON.stringify(counts), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ online: 0, visits: 0, error: e.message }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // POST /reset-visits — reset today's visit counter (admin only)
    if (url.pathname === '/reset-visits' && request.method === 'POST') {
      try {
        const today = new Date().toISOString().slice(0, 10);
        await env.CARTELERA_SUBS.delete('visits:' + today);
        const visitedList = await env.CARTELERA_SUBS.list({ prefix: 'visited:' });
        for (const key of visitedList.keys) {
          if (key.name.endsWith(':' + today)) {
            await env.CARTELERA_SUBS.delete(key.name);
          }
        }
        return new Response(JSON.stringify({ ok: true, resetDate: today }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // GET /test-finales — diagnostic endpoint for finales monitoring
    if (url.pathname === '/test-finales') {
      try {
        const html = await fetchFinalesTable();
        const newData = parseFinalesHtml(html);
        const newHash = computeFinalesHash(newData);
        const snapshotRaw = await env.CARTELERA_SUBS.get('finale-snapshot');
        const snapshot = snapshotRaw ? JSON.parse(snapshotRaw) : { hash: null, data: {} };
        const changes = snapshot.data ? diffFinales(snapshot.data, newData) : { added: Object.keys(newData).map(k => ({ name: k, dates: newData[k] })), removed: [], modified: [] };

        return new Response(JSON.stringify({
          ok: true,
          resendConfigured: !!env.RESEND_API_KEY,
          currentHash: newHash,
          storedHash: snapshot.hash || null,
          hasChanges: snapshot.hash !== newHash,
          totalSubjects: Object.keys(newData).length,
          changes: {
            added: changes.added.length,
            modified: changes.modified.length,
            removed: changes.removed.length
          },
          subjects: Object.keys(newData).sort()
        }, null, 2), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message }), {
          status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // POST /test-finales-send — force send finales email (diagnostic)
    if (url.pathname === '/test-finales-send' && request.method === 'POST') {
      try {
        const result = await checkFinales(env);
        return new Response(JSON.stringify({ ok: true, ...result }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message }), {
          status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // GET /test-inscripciones — diagnostic for inscripciones pages monitoring (no email)
    if (url.pathname === '/test-inscripciones') {
      try {
        const results = [];
        for (const page of INSCRIPCIONES_PAGES) {
          const info = { id: page.id, label: page.label, url: page.url };
          try {
            const html = await fetchPage(page.url);
            const lines = extractPageTextLines(html);
            const hash = computeSimpleHash(lines.join('\n'));
            const snapRaw = await env.CARTELERA_SUBS.get('inscripciones-snapshot');
            const snap = snapRaw ? JSON.parse(snapRaw) : {};
            const oldLines = (snap[page.id] && snap[page.id].lines) || [];
            info.lineCount = lines.length;
            info.currentHash = hash;
            info.storedHash = (snap[page.id] && snap[page.id].hash) || null;
            info.hasChanges = info.storedHash !== hash;
            info.added = lines.filter(l => !oldLines.includes(l)).slice(0, 10);
            info.removed = oldLines.filter(l => !lines.includes(l)).slice(0, 10);
          } catch (e) {
            info.error = e.message;
          }
          results.push(info);
        }
        return new Response(JSON.stringify({ ok: true, resendConfigured: !!env.RESEND_API_KEY, results }, null, 2), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message }), {
          status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // POST /test-inscripciones-send — force send inscripciones email (diagnostic)
    if (url.pathname === '/test-inscripciones-send' && request.method === 'POST') {
      try {
        const result = await checkInscripciones(env);
        return new Response(JSON.stringify({ ok: true, ...result }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
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
    const upstreamController = new AbortController();
    const upstreamTimeout = setTimeout(() => upstreamController.abort(), 15000); // mirror client-side 15s timeout
    try {
      const upstreamRes = await fetch(target, { signal: upstreamController.signal });
      html = await upstreamRes.text();
    } catch (err) {
      if (err.name === 'AbortError') {
        return new Response(JSON.stringify({ error: 'upstream timeout after 15s' }), {status:504, headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
      }
      return new Response('proxy error: ' + (err.message || 'fetch failed'), {status:502, headers:{'Access-Control-Allow-Origin':'*','Content-Type':'text/plain'}});
    } finally {
      clearTimeout(upstreamTimeout);
    }
    return new Response(html, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/html; charset=utf-8'
      }
    });
  },

  async scheduled(event, env, ctx) {
    // 1. List all subscriptions → build email→{codes,names,home} map
    //    listAllKeys() follows KV pagination (a single list() truncates at 1000 keys);
    //    internal keys (online:/visited:/visits:) are skipped — KV list returns everything.
    let allKeys;
    try { allKeys = await listAllKeys(env); } catch (e) { console.error('KV list error: ' + e.message); return; }

    const emailMap = {}; // email → {codes: [], names: {}, home: false}
    for (const key of allKeys) {
      const email = key.name;
      if (email.includes(':')) continue; // internal (non-subscription) key
      try {
        const raw = await env.CARTELERA_SUBS.get(email);
        if (!raw) continue;
        const subData = JSON.parse(raw);
        const codes = Array.isArray(subData) ? subData : (subData.codes || []);
        const names = Array.isArray(subData) ? {} : (subData.names || {});
        const home = !Array.isArray(subData) && !!subData.home;
        emailMap[email] = { codes: [...new Set(codes)], names, home }; // dedup codes
      } catch (e) { console.error('KV get error for ' + email + ': ' + e.message); }
    }

    // Collect unique catedra IDs + names + home-emails
    const catedraIds = new Set();
    const catedraNames = {}; // id → name (first-wins)
    const homeEmails = [];
    for (const [email, data] of Object.entries(emailMap)) {
      if (data.home) homeEmails.push(email);
      data.codes.forEach(id => {
        catedraIds.add(id);
        if (!catedraNames[id] && data.names[id]) catedraNames[id] = data.names[id];
      });
    }

    // 2. Fetch all catedras in parallel
    const fetchPromises = Array.from(catedraIds).map(async (id) => {
      try {
        const pubs = await fetchCatedraPubs(id);
        const snapshotRaw = await env.CARTELERA_SNAPSHOTS.get(id);
        const snapshot = snapshotRaw ? JSON.parse(snapshotRaw) : [];
        const newPubs = pubs.filter(p =>
          !snapshot.some(s => s.title === p.title && s.date === p.date && s.modified === p.modified)
        );
        return { id, displayName: catedraNames[id] || ('Cátedra ' + id), newPubs, allPubs: pubs, ok: true };
      } catch (e) {
        console.error('Error checking catedra ' + id + ': ' + e.message);
        return { id, displayName: catedraNames[id] || ('Cátedra ' + id), newPubs: [], allPubs: [], ok: false };
      }
    });
    const catedraResults = await Promise.allSettled(fetchPromises);

    // Flatten results into lookup map (only successful fetches)
    const catedraData = {};
    for (const result of catedraResults) {
      if (result.status === 'fulfilled' && result.value.ok) {
        catedraData[result.value.id] = result.value;
      }
    }

    // 3. Fetch home pubs (if any subscribers opted in)
    let homeData = null;
    if (homeEmails.length > 0) {
      try {
        const homePubs = await fetchHomePubs();
        const homeSnapshotRaw = await env.CARTELERA_SNAPSHOTS.get('home');
        const homeSnapshot = homeSnapshotRaw ? JSON.parse(homeSnapshotRaw) : [];
        const newHomePubs = homePubs.filter(p =>
          !homeSnapshot.some(s => s.title === p.title && s.date === p.date && s.modified === p.modified)
        );
        homeData = { newPubs: newHomePubs, allPubs: homePubs };
      } catch (e) { console.error('Error checking home publications: ' + e.message); }
    }

    // 4. Build per-email consolidated sections → send ONE email per user
    const catedraDelivered = {}; // id → count of successful email deliveries including this catedra (or 'home')
    const catedraFailed = {};    // id → count of failed email deliveries including this catedra (or 'home')

    const emailTasks = Object.entries(emailMap).map(async ([email, data]) => {
      const sections = [];

      // Gather new pubs per catedra for this email
      data.codes.forEach(id => {
        const cd = catedraData[id];
        if (cd && cd.newPubs.length > 0) {
          sections.push({ type: 'catedra', displayName: cd.displayName, id, newPubs: cd.newPubs });
        }
      });

      // Home section
      if (data.home && homeData && homeData.newPubs.length > 0) {
        sections.push({ type: 'home', newPubs: homeData.newPubs });
      }

      if (sections.length === 0) return; // nothing new for this email

      // Build consolidated HTML
      const subject = '🔔 Nuevas publicaciones - Cartelera UNLP';
      let html = '<h2>🔔 Cartelera UNLP</h2><p>Nuevas publicaciones en tus cátedras suscritas:</p>';

      sections.forEach(sec => {
        if (sec.type === 'home') {
          html += buildHomeEmailSection(sec.newPubs);
        } else {
          html += '<div style="margin-bottom:16px;padding:12px;background:#f5f5f5;border-radius:8px">';
          html += '<h3 style="margin:0 0 8px">' + escapeHtml(sec.displayName) + '</h3><ul style="margin:0">';
          sec.newPubs.forEach(p => {
            const pubLink = p.link ? (p.link.startsWith('http') ? p.link : 'https://cartelera.med.unlp.edu.ar' + p.link) : null;
            const titleHtml = pubLink
              ? '<a href="' + escapeHtml(pubLink) + '" style="color:#0066cc;text-decoration:none"><strong>' + escapeHtml(p.title) + '</strong></a>'
              : '<strong>' + escapeHtml(p.title) + '</strong>';
            var dateDisplay = escapeHtml(p.date);
            if (p.modified) {
              dateDisplay = escapeHtml(p.date) + ' &rarr; Modificada en ' + escapeHtml(p.modified);
            }
            html += '<li>' + titleHtml + ' — ' + dateDisplay + '</li>';
          });
          html += '</ul><p><a href="https://cartelera.med.unlp.edu.ar/catedra/' + escapeHtml(sec.id) + '">Ver cartelera completa</a></p></div>';
        }
      });

      html += '<hr><p style="color:#888;font-size:12px">Para cancelar la suscripción, visita <a href="https://felipetesta.github.io/Correlatividades_FCM_UNLP/cartelera.html" style="color:#0066cc">Cartelera UNLP</a> y mantén presionado el botón "Remover mi email".</p>';

      try {
        await sendEmail(email, subject, html, env);
        // Count successful deliveries per catedra/home
        sections.forEach(sec => {
          const key = sec.type === 'home' ? 'home' : sec.id;
          catedraDelivered[key] = (catedraDelivered[key] || 0) + 1;
        });
      } catch (e) {
        console.error('Email send failed for ' + email + ': ' + e.message);
        // Count failures so affected snapshots are NOT updated (retry next cron)
        sections.forEach(sec => {
          const key = sec.type === 'home' ? 'home' : sec.id;
          catedraFailed[key] = (catedraFailed[key] || 0) + 1;
        });
      }
    });

    await Promise.allSettled(emailTasks);

    // 5. Update snapshots ONLY for catedras where EVERY email delivered successfully.
    // If ANY email failed, skip that snapshot so failed users retry next cron
    // (already-notified users may receive duplicates — accepted trade-off).
    const snapshotTasks = [];
    for (const [id, cd] of Object.entries(catedraData)) {
      if ((catedraDelivered[id] || 0) > 0 && (catedraFailed[id] || 0) === 0 && cd.allPubs.length > 0) {
        snapshotTasks.push(env.CARTELERA_SNAPSHOTS.put(id, JSON.stringify(cd.allPubs)));
      }
    }
    if ((catedraDelivered['home'] || 0) > 0 && (catedraFailed['home'] || 0) === 0 && homeData && homeData.allPubs.length > 0) {
      snapshotTasks.push(env.CARTELERA_SNAPSHOTS.put('home', JSON.stringify(homeData.allPubs)));
    }
    await Promise.allSettled(snapshotTasks);

    // 6. Persist daily stats to D1 (historical record)
    if (env.DB) {
      try {
        const today = new Date().toISOString().slice(0, 10);
        // Current online sessions = live presence rows (D1)
        let maxOnline = 0;
        try {
          const r = await env.DB.prepare('SELECT COUNT(*) AS n FROM presence WHERE expires_at > ?').bind(Date.now()).first();
          if (r && typeof r.n === 'number') maxOnline = r.n;
        } catch (e) { console.error('D1 presence count error: ' + e.message); }
        // Get today's visit count
        const visitRaw = await env.CARTELERA_SUBS.get('visits:' + today);
        const totalVisits = visitRaw ? parseInt(visitRaw, 10) : 0;
        // Upsert into D1
        await env.DB.prepare(
          'INSERT INTO daily_stats (date, total_visits, max_online) VALUES (?, ?, ?) ON CONFLICT(date) DO UPDATE SET total_visits = excluded.total_visits, max_online = MAX(daily_stats.max_online, excluded.max_online)'
        ).bind(today, totalVisits, maxOnline).run();
      } catch (e) {
        console.error('D1 stats error: ' + e.message);
      }
      // Cleanup: purge expired presence rows (cron runs 3x/day)
      try {
        await env.DB.prepare('DELETE FROM presence WHERE expires_at < ?').bind(Date.now()).run();
      } catch (e) {
        console.error('D1 presence cleanup error: ' + e.message);
      }
    }

    // 7. Finales check — 1st and 15th of each month only
    const checkDay = new Date().getUTCDate();
    if (checkDay === 1 || checkDay === 15) {
      try {
        await checkFinales(env);
      } catch (e) {
        console.error('Finales cron check error: ' + e.message);
      }
    }

    // 8. Inscripciones pages check — 1st of each month only
    if (checkDay === 1) {
      try {
        await checkInscripciones(env);
      } catch (e) {
        console.error('Inscripciones cron check error: ' + e.message);
      }
    }
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Shared counts for the online badge, memoized 60s in the Cache API (per colo).
// Counts change slowly — this collapses reads across ALL open tabs into ~1/min globally.
async function getCounts(env) {
  const memoReq = new Request('https://counts-memo/online');
  const cache = caches.default;
  try {
    const memo = await cache.match(memoReq);
    if (memo) {
      const data = await memo.json();
      if (data && typeof data.online === 'number') return data;
    }
  } catch (e) { /* memo miss — recompute */ }
  let online = 0;
  try {
    const r = await env.DB.prepare('SELECT COUNT(*) AS n FROM presence WHERE expires_at > ?').bind(Date.now()).first();
    if (r && typeof r.n === 'number') online = r.n;
  } catch (e) {
    console.error('D1 presence count error: ' + e.message);
    // Fallback: legacy KV presence keys (only written when the D1 upsert fails)
    try {
      const onlineList = await env.CARTELERA_SUBS.list({ prefix: 'online:' });
      online = onlineList.keys.length;
    } catch (e2) { console.error('KV online fallback error: ' + e2.message); }
  }
  let visits = 0;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const visitRaw = await env.CARTELERA_SUBS.get('visits:' + today);
    visits = visitRaw ? parseInt(visitRaw, 10) : 0;
  } catch (e) { console.error('KV visits read error: ' + e.message); }
  const data = { online, visits };
  try {
    await cache.put(memoReq, new Response(JSON.stringify(data), { headers: { 'Cache-Control': 'max-age=60' } }));
  } catch (e) { /* cache write failure is non-fatal */ }
  return data;
}

// List ALL keys in CARTELERA_SUBS, following KV pagination
// (a single list() call silently truncates at 1000 keys).
async function listAllKeys(env) {
  const keys = [];
  let cursor;
  while (true) {
    const opts = cursor ? { cursor } : {};
    const page = await env.CARTELERA_SUBS.list(opts);
    keys.push(...page.keys);
    if (page.list_complete || !page.cursor) break;
    cursor = page.cursor;
  }
  return keys;
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
    // Extract modification text+time
    let modified = null;
    const modMatch = block.match(/text-muted[^>]*>\s*\*\s*Modificad[ao]\s+el\s+d[ií]a\s+(\d{2}\/\d{2}\/\d{4})\s*(\d{1,2}):(\d{2})?/i);
    if (modMatch) {
      modified = modMatch[1] + ' ' + (modMatch[2]||'00') + ':' + (modMatch[3]||'00');
    }
    if (title && dateStr) {
      const pub = { title, date: dateStr, link };
      if (modified) pub.modified = modified;
      results.push(pub);
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
    // Modification text+time
    let modified = null;
    const modMatch = block.match(/text-muted[^>]*>\s*\*\s*Modificad[ao]\s+el\s+d[ií]a\s+(\d{2}\/\d{2}\/\d{4})\s*(\d{1,2}):(\d{2})?/i);
    if (modMatch) {
      modified = modMatch[1] + ' ' + (modMatch[2]||'00') + ':' + (modMatch[3]||'00');
    }
    if (title && dateStr) {
      const pub = { title, date: dateStr, link, subtitle, professor };
      if (modified) pub.modified = modified;
      results.push(pub);
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
    var dateDisplay = escapeHtml(p.date);
    if (p.modified) {
      dateDisplay = escapeHtml(p.date) + ' &rarr; Modificada en ' + escapeHtml(p.modified);
    }
    html += '<li>' + titleHtml + ' — ' + dateDisplay + '</li>';
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

function parsePubDate(str) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(str || '');
  if (!m) return null;
  const day = parseInt(m[1], 10), month = parseInt(m[2], 10) - 1, year = parseInt(m[3], 10);
  const d = new Date(year, month, day);
  if (isNaN(d.getTime())) return null;
  return d;
}

function pubsFromLastMonths(pubs, months = 12, count = 5) {
  if (!pubs || pubs.length === 0) return [];
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  const out = [];
  for (const p of pubs) {
    if (out.length >= count) break;
    const d = parsePubDate(p.date);
    if (!d || d >= cutoff) {
      out.push(p);
    }
  }
  return out;
}

function buildUpdateEmailHtml(addedCodes, names) {
  let html = '<h2>🔔 Cartelera UNLP</h2><p>Se agregaron nuevas cátedras a tu suscripción:</p><ul>';
  addedCodes.forEach(code => {
    html += '<li>' + escapeHtml(names[code] || code) + '</li>';
  });
  html += '</ul><p>Recibirás notificaciones cuando haya nuevas publicaciones en estas cátedras.</p>';
  html += '<hr><p style="color:#888;font-size:12px">Para cancelar la suscripción, visita <a href="https://felipetesta.github.io/Correlatividades_FCM_UNLP/cartelera.html" style="color:#0066cc">Cartelera UNLP</a> y mantén presionado el botón "Remover mi email".</p>';
  return html;
}

// ─── Finales Monitoring ───────────────────────────────────────────────

const FINALES_URL = 'https://www.med.unlp.edu.ar/index.php/estudiantes/fechas-de-finales?catid=441&id=1018&view=article';
const FINALES_ADMIN_EMAIL = 'felipetesta@gmail.com';
const MONTH_MAP = { 'Ago': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dic': '12' };

function parseFinalesHtml(html) {
  const result = {};
  // Split by <tr> rows in tbody
  const rows = html.split(/<tr[^>]*>/i);
  for (const row of rows) {
    // Extract subject name from <td class='asig'>
    const nameMatch = row.match(/class=['"]asig['"][^>]*>\s*([^<]+)/i);
    if (!nameMatch) continue;
    const subjectName = nameMatch[1].replace(/&aacute;/g, 'á').replace(/&eacute;/g, 'é')
      .replace(/&iacute;/g, 'í').replace(/&oacute;/g, 'ó').replace(/&uacute;/g, 'ú')
      .replace(/&ntilde;/g, 'ñ').replace(/&#(\d+);/g, (_, c) => String.fromCharCode(c))
      .trim();
    if (!subjectName) continue;

    // Extract all date cells (DD/MM format or - - -)
    const cells = [...row.matchAll(/<td[^>]*>\s*(.*?)\s*<\/td>/gi)];
    const dates = [];
    const monthOrder = ['Ago', 'Sep', 'Oct', 'Nov', 'Dic']; // headers from table
    let dicTurno = 0;

    for (const cell of cells) {
      const val = cell[1].replace(/<[^>]*>/g, '').trim();
      if (!val || val === '- - -') {
        // Track Dic turns (two cells for Dic)
        if (monthOrder.length > 0 && monthOrder[monthOrder.length - 1] === 'Dic') {
          dicTurno++;
        }
        continue;
      }
      // Match DD/MM pattern
      const dateMatch = val.match(/^(\d{2})\/(\d{2})$/);
      if (!dateMatch) continue;
      const day = dateMatch[1];
      const monthNum = dateMatch[2];
      // Determine month from position: Ago(0), Sep(1), Oct(2), Nov(3), Dic(4-5)
      const cellIdx = dates.length;
      let monthName;
      if (cellIdx < 4) {
        monthName = monthOrder[cellIdx];
      } else {
        monthName = 'Dic';
      }
      const year = '2026';
      dates.push({
        fecha: `${year}-${monthNum}-${day}`,
        label: `${day}/${monthNum}`
      });
    }

    if (dates.length > 0) {
      result[subjectName] = dates;
    }
  }
  return result;
}

async function fetchFinalesTable() {
  const res = await fetch(FINALES_URL);
  if (!res.ok) throw new Error('Finales fetch HTTP ' + res.status);
  return await res.text();
}

function computeFinalesHash(data) {
  // Simple deterministic hash of sorted JSON
  const sorted = JSON.stringify(data, Object.keys(data).sort());
  let hash = 0;
  for (let i = 0; i < sorted.length; i++) {
    const chr = sorted.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash.toString(36);
}

function diffFinales(oldData, newData) {
  const changes = { added: [], removed: [], modified: [] };
  const oldKeys = new Set(Object.keys(oldData));
  const newKeys = new Set(Object.keys(newData));

  for (const name of newKeys) {
    if (!oldKeys.has(name)) {
      changes.added.push({ name, dates: newData[name] });
    } else {
      const oldDates = JSON.stringify(oldData[name]);
      const newDates = JSON.stringify(newData[name]);
      if (oldDates !== newDates) {
        changes.modified.push({ name, old: oldData[name], new: newData[name] });
      }
    }
  }
  for (const name of oldKeys) {
    if (!newKeys.has(name)) {
      changes.removed.push({ name, dates: oldData[name] });
    }
  }
  return changes;
}

function buildFinalesEmailHtml(changes) {
  let html = '<h2>📋 Fechas de Finales - Actualización detectada</h2>';
  html += '<p>Se detectaron cambios en las fechas de finales de la Facultad de Ciencias Médicas (UNLP).</p>';

  if (changes.added.length > 0) {
    html += '<div style="margin-bottom:16px;padding:12px;background:#e8f5e9;border-radius:8px">';
    html += '<h3 style="margin:0 0 8px;color:#2e7d32">✅ Materias agregadas (' + changes.added.length + ')</h3><ul style="margin:0">';
    changes.added.forEach(m => {
      html += '<li><strong>' + escapeHtml(m.name) + '</strong>: ' + m.dates.map(d => d.label).join(', ') + '</li>';
    });
    html += '</ul></div>';
  }

  if (changes.modified.length > 0) {
    html += '<div style="margin-bottom:16px;padding:12px;background:#fff3e0;border-radius:8px">';
    html += '<h3 style="margin:0 0 8px;color:#e65100">⚠️ Materias modificadas (' + changes.modified.length + ')</h3><ul style="margin:0">';
    changes.modified.forEach(m => {
      html += '<li><strong>' + escapeHtml(m.name) + '</strong><br>';
      html += '<span style="color:#c62828;text-decoration:line-through">Antes: ' + m.old.map(d => d.label).join(', ') + '</span><br>';
      html += '<span style="color:#2e7d32">Ahora: ' + m.new.map(d => d.label).join(', ') + '</span></li>';
    });
    html += '</ul></div>';
  }

  if (changes.removed.length > 0) {
    html += '<div style="margin-bottom:16px;padding:12px;background:#fce4ec;border-radius:8px">';
    html += '<h3 style="margin:0 0 8px;color:#c62828">❌ Materias eliminadas (' + changes.removed.length + ')</h3><ul style="margin:0">';
    changes.removed.forEach(m => {
      html += '<li><strong>' + escapeHtml(m.name) + '</strong>: ' + m.dates.map(d => d.label).join(', ') + '</li>';
    });
    html += '</ul></div>';
  }

  html += '<p><a href="' + escapeHtml(FINALES_URL) + '" style="color:#0066cc">Ver tabla oficial de finales</a></p>';
  html += '<hr><p style="color:#888;font-size:12px">Finales Monitor — Correlatividades UNLP</p>';
  return html;
}

async function checkFinales(env) {
  try {
    const html = await fetchFinalesTable();
    const newData = parseFinalesHtml(html);
    const newHash = computeFinalesHash(newData);

    const snapshotRaw = await env.CARTELERA_SUBS.get('finale-snapshot');
    const snapshot = snapshotRaw ? JSON.parse(snapshotRaw) : { hash: null, data: {} };

    if (snapshot.hash === newHash) {
      console.log('Finales check: no changes detected');
      return { changed: false };
    }

    console.log('Finales check: changes detected! Old hash=' + snapshot.hash + ' New hash=' + newHash);
    const changes = diffFinales(snapshot.data || {}, newData);

    // Only send email if there are meaningful changes
    if (changes.added.length > 0 || changes.modified.length > 0 || changes.removed.length > 0) {
      const subject = '📋 Fechas de Finales - Actualización detectada';
      const emailHtml = buildFinalesEmailHtml(changes);
      await sendEmail(FINALES_ADMIN_EMAIL, subject, emailHtml, env);
      console.log('Finales update email sent to ' + FINALES_ADMIN_EMAIL);
    }

    // Save new snapshot
    await env.CARTELERA_SUBS.put('finale-snapshot', JSON.stringify({ hash: newHash, data: newData }));
    return { changed: true, changes };
  } catch (e) {
    console.error('Finales check error: ' + e.message);
    return { changed: false, error: e.message };
  }
}

// ─── Inscripciones Pages Monitoring (mini calendario) ────────────────

const INSCRIPCIONES_PAGES = [
  { id: 'inscripciones', url: 'https://www.med.unlp.edu.ar/index.php/inscripciones', label: 'Inscripciones' },
  { id: 'ingresantes', url: 'https://www.med.unlp.edu.ar/index.php/ingresantes', label: 'Ingresantes' }
];
const INSCRIPCIONES_ADMIN_EMAIL = 'felipetesta@gmail.com';

async function fetchPage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status + ' fetching ' + url);
  return await res.text();
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&aacute;/g, 'á').replace(/&eacute;/g, 'é').replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó').replace(/&uacute;/g, 'ú').replace(/&ntilde;/g, 'ñ')
    .replace(/&Aacute;/g, 'Á').replace(/&Eacute;/g, 'É').replace(/&Iacute;/g, 'Í')
    .replace(/&Oacute;/g, 'Ó').replace(/&Uacute;/g, 'Ú').replace(/&Ntilde;/g, 'Ñ')
    .replace(/&(amp|quot|#39);/g, function (_, e) { return e === 'amp' ? '&' : (e === 'quot' ? '"' : "'"); })
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, function (_, c) { return String.fromCharCode(parseInt(c, 10)); });
}

function extractPageTextLines(html) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, '\n');
  const seen = new Set();
  const lines = [];
  for (const raw of text.split(/\n+/)) {
    const line = decodeHtmlEntities(raw).replace(/\s+/g, ' ').trim();
    if (line.length < 4) continue;
    if (seen.has(line)) continue;
    seen.add(line);
    lines.push(line);
  }
  return lines.sort();
}

function computeSimpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash.toString(36);
}

function buildInscripcionesEmailHtml(pageResults) {
  let html = '<h2>📅 Inscripciones FCM - Actualización detectada</h2>';
  html += '<p>Se detectaron cambios en las páginas de inscripciones de la Facultad de Ciencias Médicas (UNLP).';
  html += ' Revisar <code>APP/calendar_data.js</code> y actualizar el mini calendario.</p>';
  for (const pr of pageResults) {
    if (pr.added.length === 0 && pr.removed.length === 0) continue;
    html += '<div style="margin-bottom:16px;padding:12px;background:#f5f5f5;border-radius:8px">';
    html += '<h3 style="margin:0 0 8px">' + escapeHtml(pr.label) + ' — <a href="' + escapeHtml(pr.url) + '" style="color:#0066cc">' + escapeHtml(pr.url) + '</a></h3>';
    if (pr.added.length > 0) {
      html += '<p style="margin:4px 0;color:#2e7d32"><strong>Nuevo (' + pr.added.length + '):</strong></p><ul style="margin:0">';
      pr.added.forEach(l => { html += '<li>' + escapeHtml(l) + '</li>'; });
      html += '</ul>';
    }
    if (pr.removed.length > 0) {
      html += '<p style="margin:4px 0;color:#c62828"><strong>Quitado (' + pr.removed.length + '):</strong></p><ul style="margin:0">';
      pr.removed.forEach(l => { html += '<li>' + escapeHtml(l) + '</li>'; });
      html += '</ul>';
    }
    html += '</div>';
  }
  html += '<hr><p style="color:#888;font-size:12px">Inscripciones Monitor — Correlatividades UNLP (chequeo mensual, día 1º)</p>';
  return html;
}

async function checkInscripciones(env) {
  const snapRaw = await env.CARTELERA_SUBS.get('inscripciones-snapshot');
  const snapshots = snapRaw ? JSON.parse(snapRaw) : {};
  const pageResults = [];
  let anyChange = false;

  for (const page of INSCRIPCIONES_PAGES) {
    const pr = { id: page.id, label: page.label, url: page.url, added: [], removed: [], ok: true };
    try {
      const html = await fetchPage(page.url);
      const lines = extractPageTextLines(html);
      const hash = computeSimpleHash(lines.join('\n'));
      const old = snapshots[page.id] || { hash: null, lines: [] };
      if (old.hash !== hash) {
        pr.added = lines.filter(l => !old.lines.includes(l));
        pr.removed = old.lines.filter(l => !lines.includes(l));
        if (pr.added.length > 0 || pr.removed.length > 0) anyChange = true;
        snapshots[page.id] = { hash, lines };
      }
    } catch (e) {
      pr.ok = false;
      pr.error = e.message;
      console.error('Inscripciones check error for ' + page.id + ': ' + e.message);
    }
    pageResults.push(pr);
  }

  if (anyChange) {
    try {
      const subject = '📅 Inscripciones FCM - Actualización detectada';
      const emailHtml = buildInscripcionesEmailHtml(pageResults);
      await sendEmail(INSCRIPCIONES_ADMIN_EMAIL, subject, emailHtml, env);
      console.log('Inscripciones update email sent to ' + INSCRIPCIONES_ADMIN_EMAIL);
    } catch (e) {
      console.error('Inscripciones email send failed: ' + e.message);
    }
  }

  // Persist snapshots only for pages that changed and fetched OK
  let snapshotsDirty = false;
  for (const pr of pageResults) {
    if (pr.ok && snapshots[pr.id] && (pr.added.length > 0 || pr.removed.length > 0)) snapshotsDirty = true;
  }
  if (snapshotsDirty || !snapRaw) {
    await env.CARTELERA_SUBS.put('inscripciones-snapshot', JSON.stringify(snapshots));
  }

  return { changed: anyChange, pages: pageResults.map(pr => ({ id: pr.id, ok: pr.ok, added: pr.added.length, removed: pr.removed.length, error: pr.error })) };
}

function buildWelcomeHtml(catedraPubs, names, homePubs) {
  let html = '<h2>🔔 Cartelera UNLP</h2><p>¡Suscripción confirmada! Estas son las últimas 5 publicaciones (últimos 12 meses) de tus cátedras:</p>';
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
      var dateDisplay = escapeHtml(p.date);
      if (p.modified) {
        dateDisplay = escapeHtml(p.date) + ' &rarr; Modificada en ' + escapeHtml(p.modified);
      }
      html += '<li>' + titleHtml + ' — ' + dateDisplay + '</li>';
    });
    html += '</ul></div>';
  }
  html += '<hr><p style="color:#888;font-size:12px">Para cancelar la suscripción, visita <a href="https://felipetesta.github.io/Correlatividades_FCM_UNLP/cartelera.html" style="color:#0066cc">Cartelera UNLP</a> y mantén presionado el botón "Remover mi email".</p>';
  return html;
}
