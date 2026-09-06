// ============================================
// EXTENSION PAGE - Render + Filters
// ============================================

(function() {
    'use strict';

    // ============ STATE ============

    const STORAGE_KEY_FILTER = 'extensionFilterStatus';
    const STORAGE_KEY_SEARCH = 'extensionSearch';

    const STATUS_LABELS = {
        inscripciones_abiertas: 'Abiertas',
        en_curso: 'En curso',
        indisponible: 'Indisponible',
        desconocido: 'Desconocido'
    };

    const STATUS_EMOJI = {
        inscripciones_abiertas: '🟢',
        en_curso: '🟡',
        indisponible: '🔴',
        desconocido: '⚪'
    };

    let currentFilter = localStorage.getItem(STORAGE_KEY_FILTER) || 'all';
    let currentSearch = localStorage.getItem(STORAGE_KEY_SEARCH) || '';

    // ============ RENDER ============

    function render() {
        const grid = document.getElementById('extensionGrid');
        const empty = document.getElementById('emptyState');
        const countEl = document.getElementById('extensionCount');

        if (!grid) return;

        // Filter + search
        const filtered = EXTENSION_PROJECTS.filter(p => {
            // Status filter
            if (currentFilter !== 'all' && p.status !== currentFilter) return false;

            // Search filter
            if (currentSearch) {
                const term = currentSearch.toLowerCase();
                const haystack = (p.nombre + ' ' + p.director + ' ' + p.descripcion).toLowerCase();
                if (!haystack.includes(term)) return false;
            }

            return true;
        });

        // Sort alphabetically by nombre
        filtered.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

        // Count
        countEl.textContent = filtered.length;

        // Empty state
        if (filtered.length === 0) {
            grid.innerHTML = '';
            empty.style.display = 'block';
            return;
        }

        empty.style.display = 'none';

        // Render cards
        grid.innerHTML = filtered.map(p => renderCard(p)).join('');
    }

function renderCard(p) {
        const statusLabel = STATUS_LABELS[p.status] || 'Desconocido';
        const links = p.links || {};

        // Build link buttons array - only include links that exist
        const linkButtons = [];
        if (links.oficial) {
            linkButtons.push(`<a href="${escapeAttr(links.oficial)}" target="_blank" rel="noopener" class="card-link-btn oficial">🔗 Oficial</a>`);
        }
        if (links.instagram) {
            linkButtons.push(`<a href="${escapeAttr(links.instagram)}" target="_blank" rel="noopener" class="card-link-btn instagram">📷 Instagram</a>`);
        }
        if (links.facebook) {
            linkButtons.push(`<a href="${escapeAttr(links.facebook)}" target="_blank" rel="noopener" class="card-link-btn facebook">📘 Facebook</a>`);
        }
        if (links.twitter) {
            linkButtons.push(`<a href="${escapeAttr(links.twitter)}" target="_blank" rel="noopener" class="card-link-btn twitter">🐦 Twitter</a>`);
        }
        if (links.youtube) {
            linkButtons.push(`<a href="${escapeAttr(links.youtube)}" target="_blank" rel="noopener" class="card-link-btn youtube">▶ YouTube</a>`);
        }

        return `
<article class="extension-card" data-id="${escapeAttr(p.id)}">
    <span class="status-pill ${escapeAttr(p.status)}">${escapeText(statusLabel)}</span>
    <h3 class="card-nombre">${escapeText(p.nombre)}</h3>
    <p class="card-director">Director: ${escapeText(p.director)}</p>
    <p class="card-descripcion">${escapeText(p.descripcion)}</p>
    <div class="card-links">
        ${linkButtons.join('\n        ')}
    </div>
    <p class="card-actividad">Última actividad: ${escapeText(p.ultimaActividad || '—')}</p>
</article>`;
    }

    // ============ HELPERS ============

    function escapeText(s) {
        if (s == null) return '';
        return String(s)
            .replace(/&/g, '&')
            .replace(/</g, '<')
            .replace(/>/g, '>');
    }

    function escapeAttr(s) {
        if (s == null) return '';
        return String(s)
            .replace(/&/g, '&')
            .replace(/"/g, '"')
            .replace(/</g, '<')
            .replace(/>/g, '>');
    }

    // ============ FILTERS ============

    function setupFilters() {
        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(btn => {
            const status = btn.getAttribute('data-status');
            if (status === currentFilter) {
                buttons.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
            }

            btn.addEventListener('click', () => {
                currentFilter = status;
                try { localStorage.setItem(STORAGE_KEY_FILTER, status); } catch(e) {}

                buttons.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');

                render();
            });
        });
    }

    function setupSearch() {
        const input = document.getElementById('searchInput');
        if (!input) return;

        // Set initial value from localStorage
        if (currentSearch) {
            input.value = currentSearch;
        }

        // Debounced search
        let debounceTimer;
        input.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                currentSearch = e.target.value.trim();
                try { localStorage.setItem(STORAGE_KEY_SEARCH, currentSearch); } catch(err) {}
                render();
            }, 150);
        });
    }

    // ============ INIT ============

    function init() {
        setupFilters();
        setupSearch();
        render();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();