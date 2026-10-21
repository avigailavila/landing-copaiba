(function () {
    'use strict';

    const htmlElement = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const printBtn = document.getElementById('printBtn');
    const pdfBtn = document.getElementById('pdfBtn');
    const backToTop = document.getElementById('backToTop');
    const tocItems = document.querySelectorAll('.toc-item');

    const THEME_KEY = 'copaiba-theme';

    const ICONS = {
        sun: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>`,
        moon: `<path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>`
    };

    function applyTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        themeIcon.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
        themeToggle.setAttribute('title', theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
        try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    }

    function getInitialTheme() {
        try {
            const saved = localStorage.getItem(THEME_KEY);
            if (saved === 'light' || saved === 'dark') return saved;
        } catch (e) {}
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    applyTheme(getInitialTheme());

    themeToggle.addEventListener('click', function () {
        const current = htmlElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
    });

    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
            let saved = null;
            try { saved = localStorage.getItem(THEME_KEY); } catch (err) {}
            if (!saved) applyTheme(e.matches ? 'dark' : 'light');
        });
    }

    printBtn.addEventListener('click', function () { window.print(); });

    pdfBtn.addEventListener('click', function () {
        const currentTheme = htmlElement.getAttribute('data-theme');
        htmlElement.setAttribute('data-theme', 'light');
        showToast('Preparando PDF... Elige "Guardar como PDF" en el diálogo de impresión.');
        setTimeout(function () {
            window.print();
            setTimeout(function () {
                htmlElement.setAttribute('data-theme', currentTheme);
            }, 500);
        }, 250);
    });

    let scrollTimeout;
    window.addEventListener('scroll', function () {
        if (scrollTimeout) return;
        scrollTimeout = setTimeout(function () {
            if (window.scrollY > 400) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
            scrollTimeout = null;
        }, 100);
    }, { passive: true });

    backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    tocItems.forEach(function (item) {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    function showToast(message) {
        const existing = document.querySelector('.toast-notification');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 90px;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            background: ${htmlElement.getAttribute('data-theme') === 'dark' ? '#6b3f2a' : '#4a2c1a'};
            color: #ffffff;
            padding: 14px 24px;
            border-radius: 50px;
            font-size: 0.9rem;
            font-weight: 500;
            box-shadow: 0 8px 25px rgba(0,0,0,0.25);
            z-index: 2000;
            opacity: 0;
            transition: opacity 0.3s ease, transform 0.3s ease;
            max-width: 90vw;
            text-align: center;
            font-family: 'Segoe UI', 'Roboto', sans-serif;
        `;
        document.body.appendChild(toast);

        requestAnimationFrame(function () {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });

        setTimeout(function () {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(function () { toast.remove(); }, 300);
        }, 3500);
    }

    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') return;
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            themeToggle.click();
        }
        if (e.key === 'Escape' && window.scrollY > 400) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    themeToggle.addEventListener('click', function () {
        const theme = htmlElement.getAttribute('data-theme');
        const msg = theme === 'dark' ? 'Tema oscuro activado' : 'Tema claro activado';
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.style.cssText = 'position:absolute;left:-10000px;';
        announcement.textContent = msg;
        document.body.appendChild(announcement);
        setTimeout(function () { announcement.remove(); }, 1000);
    });

    if ('IntersectionObserver' in window) {
        const sections = document.querySelectorAll('section[id]');
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    tocItems.forEach(function (item) {
                        const isActive = item.getAttribute('href') === '#' + id;
                        item.style.borderLeftColor = isActive ? 'var(--btn-primary-bg)' : 'var(--border-accent)';
                        item.style.fontWeight = isActive ? '700' : '500';
                    });
                }
            });
        }, { rootMargin: '-100px 0px -60% 0px', threshold: 0 });

        sections.forEach(function (section) { observer.observe(section); });
    }

    console.log('%c🌿 Documento Copaiba cargado correctamente', 'color: #6b3f2a; font-size: 14px; font-weight: bold;');
    console.log('%cAtajos: Ctrl+D (tema) · Ctrl+P (imprimir) · Esc (volver arriba)', 'color: #c98a4b; font-size: 12px;');
    console.log('%cEmprendimiento Avigail Avila — Investigador-Promotor-Divulgador Científico · Analista de IA Aplicada', 'color: #e9b872; font-size: 11px; font-style: italic;');

})();
