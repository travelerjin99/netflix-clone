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
        const { track, items, pageSize, phase } = state;
        track.innerHTML = '';

        const curr = document.createElement('ul');
        const next = document.createElement('ul');
        curr.className = next.className = 'row-page';
        curr.setAttribute('role', 'list'); next.setAttribute('role', 'list');

        curr.appendChild(buildSlice(items, state.start, pageSize));
        next.appendChild(buildSlice(items, state.start + pageSize, pageSize));

        // if (phase === 'start') {
        //     track.append(curr, next);                // only two pages
        //     track.style.transform = 'translateX(0%)';
        // } else {
            const prev = document.createElement('ul');
            prev.className = 'row-page'; prev.setAttribute('role', 'list');
            prev.appendChild(buildSlice(items, state.start - pageSize, pageSize));
            track.append(prev, curr, next);          // three pages
            // track.style.transform = 'translateX(calc(-100% - var(--card-gap)))';
        // }
    }

    // // globalvar = 10;
    // function slide(state, dir) {
    //     // if (state.phase === 'start') state.phase = 'loop';
    //     if (state.animating) return;
    //     state.animating = true;
    //     const { track, duration, pageSize } = state;
    //     track.style.transition = `transform ${duration}ms ease`;
    //     // requestAnimationFrame(() => {
    //     //     track.style.transform = `translateX(${dir > 0 ? '-200%' : '0%'})`;
    //     // });

    //     // track.style.transform = 'translateX(-20%)';
    //     // track.style.height = '200px';
    //     // globalvar += 10;

    //     console.log('before transform:', track.style.transform);
    //     requestAnimationFrame(() => {
    //         track.style.transform = `translateX(${dir > 0 ? '-200%' : '0%'})`;
    //         console.log('after transform:', track.style.transform);
    //     });

    //     track.addEventListener('transitionend', e => {
    //         console.log('transitionend fired for', e.propertyName);
    //         onEnd();
    //         function onEnd() {
    //             track.removeEventListener('transitionend', onEnd);
    //             state.start = mod(state.start + dir * pageSize, state.items.length);
    //             track.style.transition = 'none';
    //             renderPages(state);
    //             track.offsetHeight; // reflow
    //             state.animating = false;
    //             console.log('re you running:');
    //         }
    //     });


        // track.addEventListener('transitionend', function onEnd() {
        //   track.removeEventListener('transitionend', onEnd);
        //   state.start = mod(state.start + dir * pageSize, state.items.length);
        //   track.style.transition = 'none';
        //   renderPages(state);
        //   track.offsetHeight; // reflow
        //   state.animating = false;
        //   console.log('re you running:');
        // }, { once: true });
    // }

    // new slide
function slide(state, dir) {
  const track = state.track;

  // get the current translateX from the style or computed style
  let currentTransform = track.style.transform || getComputedStyle(track).transform;
  let position = -100; // default to center

  if (currentTransform && currentTransform !== "none") {
    // matrix form: matrix(a, b, c, d, tx, ty)
    const match = currentTransform.match(/matrix.*\((.+)\)/);
    if (match) {
      const values = match[1].split(", ");
      const tx = parseFloat(values[4]); // px translateX
      const width = track.offsetWidth;
      position = (tx / width) * 100; // convert px back to %
    } else if (currentTransform.includes("translateX")) {
      const val = currentTransform.match(/-?\d+%/);
      if (val) position = parseInt(val[0], 10);
    }
  }

  console.log("Current position %:", position);

  // clamp logic
  if (position === 0 && dir < 0) {
    console.log("Already at leftmost, cannot move left.");
    return;
  }
  if (position === -200 && dir > 0) {
    console.log("Already at rightmost, cannot move right.");
    return;
  }

  // otherwise, allow sliding
  console.log("Sliding direction:", dir > 0 ? "next →" : "← prev");

  track.style.transition = "transform 0.5s ease";
  requestAnimationFrame(() => {
    track.style.transform = `translateX(${dir > 0 ? "-200%" : "0%"})`;
  });
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
            duration: 1400,
            animating: false,
            // phase: 'start'
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