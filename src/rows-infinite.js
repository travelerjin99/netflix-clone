(() => {
  const mod = (n, m) => ((n % m) + m) % m;

  function computePageSize(viewport, track) {
    const firstLi = (track.querySelector('li') || document.querySelector('.row-list li'));
    if (!firstLi) return 1;
    const r = firstLi.getBoundingClientRect();
    const gap = parseFloat(getComputedStyle(track).columnGap || 0);
    const full = r.width + gap;
    // return full > 0 ? Math.max(1, Math.round((viewport.clientWidth + gap) / full)) : 1;
    return 5; // fixed number of cards per view   
  }

  function buildSlice(items, start, count) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const idx = mod(start + i, items.length);
      frag.appendChild(items[idx].cloneNode(true));
    }
    return frag;
  }

  function renderPages(state) {
    const { track, items, pageSize } = state;
    track.innerHTML = '';
    const prev = document.createElement('ul');
    const curr = document.createElement('ul');
    const next = document.createElement('ul');
    prev.className = curr.className = next.className = 'row-page';
    prev.setAttribute('role', 'list'); curr.setAttribute('role', 'list'); next.setAttribute('role', 'list');
    prev.appendChild(buildSlice(items, state.start - pageSize, pageSize));
    curr.appendChild(buildSlice(items, state.start, pageSize));
    next.appendChild(buildSlice(items, state.start + pageSize, pageSize));
    track.append(prev, curr, next);
    // track.style.transform = 'translateX(-100%)'; // recenter
  }

  function slide(state, dir) {
    if (state.animating) return;
    state.animating = true;
    const { track, duration, pageSize } = state;
    track.style.transition = `transform ${duration}ms ease`;
    requestAnimationFrame(() => {
      track.style.transform = `translateX(${dir > 0 ? '-200%' : '0%'})`;
    });
    track.addEventListener('transitionend', function onEnd() {
      track.removeEventListener('transitionend', onEnd);
      state.start = mod(state.start + dir * pageSize, state.items.length);
      track.style.transition = 'none';
      renderPages(state);
      track.offsetHeight; // reflow
      state.animating = false;
    }, { once: true });
  }

  function initRow(rowEl) {
    const viewport = rowEl.querySelector('.row-viewport');
    if (!viewport) return;

    // animated container
    let track = rowEl.querySelector('.row-track');
    if (!track) {
      track = document.createElement('div');
      track.className = 'row-track';
      viewport.prepend(track);
    }

    // source list (authored)
    const sourceList = rowEl.querySelector('.row-list');
    if (!sourceList) return;
    const items = Array.from(sourceList.querySelectorAll(':scope > li'));
    if (!items.length) return;

    // state
    const state = {
      viewport,
      track,
      items,
      start: 0,
      pageSize: computePageSize(viewport, track),
      duration: 400,
      animating: false
    };

    // first render into track
    renderPages(state);

    // now remove the source list (we don't need it anymore)
    sourceList.remove();

    // buttons
    const btnPrev = rowEl.querySelector('.row-prev');
    const btnNext = rowEl.querySelector('.row-next');
    if (btnPrev) btnPrev.addEventListener('click', () => slide(state, -1));
    if (btnNext) btnNext.addEventListener('click', () => slide(state, +1));

    // resize
    window.addEventListener('resize', () => {
      const n = computePageSize(viewport, track);
      if (n !== state.pageSize) { state.pageSize = n; renderPages(state); }
    });
  }

  document.querySelectorAll('.row').forEach(initRow);
})();