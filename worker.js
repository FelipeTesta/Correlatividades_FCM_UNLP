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

    // POST /test-finales-send — force the finals reminder email now (diagnostic)
    if (url.pathname === '/test-finales-send' && request.method === 'POST') {
      try {
        const result = await sendFinalesReminder(env, true);

        return new Response(JSON.stringify({ ok: true, ...result }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message }), {
          status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // POST /elecciones-scrape — scraping da página oficial de eleições e armazena votos no KV
    if (url.pathname === '/elecciones-scrape' && request.method === 'POST') {
      try {
        // Prioridades de URL + headers de browser (evita bloqueio de bots/datacenter)
        const UNLP_URLS = ['https://unlp.edu.ar/', 'https://www.unlp.edu.ar/'];
        const UNLP_HEADERS = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-AR,es;q=0.9',
          'Referer': 'https://unlp.edu.ar/'
        };
        let html = null;
        let usedUrl = null;
        let lastErr = null;
        outer:
        for (const cand of UNLP_URLS) {
          for (let intento = 0; intento < 2; intento++) {
            try {
              const ctrl = new AbortController();
              const t = setTimeout(() => ctrl.abort(), 20000);
              const res = await fetch(cand + '?elecciones_ts=' + Date.now(), { signal: ctrl.signal, headers: UNLP_HEADERS });
              clearTimeout(t);
              if (!res.ok) throw new Error('HTTP ' + res.status + ' fetching ' + cand);
              const htmlTmp = await res.text();
              if (htmlTmp.match(/var csvData\s*=\s*"/)) { html = htmlTmp; usedUrl = cand; break outer; }
              lastErr = new Error('csvData não encontrado em ' + cand);
            } catch (fe) {
              lastErr = fe;
            }
            if (intento < 1) await new Promise(r => setTimeout(r, 1000));
          }
        }
        if (!html) {
          // Última tentativa sem csvData-check em cada URL, para diferenciar HTTP error de página sem csvData
          for (const cand of UNLP_URLS) {
            try {
              const ctrl = new AbortController();
              const t = setTimeout(() => ctrl.abort(), 20000);
              const res = await fetch(cand + '?elecciones_ts=' + Date.now(), { signal: ctrl.signal, headers: UNLP_HEADERS });
              clearTimeout(t);
              if (res.ok) { const htmlTmp = await res.text(); if (htmlTmp) { html = htmlTmp; usedUrl = cand; break; } }
            } catch (fe) { lastErr = fe; }
          }
        }
        if (!html) throw new Error('Homepage UNLP inacessível: ' + (lastErr ? lastErr.message : 'desconhecido'));

        // A variável csvData com os votos está na homepage (unlp.edu.ar/),
        // não na página /eleições. Parseia diretamente o HTML da homepage.
        const parsed = parseEleccionesHtml(html);
        const data = parsed.resultados;
        if (!data || data.length === 0) throw new Error('Nenhuma agrupación encontrada na página oficial (csvData não encontrado)');

        // Validação de coerência: soma dos votos parseados deve bater com a linha TOTAL do CSV
        // Usa o csvRaw per-faculdade confiável do parser
        const csvRaw = parsed.csvRaw || '';
        let totalMatch = null; // null = linha TOTAL ausente (não-block)
        if (csvRaw) {
          const linhasCsv = csvRaw.split(/\\n|\\r/);
          for (const l of linhasCsv) {
            const tt = l.trim().split(',');
            if (tt[0] && tt[0].trim().toUpperCase() === 'TOTAL') {
              const rawC = (tt[1] || '').trim();
              const rawK = (tt[2] || '').trim();
              // Total vazio (ex: "Total,,") = dados oficiais sem total → sem validação
              if (!rawC || !rawK) break;
              const totC = parseInt(rawC, 10) || 0;
              const totK = parseInt(rawK, 10) || 0;
              const somaC = data.reduce((s, d) => s + d.votosCentro, 0);
              const somaK = data.reduce((s, d) => s + d.votosClaustro, 0);
              totalMatch = (somaC === totC && somaK === totK);
              break;
            }
          }
        }
        if (totalMatch === false) {
          console.warn('[elecciones] totalMatch=false — soma dos votos (' + data.reduce((s, d) => s + d.votosCentro, 0) + '/' + data.reduce((s, d) => s + d.votosClaustro, 0) + ') difere da linha TOTAL do CSV (recuento em curso fairy); dados armazenados mesmo assim.');
        }
        // Guarda: bloco deve ser da Facultad de Ciencias Médicas
        if (parsed.csvScope !== 'medicas') {
          return new Response(JSON.stringify({ ok: false, error: 'Bloco scrub da Facultad de Ciencias Médicas não encontrado na homepage (csvScope=' + parsed.csvScope + '). Dados não armazenados.' }), { status: 502, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }
        // Snapshot bruto do csvData para debug de incoerências futuras
        if (csvRaw) {
          try { await env.CARTELERA_SUBS.put('eleccionesCsvDataRaw', csvRaw.slice(0, 4000)); } catch (e) { /* ignore */ }
        }

        await env.CARTELERA_SUBS.put('eleccionesVotos', JSON.stringify(data));
        await env.CARTELERA_SUBS.put('eleccionesLastUpdate', new Date().toISOString());
        if (parsed.eleicoesTerminadas) {
          await env.CARTELERA_SUBS.put('eleccionesDatosFinales', 'true');
        } else {
          await env.CARTELERA_SUBS.delete('eleccionesDatosFinales');
        }

        // Se detectou "Datos Finales" (eleições encerradas), envia email automaticamente
        let emailEnviado = null;
        if (parsed.eleicoesTerminadas) {
          try {
            const sendResult = await sendEleccionesEmailAutomatico(env, data);
            emailEnviado = sendResult;
          } catch (e) {
            console.error('Erro ao enviar email automático de eleições: ' + e.message);
          }
        }

        return new Response(JSON.stringify({
          ok: true,
          scraped: data.length,
          data,
          eleicoesTerminadas: parsed.eleicoesTerminadas,
          emailEnviado,
          totalMatch,
          rawCsvPreview: csvRaw ? csvRaw.slice(0, 200) : null,
          source: usedUrl,
          csvScope: parsed.csvScope,
          colorState: parsed.colorState
        }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message }), {
          status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // GET /test-elecciones-fetch — diagnóstico: fetch homepage sem armazenar nada
    if (url.pathname === '/test-elecciones-fetch' && request.method === 'GET') {
      try {
        const UNLP_URLS_T = ['https://unlp.edu.ar/', 'https://www.unlp.edu.ar/'];
        const UNLP_HEADERS_T = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', 'Accept-Language': 'es-AR,es;q=0.9', 'Referer': 'https://unlp.edu.ar/' };
        const resultados = [];
        let html = null;
        for (const cand of UNLP_URLS_T) {
          for (let intento = 0; intento < 2; intento++) {
            try {
              const ctrl = new AbortController();
              const t = setTimeout(() => ctrl.abort(), 20000);
              const res = await fetch(cand + '?test_ts=' + Date.now(), { signal: ctrl.signal, headers: UNLP_HEADERS_T });
              clearTimeout(t);
              const htmlTmp = await res.text();
              resultados.push({ url: cand, attempt: intento + 1, httpStatus: res.status, htmlLength: htmlTmp.length, csvDataPresent: !!htmlTmp.match(/var csvData\s*=\s*"/) });
              if (res.ok && htmlTmp.match(/var csvData\s*=\s*"/)) { html = htmlTmp; break; }
            } catch (fe) {
              resultados.push({ url: cand, attempt: intento + 1, error: fe.message });
            }
            if (intento < 1) await new Promise(r => setTimeout(r, 1000));
          }
          if (html) break;
        }
        // Dump de TODAS as variáveis Data da página (por faculdade)
        const allDataVars = {};
        const reData = /var\s+([A-Za-z_0-9]+[Dd]ata)\s*=\s*"((?:[^"\\]|\\.)*)"/g;
        let m;
        while ((m = reData.exec(html)) !== null) {
          allDataVars[m[1]] = m[2].slice(0, 800);
        }
        // Também varre qualquer <div class=...> ids/table com dados de faculdades (contagem)
        const facultyHits = [];
        const reFac = /Facultad[^,<>\n]{0,80}|Ciencias M[eé]dicas[^,<>\n]{0,60}|Arquitectura[^,<>\n]{0,60}/gi;
        while ((m = reFac.exec(html)) !== null) {
          facultyHits.push(m[0].slice(0, 100));
          if (facultyHits.length > 40) break;
        }
        // Instrumentação 2: localizar CSVs por faculdade
        const medicaSearch = {};
        medicaSearch.remediarCount = (html.match(/Remediar/g) || []).length;
        medicaSearch.franjaCount = (html.match(/Franja/g) || []).length;
        medicaSearch.vientoCount = (html.match(/Viento de abajo/g) || []).length;
        medicaSearch.onclickFns = [...new Set((html.match(/Facultad_[A-Za-z]*\(/g) || []).slice(0, 60))];
        medicaSearch.dataArgVzvz = [...new Set((html.match(/\(([A-Za-z]*[Dd]ata)[A-Za-z]*\s*(?:,|\))/g) || []).slice(0, 60))];
        medicaSearch.medicaCtx = [];
        for (const term of ['Remediar', 'Medicas', 'medicas']) {
          let idx = html.indexOf(term);
          let hits = 0;
          while (idx !== -1 && hits < 2) {
            medicaSearch.medicaCtx.push({ term, slice: html.slice(Math.max(0, idx - 700), idx + 700).replace(/\s+/g, ' ') });
            hits++;
            idx = html.indexOf(term, idx + 1);
          }
        }
        medicaSearch.inicioFnBodies = [];
        const reFns = /function\s+Facultad_[A-Za-z]*\s*\(([^)]*)\)/g;
        let fm;
        while ((fm = reFns.exec(html)) !== null) {
          medicaSearch.inicioFnBodies.push(fm[1]);
        }
        const csvMatch = html ? html.match(/var csvData\s*=\s*"([^"]+)"/) : null;
        const parsed = html ? parseEleccionesHtml(html) : { resultados: [], eleicoesTerminadas: false };
        return new Response(JSON.stringify({
          ok: true,
          resultPage: resultados,
          csvDataRaw: csvMatch ? csvMatch[1].slice(0, 600) : null,
          parsed: parsed.resultados,
          eleicoesTerminadas: parsed.eleicoesTerminadas,
          parsedCsvScope: parsed.csvScope,
          parsedColorState: parsed.colorState,
          parsedCsvRaw: parsed.csvRaw ? parsed.csvRaw.slice(0, 600) : null,
          allDataVars,
          facultyHits,
          facultyHitsCount: facultyHits.length,
          medicaSearch
        }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message }), {
          status: 500, headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // POST /elecciones-send — envia email com resultado final para todos os inscritos cadastrados
    if (url.pathname === '/elecciones-send' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { email: rawEmail } = body || {};
        const targetEmail = rawEmail ? rawEmail.toLowerCase().trim() : null;

        const votosRaw = await env.CARTELERA_SUBS.get('eleccionesVotos');
        if (!votosRaw) throw new Error('Dados de eleições não encontrados (rode /elecciones-scrape primeiro)');

        const data = JSON.parse(votosRaw);

        // Ordenar por votos Centro desc para determinar vencedor
        const ordenado = data.slice().sort((a, b) => b.votosCentro - a.votosCentro);
        const ganador = ordenado[0];

        const emails = [];
        if (targetEmail) {
          emails.push(targetEmail);
        } else {
          // Todos os inscritos cadastrados em CARTELERA_SUBS (apenas chaves que sejam emails)
          const allKeys = await listAllKeys(env);
          for (const key of allKeys) {
            const email = key.name;
            if (!email.includes('@')) continue;  // pula chaves internas (eleccionesVotos, visits:, etc.)
            emails.push(email);
          }
        }

        const results = [];
        for (const email of emails) {
          try {
            const subject = '🏆 Elecciones Estudiantiles FCM UNLP — Resultado Final';
            const html = buildEleccionesEmailHtml(ganador, ordenado, data);
            await sendEmail(email, subject, html, env);
            results.push({ email, ok: true });
          } catch (e) {
            results.push({ email, ok: false, error: e.message });
          }
        }

        const okCount = results.filter(r => r.ok).length;
        return new Response(JSON.stringify({
          ok: true,
          ganador,
          enviados: okCount,
          total: results.length,
          results
        }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message }), {
          status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // POST /test-inscripciones — diagnostic for inscripciones pages monitoring (no email)
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

    // 7. Finales reminder — twice a year: 1er día hábil de febrero y 1er día
    //    hábil después de las vacaciones de invierno. One email per semester
    //    (KV flag); the agent runs tools/fetch-finales.js for the actual
    //    parse + finals.json update.
    const checkDay = new Date().getUTCDate();
    if (isFinalesReminderDay(new Date())) {
      try {
        await sendFinalesReminder(env, false);
      } catch (e) {
        console.error('Finales reminder error: ' + e.message);
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
  // Split by publication article blocks (2026-10 redesign: .home-publication cards)
  const blocks = html.split(/class="card home-publication/);
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    // Extract title + link: href and text inside first <a> within card-title
    const titleMatch = block.match(/class="card-title"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/);
    const link = titleMatch ? titleMatch[1].trim() : '';
    const title = titleMatch ? titleMatch[2].replace(/<[^>]*>/g, '').trim() : '';
    // Extract date: <time> element text (DD/MM/YYYY)
    const dateMatch = block.match(/<time[^>]*>(\d{2}\/\d{2}\/\d{4})<\/time>/);
    const dateStr = dateMatch ? dateMatch[1] : '';
    // Extract modification text+time ("Modificada el 17/10/2026 a las 10:38 hs")
    let modified = null;
    const modMatch = block.match(/Modificad[ao]\s+el\s+(\d{2}\/\d{2}\/\d{4})\s+a\s+las\s+(\d{1,2}):(\d{2})/i);
    if (modMatch) {
      modified = modMatch[1] + ' ' + modMatch[2] + ':' + modMatch[3];
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
  // Home uses the same .home-publication article cards (2026-10 redesign)
  const blocks = html.split(/class="card home-publication/);
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    // Title + link (href=/noticia/N)
    const titleMatch = block.match(/class="card-title"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/);
    const link = titleMatch ? titleMatch[1].trim() : '';
    const title = titleMatch ? titleMatch[2].replace(/<[^>]*>/g, '').trim() : '';
    // Date inside <time> element (DD/MM/YYYY)
    const dateMatch = block.match(/<time[^>]*>(\d{2}\/\d{2}\/\d{4})<\/time>/);
    const dateStr = dateMatch ? dateMatch[1] : '';
    // Summary
    let subtitle = '';
    const subMatch = block.match(/class="home-publication-summary[^>]*>([\s\S]*?)<\/p>/);
    if (subMatch) subtitle = subMatch[1].replace(/<[^>]*>/g, '').trim();
    // Author (department)
    let professor = '';
    const profMatch = block.match(/class="home-publication-author[^>]*>[\s\S]*?<span>([\s\S]*?)<\/span>/);
    if (profMatch) professor = profMatch[1].trim();
    // Modification text+time ("Modificada el 17/10/2026 a las 10:38 hs")
    let modified = null;
    const modMatch = block.match(/Modificad[ao]\s+el\s+(\d{2}\/\d{2}\/\d{4})\s+a\s+las\s+(\d{1,2}):(\d{2})/i);
    if (modMatch) {
      modified = modMatch[1] + ' ' + modMatch[2] + ':' + modMatch[3];
    }
    // Skip the "Más reciente" meta badge — not a publication category
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

// ─── Elecciones Estudiantiles — scraping + email ───

// Extrai votos por agrupación da página oficial de eleições da UNLP.
// A homepage tem VÁRIOS blocos <script> com var csvData (um por faculdade, escopo de bloco).
// Só nos interessa o bloco da Facultad de Ciencias Médicas (renderFacultad_ienciasedicas).
function parseEleccionesHtml(html) {
  const vacio = { resultados: [], eleicoesTerminadas: false, csvRaw: null, colorState: null, csvScope: null };

  // Encontra todos os var csvData="..." e determina qual bloco é o de Ciencias Médicas:
  // critério = nos ~600 chars seguintes ao match existe 'renderFacultad_ienciasedicas' ou 'modal-ienciasedicas'
  const candidatos = [];
  const reData = /var csvData\s*=\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = reData.exec(html)) !== null) {
    const contexto = html.slice(m.index, m.index + 600 + m[1].length);
    candidatos.push({ csv: m[1], contexto, ctxIdx: m.index, ctxLen: m[0].length });
  }
  if (candidatos.length === 0) return vacio;

  let escolhido = candidatos.find(c => /renderFacultad_ienciasedicas|modal-ienciasedicas/i.test(c.contexto));
  const csvScope = escolhido ? 'medicas' : null;
  if (!escolhido) escolhido = candidatos[0]; // fallback: primeiro csvData (comportamento antigo), flag indicará

  const csvRaw = escolhido.csv;
  const contexto = escolhido.contexto;

  // Estado: curso de color na 1ª linha não-vazia do CSV (Amarillo/Rojo/Verde...)
  let colorState = null;
  const linhasDecod = csvRaw.split(/\\n|\\r/);
  for (const ll of linhasDecod) {
    const t = ll.trim();
    if (!t) continue;
    const primeiros = t.split(',')[0].trim();
    if (primeiros && /^\w+$/.test(primeiros)) { colorState = primeiros; break; }
  }

  // Finalizou: cor "Rojo" no CSV OU a frase "Datos Finales" no PRÓPRIO csvData
  // (NÃO testar blocoScript: o template do script contém a frase literal sempre)
  const eleicoesTerminadas = colorState === 'Rojo' || /Datos\s+Finales/i.test(csvRaw);

  const resultados = [];

  // Pula linhas de cabeçalho até "Agrupaciones,Centro,Claustro"
  let inicio = false;
  for (const linha of linhasDecod) {
    const txt = linha.trim();
    if (!txt) continue;

    if (/^Agrupaciones[,\s]/.test(txt)) { inicio = true; continue; }
    if (!inicio) continue;

    // Pula linha Total (case-insensitive: "Total,," ou "TOTAL,...")
    if (/^Total\s*[,]/i.test(txt)) continue;

    // Formato: Nome,Centro,Claustro
    const partes = txt.split(',');
    if (partes.length >= 2) {
      const nombre = partes[0].trim();
      const votosCentro = parseInt(partes[1], 10) || 0;
      const votosClaustro = parseInt(partes[2], 10) || 0;
      if (nombre) {
        resultados.push({ nombre, votosCentro, votosClaustro });
      }
    }
  }

  return { resultados, eleicoesTerminadas, csvRaw, colorState, csvScope };
}

function buildEleccionesEmailHtml(ganador, ordenado, todos) {
  let html =
    '<h2>🗳 Elecciones Estudiantiles — FCM UNLP 2026</h2>' +
    '<p><strong>Resultado Final</strong> — contagem encerrada ("Datos Finales" marcado).</p>' +
    '<hr>' +
    '<h3>🏆 Ganador</h3>' +
    '<p><strong>' + escapeHtml(ganador.nombre) + '</strong></p>' +
    '<ul style="margin:8px 0">' +
    '<li><strong>Centro:</strong> ' + ganador.votosCentro + ' votos</li>' +
    '<li><strong>Claustro:</strong> ' + ganador.votosClaustro + ' votos</li>' +
    '</ul>' +
    '<h3>📊 Resultados por agrupación</h3>' +
    '<table border="1" cellpadding="6" style="border-collapse:collapse;width:100%;font-family:sans-serif">' +
    '<thead><tr style="background:#1a1a1a;color:#e5e5e5">' +
    '<th style="text-align:left">Agrupación</th>' +
    '<th style="text-align:right">Centro</th>' +
    '<th style="text-align:right">Claustro</th>' +
    '</tr></thead><tbody>';

  for (const r of ordenado) {
    const esGanador = r.nombre === ganador.nombre;
    const filaStyle = esGanador ? 'background:#fecaca;font-weight:700' : '';
    html += '<tr style="' + filaStyle + '">' +
      '<td>' + escapeHtml(r.nombre) + '</td>' +
      '<td style="text-align:right">' + r.votosCentro + '</td>' +
      '<td style="text-align:right">' + r.votosClaustro + '</td>' +
      '</tr>';
  }

  html += '</tbody></table>' +
    '<hr>' +
    '<p style="color:#888;font-size:12px">Elecciones Estudiantiles FCM UNLP 2026 — Resultado declarado tras marcar "Datos Finales" en el modal.</p>' +
    '<p style="color:#888;font-size:12px">Correlatividades Medicina UNLP</p>';

  return html;
}

// ─── Envio automático de email de eleições para todos os inscritos cadastrados ───
async function sendEleccionesEmailAutomatico(env, data) {
  // Ordenar por votos Centro desc para determinar vencedor
  const ordenado = data.slice().sort((a, b) => b.votosCentro - a.votosCentro);
  const ganador = ordenado[0];

  // Todos os inscritos cadastrados em CARTELERA_SUBS (apenas chaves que sejam emails)
  const allKeys = await listAllKeys(env);
  const emails = [];
  for (const key of allKeys) {
    const email = key.name;
    if (!email.includes('@')) continue;
    emails.push(email);
  }

  const results = [];
  for (const email of emails) {
    try {
      const subject = '🏆 Elecciones Estudiantiles FCM UNLP — Resultado Final';
      const html = buildEleccionesEmailHtml(ganador, ordenado, data);
      await sendEmail(email, subject, html, env);
      results.push({ email, ok: true });
    } catch (e) {
      results.push({ email, ok: false, error: e.message });
    }
  }

  const okCount = results.filter(r => r.ok).length;
  return { ok: true, ganador, enviados: okCount, total: results.length, results };
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

// ─── Finales Reminder (semester start) ────────────────────────────
//
// The official exam calendar is SIU Guaraní's public fecha_examen page and
// the faculty de facto updates it every semester — no change detection here.
// The worker ONLY sends a reminder email twice a year: the first business
// day of February (start of the finals period) and the first business day
// after winter break (classes resume ~Aug 3). One email per semester
// (KV flag). The agent then runs tools/fetch-finales.js to parse + update
// APP/finales/finales.json. Process map: FLOW/finals-cycle.dot.

const FINALES_ADMIN_EMAIL = 'felipestesta@gmail.com';

// Business day = Mon-Fri. First business day of a month (monthIndex 1-12).
function firstBusinessDayOfMonth(y, monthIndex) {
  const d = new Date(Date.UTC(y, monthIndex - 1, 1));
  while (d.getUTCDay() === 0 || d.getUTCDay() === 6) d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

// First business day on/after a given date (e.g. classes resume ~Aug 3).
function firstBusinessDayOnOrAfter(y, monthIndex, day) {
  const d = new Date(Date.UTC(y, monthIndex - 1, day));
  while (d.getUTCDay() === 0 || d.getUTCDay() === 6) d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

// Reminder days (UTC): 1er día hábil de febrero + 1er día hábil después de las
// vacaciones de invierno. UNLP calendars are stable year-to-year; adjust the
// Aug 3 anchor if the academic calendar shifts.
function isFinalesReminderDay(date) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  if (m === 2 && d === firstBusinessDayOfMonth(y, 2).getUTCDate()) return true;
  if (m === 8 && d === firstBusinessDayOnOrAfter(y, 8, 3).getUTCDate()) return true;
  return false;
}

// One flag per semester per year ("finale-reminder-2026-verano" / "-invierno")
function finalesWindowKey(date) {
  const y = date.getUTCFullYear();
  return (date.getUTCMonth() + 1) >= 7 ? 'finale-reminder-' + y + '-invierno' : 'finale-reminder-' + y + '-verano';
}

async function sendFinalesReminder(env, force) {
  if (!force) {
    const flagKey = finalesWindowKey(new Date());
    const already = await env.CARTELERA_SUBS.get(flagKey);
    if (already) return { sent: false, reason: 'already reminded this semester' };
    await env.CARTELERA_SUBS.put(flagKey, '1');
  }
  const subject = '📅 Recordatorio — actualizar fechas de finales (Guaraní)';
  const emailHtml = '<h2>📅 Recordatorio de finales</h2>'
    + '<p>Empieza el período lectivo de finales — la facultad publica/actualiza las fechas de examen en SIU Guaraní alrededor de esta fecha.</p>'
    + '<p>Pedile al agente actualizar las fechas de finales: corre <code>node tools/fetch-finales.js</code> (dry-run) y luego <code>--write</code>. Proceso: <code>FLOW/finals-cycle.dot</code>.</p>'
    + '<hr><p style="color:#888;font-size:12px">Finales Reminder — Correlatividades UNLP</p>';
  await sendEmail(FINALES_ADMIN_EMAIL, subject, emailHtml, env);
  return { sent: true };
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
