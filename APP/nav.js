// ============================================
// APP NAVBAR - shared across 4 pages
// Renders navbar into <div id="appNavbar"></div>
// Auto-detects current page to highlight active link
// ============================================

(function() {
    'use strict';

    const STORAGE_KEY = 'navbarCollapsed';

    // Nav links config: each entry maps to a page
    const NAV_LINKS = [
        { href: 'index.html',     label: 'Início',      icon: '🏠', match: /^index\.html$|^\/$/ },
        { href: 'arbol.html',     label: 'Árbol',       icon: '🌳', match: /^arbol\.html$/ },
        { href: 'cartelera.html', label: 'Cartelera',   icon: '📋', match: /^cartelera\.html$/ },
        { href: 'extension.html', label: 'Extensión',   icon: '📚', match: /^extension\.html$/ },
        { href: 'vacunas.html',   label: 'Vacunas',     icon: '🛡️', match: /^vacunas\.html$/ }
    ];

    // Detect current page
    function getCurrentPage() {
        const path = window.location.pathname.split('/').pop() || 'index.html';
        return path;
    }

    // Render navbar HTML
    function render() {
        const container = document.getElementById('appNavbar');
        if (!container) return;

        const currentPage = getCurrentPage();

        const linksHtml = NAV_LINKS.map(link => {
            const isActive = link.match.test(currentPage);
            const activeClass = isActive ? ' active' : '';
            const ariaCurrent = isActive ? ' aria-current="page"' : '';
            return `<li><a href="${link.href}" class="app-navbar-link${activeClass}"${ariaCurrent}>${link.icon} ${link.label}</a></li>`;
        }).join('\n            ');

        // Start collapsed on mobile if previously collapsed
        const stored = (function() {
            try { return localStorage.getItem(STORAGE_KEY); } catch(e) { return null; }
        })();
        const initiallyOpen = stored === 'true' && window.matchMedia('(max-width: 768px)').matches;
        const openClass = initiallyOpen ? ' open' : '';

        const currentPageFile = getCurrentPage();
        const pageLink = NAV_LINKS.find(link => link.match.test(currentPageFile));
        const pageIcon = pageLink ? pageLink.icon : '';
        const pageTitle = document.body.dataset.pageTitle || '';
        container.innerHTML = `
    <nav class="app-navbar" aria-label="Navegação principal">
        <button class="app-navbar-toggle" id="appNavbarToggle" aria-expanded="false" aria-controls="appNavbarList" title="Menu">☰</button>
        <span class="app-navbar-title" aria-hidden="true">${pageIcon ? pageIcon + ' ' : ''}${pageTitle}</span>
        <ul class="app-navbar-list${openClass}" id="appNavbarList" role="menubar">
            ${linksHtml}
        </ul>
    </nav>`;

        // === Online visitor badge ===
        const WORKER_BASE = 'https://cartelera-proxy.felipestesta.workers.dev';
        const badge = document.createElement('span');
        badge.className = 'navbar-online-badge';
        badge.textContent = '🟢 …';
        badge.title = 'Visitors online / today';
        badge.setAttribute('aria-label', 'Online visitors');
        
        // Insert badge at the end of the navbar (right side)
        const navEl = container.querySelector('.app-navbar');
        if (navEl) navEl.appendChild(badge);

        // Generate or reuse session ID
        let sessionId;
        try {
            sessionId = sessionStorage.getItem('visitorSessionId');
            if (!sessionId) {
                sessionId = 'admin-' + crypto.randomUUID();
                sessionStorage.setItem('visitorSessionId', sessionId);
            }
        } catch (e) {
            sessionId = 'fallback-' + Math.random().toString(36).slice(2);
        }

        // Heartbeat + badge update function
        async function updateOnlineStatus() {
            try {
                // Send heartbeat
                await fetch(WORKER_BASE + '/heartbeat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId })
                });
                // Get counts
                const res = await fetch(WORKER_BASE + '/online');
                const data = await res.json();
                badge.textContent = '🟢 ' + (data.online || 0) + '/' + (data.visits || 0);
            } catch (e) {
                badge.textContent = '🟢 …';
            }
        }

        // Initial fetch + heartbeat (after 2s delay to avoid startup race)
        setTimeout(updateOnlineStatus, 2000);
        // Poll every 30 seconds
        setInterval(updateOnlineStatus, 30000);

        // Wire up toggle
        const toggle = document.getElementById('appNavbarToggle');
        const list = document.getElementById('appNavbarList');

        if (toggle && list) {
            // Sync initial state
            if (initiallyOpen) {
                toggle.setAttribute('aria-expanded', 'true');
            }

            toggle.addEventListener('click', () => {
                const isOpen = list.classList.toggle('open');
                toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                try { localStorage.setItem(STORAGE_KEY, isOpen ? 'true' : 'false'); } catch(e) {}
            });

            // Close menu on link click (mobile UX)
            list.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    if (window.matchMedia('(max-width: 768px)').matches) {
                        list.classList.remove('open');
                        toggle.setAttribute('aria-expanded', 'false');
                        try { localStorage.setItem(STORAGE_KEY, 'false'); } catch(e) {}
                    }
                });
            });

            // Close menu on Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && list.classList.contains('open')) {
                    list.classList.remove('open');
                    toggle.setAttribute('aria-expanded', 'false');
                    try { localStorage.setItem(STORAGE_KEY, 'false'); } catch(e) {}
                }
            });

            // Close menu on click outside (mobile UX)
            document.addEventListener('click', (e) => {
                if (list.classList.contains('open') && !list.contains(e.target) && e.target !== toggle) {
                    list.classList.remove('open');
                    toggle.setAttribute('aria-expanded', 'false');
                    try { localStorage.setItem(STORAGE_KEY, 'false'); } catch(e) {}
                }
            });
        }
    }

    // Init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', render);
    } else {
        render();
    }
})();