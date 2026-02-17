/**
 * Sticky Sidebar TOC — Auto-generated from page headings
 * Provides scroll-spy, search filtering, and mobile collapse
 */
(function () {
    'use strict';

    // Only run on pages with <main> content
    const main = document.querySelector('main');
    if (!main) return;

    // Collect headings — h2 and h3 inside <main>
    const headings = Array.from(main.querySelectorAll('h2, h3')).filter(h => {
        // Skip headings inside cards/links that are just labels
        return !h.closest('.domain-link, .framework-card, .core-card, .path-card, .resource-card, .master, .core-principle');
    });

    // Need at least 3 headings to justify a sidebar
    if (headings.length < 3) return;

    // Ensure each heading has an ID
    const usedIds = new Set();
    headings.forEach(h => {
        if (!h.id) {
            // Check if parent section has an id
            const parentSection = h.closest('section, .subgroup');
            if (parentSection && parentSection.id) {
                h.id = parentSection.id;
            } else {
                let baseId = h.textContent.trim().toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .substring(0, 40);
                let id = baseId;
                let counter = 1;
                while (usedIds.has(id) || document.getElementById(id)) {
                    id = `${baseId}-${counter++}`;
                }
                h.id = id;
            }
        }
        usedIds.add(h.id);
    });

    // Build sidebar DOM
    const sidebar = document.createElement('aside');
    sidebar.className = 'toc-sidebar';
    sidebar.innerHTML = `
    <button class="toc-toggle" aria-label="Toggle table of contents">☰</button>
    <div class="toc-panel">
      <div class="toc-header">
        <span class="toc-title">On this page</span>
        <button class="toc-close" aria-label="Close">×</button>
      </div>
      <div class="toc-search-wrap">
        <input type="text" class="toc-search" placeholder="Search sections…" autocomplete="off">
      </div>
      <nav class="toc-nav">
        <ul class="toc-list"></ul>
      </nav>
    </div>
  `;

    document.body.appendChild(sidebar);

    const tocList = sidebar.querySelector('.toc-list');
    const tocPanel = sidebar.querySelector('.toc-panel');
    const tocToggle = sidebar.querySelector('.toc-toggle');
    const tocClose = sidebar.querySelector('.toc-close');
    const tocSearch = sidebar.querySelector('.toc-search');

    // Populate TOC
    headings.forEach(h => {
        const li = document.createElement('li');
        li.className = `toc-item toc-${h.tagName.toLowerCase()}`;
        const a = document.createElement('a');
        a.href = `#${h.id}`;
        a.textContent = h.textContent.trim();
        a.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById(h.id).scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Close on mobile
            if (window.innerWidth < 1100) {
                tocPanel.classList.remove('toc-open');
            }
        });
        li.appendChild(a);
        tocList.appendChild(li);
    });

    // Toggle mobile
    tocToggle.addEventListener('click', () => {
        tocPanel.classList.toggle('toc-open');
    });
    tocClose.addEventListener('click', () => {
        tocPanel.classList.remove('toc-open');
    });

    // Search filter
    tocSearch.addEventListener('input', () => {
        const query = tocSearch.value.toLowerCase().trim();
        const items = tocList.querySelectorAll('.toc-item');
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(query) ? '' : 'none';
        });
    });

    // Scroll-spy with IntersectionObserver
    const observerOptions = {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0
    };

    let currentActive = null;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                if (currentActive) currentActive.classList.remove('toc-active');
                const link = tocList.querySelector(`a[href="#${id}"]`);
                if (link) {
                    currentActive = link.parentElement;
                    currentActive.classList.add('toc-active');
                }
            }
        });
    }, observerOptions);

    headings.forEach(h => observer.observe(h));
})();
