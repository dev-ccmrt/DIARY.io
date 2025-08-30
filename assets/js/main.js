// ===== テーマ切替（ライト/ダーク） =====
(() => {
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  const saved = localStorage.getItem('theme'); // 'light' | 'dark' | null
  if (saved === 'light') {
    root.classList.add('theme-light');
    btn.setAttribute('aria-pressed', 'false');
    btn.textContent = '🌙';
  } else if (saved === 'dark') {
    root.classList.add('theme-dark');
    btn.setAttribute('aria-pressed', 'true');
    btn.textContent = '☀️';
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    btn.setAttribute('aria-pressed', prefersDark ? 'true' : 'false');
    btn.textContent = prefersDark ? '☀️' : '🌙';
  }

  btn.addEventListener('click', () => {
    const isDark = root.classList.toggle('theme-dark');
    if (isDark) root.classList.remove('theme-light');
    btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    btn.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
})();

// ===== タグフィルタ（その場で絞り込み） =====
(() => {
  const pillsWrap = document.getElementById('tagFilter');
  const list = document.getElementById('cardList');
  if (!pillsWrap || !list) return;

  const pills = Array.from(pillsWrap.querySelectorAll('.tag-pill'));
  const cards = Array.from(list.querySelectorAll('.card'));

  function applyFilter(tag) {
    cards.forEach(card => {
      const tags = (card.getAttribute('data-tags') || '').split(/\s+/).filter(Boolean);
      const show = tag === 'all' || tags.includes(tag);
      card.classList.toggle('is-hidden', !show);
      if (show) {
        card.classList.remove('fade-in');
        void card.offsetWidth; // reflow
        card.classList.add('fade-in');
      }
    });
  }

  pills.forEach(p => {
    p.addEventListener('click', () => {
      const tag = p.getAttribute('data-tag');
      pills.forEach(x => {
        const on = x === p;
        x.classList.toggle('is-active', on);
        x.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      applyFilter(tag);
      if (typeof window.updateLoadMoreVisibility === 'function') {
        window.updateLoadMoreVisibility();
      }
    });
  });

  applyFilter('all');
  window.__cardsForLoadMore = cards; // もっと見る用に公開
})();

// ===== もっと見る =====
(() => {
  const list = document.getElementById('cardList');
  const btn = document.getElementById('loadMore');
  if (!list || !btn) return;

  const BATCH = 6; // 一度に出す枚数。必要なら調整
  const allCards = window.__cardsForLoadMore || Array.from(list.querySelectorAll('.card'));

  function initVisibility() {
    let shown = 0;
    allCards.forEach(card => {
      if (!card.classList.contains('is-hidden') && shown < BATCH) {
        shown++;
      } else {
        card.classList.add('is-hidden');
      }
    });
  }

  function revealNext() {
    let revealed = 0;
    for (const card of allCards) {
      if (card.classList.contains('is-hidden')) {
        card.classList.remove('is-hidden');
        card.classList.remove('fade-in'); void card.offsetWidth; card.classList.add('fade-in');
        if (++revealed >= BATCH) break;
      }
    }
    updateLoadMoreVisibility();
  }

  window.updateLoadMoreVisibility = function updateLoadMoreVisibility() {
    const anyHidden = allCards.some(c => c.classList.contains('is-hidden'));
    btn.style.display = anyHidden ? 'inline-flex' : 'none';
  };

  initVisibility();
  updateLoadMoreVisibility();
  btn.addEventListener('click', revealNext);
})();

// ===== ハンバーガーメニュー（スマホ時） =====
(() => {
  const btn   = document.getElementById('menuToggle');
  const panel = document.getElementById('menuPanel');
  if (!btn || !panel) return;

  const closeMenu = () => {
    panel.classList.remove('open');
    document.body.classList.remove('no-scroll'); // CSS: body.no-scroll { overflow:hidden; }
    btn.setAttribute('aria-expanded', 'false');
  };

  btn.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('open');
    document.body.classList.toggle('no-scroll', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  panel.addEventListener('click', (e) => {
    if (e.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // PC幅に戻ったら状態を畳む
  const mq = window.matchMedia('(min-width: 769px)');
  if (mq && typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', closeMenu);
  } else if (mq && typeof mq.addListener === 'function') {
    mq.addListener(closeMenu); // 古いブラウザ
  }
})();
