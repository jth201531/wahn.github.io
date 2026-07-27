const cursor = document.getElementById('cursor');
    window.cursor = cursor;
    let cursorX = -80;
    let cursorY = -80;
    let cursorFrame = null;
    function updateCursorPosition() {
      cursorFrame = null;
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    }
    document.addEventListener('mousemove', e => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      if (!cursorFrame) cursorFrame = requestAnimationFrame(updateCursorPosition);
    });
    document.addEventListener('mouseover', e => {
      if (window._soeunCanvas) {
        if (e.target.closest('.back-btn')) cursor.classList.add('hover');
        else if (e.target.closest('.artist-page-header')) cursor.classList.remove('hover');
        else cursor.classList.add('hover');
        return;
      }
      if (e.target.closest('.tile, .youngsun-object, .youngsun-transition-gate, .youngsun-ttori-wanderer, .youngsun-contract-drop, .youngsun-pdf-close, .youngsun-work-back, .back-btn, a.logo, .artist-transition-gate, .archive-toggle, .archive-close, .archive-list-item')) cursor.classList.add('hover');
      else cursor.classList.remove('hover');
    });

    // 유영선 이미지 preload
    ['youngsun/또리는 강쥐/또리.png',
     'youngsun/또리는 강쥐/ttori-front-cropped.webp',
     'youngsun/또리는 강쥐/또리 전경-white-wall-no-ttori-screen.png',
     'youngsun/또리는 강쥐/앉은 또리.png',
     'youngsun/또리는 강쥐/계약서.png',
     'minseo/work1.png', 'minseo/work2.png', 'minseo/work3.png', 'minseo/work4.png', 'minseo/work5.png'
    ].forEach(src => {
      const img = new Image();
      img.src = src;
    });

    const artists = window.artists || [];
    const mainArtists = artists;


    const W = window.innerWidth;
    const H = window.innerHeight;
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const isMobileViewport = W < 760;
    const desktopColumns = W < 1080 ? 3 : 4;
    const shopColumns = isMobileViewport ? 2 : Math.min(desktopColumns, Math.max(1, mainArtists.length));
    const shopRows = Math.max(1, Math.ceil(mainArtists.length / shopColumns));
    const baseRecordSize = isMobileViewport ? clamp(W * 0.36, 132, 172) : 178;
    const shopGapX = isMobileViewport ? clamp(W * 0.48, 176, 222) : 260;
    const shopGapY = isMobileViewport ? 248 : 282;
    const mapWidth = isMobileViewport ? Math.max(W, shopColumns * shopGapX + 220) : W;
    const mapHeight = isMobileViewport ? Math.max(H, shopRows * shopGapY + 420) : H;
    const rackPad = isMobileViewport ? 54 : 126;
    const visibleColumns = Math.min(shopColumns, Math.max(1, mainArtists.length));
    const shopRackWidth = Math.min(mapWidth - rackPad * 2, (visibleColumns - 1) * shopGapX + baseRecordSize + (isMobileViewport ? 112 : 220));
    const shopRackLeft = (mapWidth - shopRackWidth) / 2;
    const shopStartY = clamp(
      mapHeight * 0.33 - ((shopRows - 1) * shopGapY) / 2,
      isMobileViewport ? 165 : 230,
      mapHeight - (isMobileViewport ? 260 : 310) - ((shopRows - 1) * shopGapY)
    );
    const shopRotations = [-1.1, 0.7, -0.45, 0.95, 0.35, -0.75, 0.55, -0.3];
    const shopDepths = [3, 2, 3, 2, 2, 3, 2, 3];
    const frontWords = {
      a: 'soft field',
      b: 'dark gesture',
      c: 'moving object',
      minseo: 'collision plane',
    };


    const stage = document.getElementById('stage');
    const map = document.createElement('div');
    map.className = 'artist-map';
    stage.appendChild(map);


    let isOpeningArtist = false;
    let transitionTimers = [];

    function queueTransition(fn, delay) {
      const id = setTimeout(() => {
        transitionTimers = transitionTimers.filter(timer => timer !== id);
        fn();
      }, delay);
      transitionTimers.push(id);
      return id;
    }

    function clearTransitionTimers() {
      transitionTimers.forEach(timer => clearTimeout(timer));
      transitionTimers = [];
    }

    function clearTransitionOverlays() {
      document.querySelectorAll('.artist-transition-card, .artist-transition-gate').forEach(el => el.remove());
    }

    function finishStagePan() {
      clearTransitionOverlays();
      stage.style.transition = 'none';
      stage.style.transform = '';
      stage.classList.remove('panning');
      document.body.classList.remove('artist-transitioning');
      document.querySelectorAll('#stage .tile.selected').forEach(tile => tile.classList.remove('selected'));
      document.querySelectorAll('#stage .tile.is-opening').forEach(tile => tile.classList.remove('is-opening'));
      stage.offsetHeight;
      stage.style.transition = '';
      isOpeningArtist = false;
    }

    function resetTileReveals(animated = true) {
      document.querySelectorAll('#stage .tile-back').forEach(back => {
        if (back._stopAnim) back._stopAnim();
        back._filled = false;
        back.style.transition = animated ? 'clip-path 0.5s cubic-bezier(0.22, 1, 0.36, 1)' : 'none';
        back.style.clipPath = 'circle(0% at 50% 50%)';
        if (!animated) {
          back.offsetHeight;
          back.style.transition = '';
        }
      });
    }

    function resetStagePan({ animateTiles = true } = {}) {
      clearTransitionTimers();
      finishStagePan();
      resetTileReveals(animateTiles);
    }


    const archiveToggle = document.querySelector('.archive-toggle');
    const archivePanel = document.getElementById('archive-panel');
    const archiveClose = document.querySelector('.archive-close');
    const archiveList = document.getElementById('archive-list');

    function setArchiveOpen(open) {
      if (!archivePanel || !archiveToggle) return;
      document.body.classList.toggle('archive-open', open);
      archivePanel.setAttribute('aria-hidden', open ? 'false' : 'true');
      archiveToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      cursor.classList.remove('hover');
    }

    function renderArchiveList() {
      if (!archiveList) return;
      archiveList.innerHTML = '';
      artists.forEach((artist, index) => {
        const item = document.createElement('button');
        item.className = 'archive-list-item';
        item.type = 'button';
        item.innerHTML = `
          <span class="archive-index">${String(index + 1).padStart(2, '0')}</span>
          <span class="archive-name">${artist.name}</span>
          <span class="archive-meta">${artist.genre} / ${artist.works}</span>
          <span class="archive-bio">${artist.adjectives?.[0] || artist.bio || ''}</span>`;
        item.addEventListener('click', () => {
          setArchiveOpen(false);
          openArtist(index);
        });
        archiveList.appendChild(item);
      });
    }

    archiveToggle?.addEventListener('click', () => setArchiveOpen(!document.body.classList.contains('archive-open')));
    archiveClose?.addEventListener('click', () => setArchiveOpen(false));
    archivePanel?.addEventListener('click', e => {
      if (e.target === archivePanel) setArchiveOpen(false);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') setArchiveOpen(false);
    });
    renderArchiveList();


    let mapX = (W - mapWidth) / 2;
    let mapY = (H - mapHeight) / 2;
    let isDraggingMain = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragOriginX = 0;
    let dragOriginY = 0;
    let dragMoved = false;
    let pressedTile = null;
    let suppressTileClick = false;
    let wheelTimer = null;
    let mapPanFrame = null;
    let nextMapX = mapX;
    let nextMapY = mapY;

    function applyMapPan() {
      mapPanFrame = null;
      map.style.transform = `translate3d(${nextMapX}px, ${nextMapY}px, 0)`;
    }

    function flushMapPan() {
      if (mapPanFrame) {
        cancelAnimationFrame(mapPanFrame);
        mapPanFrame = null;
      }
      applyMapPan();
    }

    function mapPad() {
      return W < 760 ? 32 : 78;
    }

    function clampMapX(x) {
      if (mapWidth <= W) return 0;
      const pad = mapPad();
      return clamp(x, W - mapWidth - pad, pad);
    }

    function clampMapY(y) {
      if (mapHeight <= H) return 0;
      const pad = mapPad();
      return clamp(y, H - mapHeight - pad, pad);
    }

    function setMapPan(x, y, { immediate = false } = {}) {
      mapX = clampMapX(x);
      mapY = clampMapY(y);
      nextMapX = mapX;
      nextMapY = mapY;
      if (immediate) {
        flushMapPan();
        return;
      }
      if (!mapPanFrame) mapPanFrame = requestAnimationFrame(applyMapPan);
    }

    function artistTileFromPoint(x, y, fallback = null) {
      return document.elementFromPoint(x, y)?.closest?.('.tile') || fallback;
    }

    function openTileIfReady(tile) {
      if (!tile || suppressTileClick || isOpeningArtist) return;
      const artistIndex = Number(tile.dataset.artistIndex);
      if (Number.isInteger(artistIndex)) openArtistFromTile(artistIndex, tile);
    }

    function endMainDrag(e) {
      if (!isDraggingMain) return;
      const tileToOpen = !dragMoved ? artistTileFromPoint(e.clientX, e.clientY, pressedTile) : null;
      isDraggingMain = false;
      pressedTile = null;
      map.classList.remove('is-dragging');
      document.body.classList.remove('dragging-main');
      if (dragMoved) {
        suppressTileClick = true;
        resetTileReveals(true);
        setTimeout(() => { suppressTileClick = false; }, 90);
        return;
      }
      openTileIfReady(tileToOpen);
    }

    stage.addEventListener('pointerdown', e => {
      if (isOpeningArtist || document.body.classList.contains('archive-open')) return;
      if (e.button !== undefined && e.button !== 0) return;
      isDraggingMain = true;
      dragMoved = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      pressedTile = e.target.closest('.tile');
      dragOriginX = mapX;
      dragOriginY = mapY;
      map.classList.add('is-dragging');
      document.body.classList.add('dragging-main');
      stage.setPointerCapture(e.pointerId);
    });

    stage.addEventListener('pointermove', e => {
      if (!isDraggingMain) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      if (Math.hypot(dx, dy) > 5) dragMoved = true;
      setMapPan(dragOriginX + dx, dragOriginY + dy);
    });

    stage.addEventListener('pointerup', endMainDrag);
    stage.addEventListener('pointercancel', endMainDrag);

    stage.addEventListener('click', e => {
      if (dragMoved) return;
      openTileIfReady(artistTileFromPoint(e.clientX, e.clientY, e.target.closest('.tile')));
    });

    stage.addEventListener('wheel', e => {
      if (isOpeningArtist || document.body.classList.contains('archive-open')) return;
      if (document.getElementById('page-artist').classList.contains('visible')) return;
      map.classList.add('is-dragging');
      setMapPan(mapX - e.deltaX, mapY - e.deltaY);
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => map.classList.remove('is-dragging'), 120);
      e.preventDefault();
    }, { passive: false });

    function createArtistTransitionCard(a, tile) {
      const copy = tile.querySelector('.record-disc') || tile.querySelector('.tile-back-copy') || tile;
      const rect = copy.getBoundingClientRect();
      const card = document.createElement('div');
      card.className = 'artist-transition-card';
      card.style.left = rect.left + 'px';
      card.style.top = rect.top + 'px';
      card.style.width = rect.width + 'px';
      card.innerHTML = `
        <div class="tile-back-name">${a.name}</div>
        <div class="tile-back-genre">${a.genre}</div>`;
      document.body.appendChild(card);

      requestAnimationFrame(() => card.classList.add('to-center'));
      return card;
    }

    function createTransitionGate() {
      const gate = document.createElement('div');
      gate.className = 'artist-transition-gate';
      gate.innerHTML = `
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <circle class="gate-base" cx="24" cy="24" r="19.5"></circle>
          <circle class="gate-progress" cx="24" cy="24" r="19.5"></circle>
          <g class="gate-x">
            <line class="gate-x-line" x1="18" y1="18" x2="30" y2="30"></line>
            <line class="gate-x-line" x1="30" y1="18" x2="18" y2="30"></line>
          </g>
        </svg>`;
      gate.addEventListener('click', e => {
        e.stopPropagation();
        cursor.classList.remove('hover');
        resetStagePan();
      });
      document.body.appendChild(gate);
      return gate;
    }

    function openArtistFromTile(i, tile) {
      if (isOpeningArtist) return;
      isOpeningArtist = true;
      clearTransitionOverlays();
      const a = artists[i];
      const panTarget = tile.querySelector('.record-disc') || tile;
      const rect = panTarget.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const scale = Math.max(window.innerWidth / rect.width, window.innerHeight / rect.height) * 1.08;
      const tx = window.innerWidth / 2 - cx * scale;
      const ty = window.innerHeight / 2 - cy * scale;

      const back = tile.querySelector('.tile-back');
      if (back?._stopAnim) back._stopAnim();
      if (back) {
        back._filled = true;
        back.style.transition = 'clip-path 0.2s ease';
        back.style.clipPath = 'inset(0%)';
      }
      tile.classList.add('is-opening');

      const transitionCard = createArtistTransitionCard(a, tile);
      const transitionGate = createTransitionGate();

      tile.classList.add('selected');
      stage.classList.add('panning');
      document.body.classList.add('artist-transitioning');
      stage.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;

      queueTransition(() => {
        let didOpen = false;
        transitionGate.classList.add('visible');
        requestAnimationFrame(() => transitionGate.classList.add('filling'));

        const openAfterGate = () => {
          if (didOpen) return;
          didOpen = true;
          transitionCard.classList.add('exit');
          transitionGate.classList.add('exit');
          const pageArtist = document.getElementById('page-artist');
          pageArtist.classList.add('from-pan');
          openArtist(i);
          queueTransition(() => pageArtist.classList.remove('from-pan'), 650);
          queueTransition(finishStagePan, 720);
        };

        transitionGate.querySelector('.gate-progress').addEventListener('animationend', openAfterGate, { once: true });
        queueTransition(openAfterGate, 1780);
      }, 980);
    }

    map.style.width = `${mapWidth}px`;
    map.style.height = `${mapHeight}px`;

    const shopRackTop = Math.max(96, shopStartY - baseRecordSize / 2 - 58);
    const shopRack = document.createElement('div');
    shopRack.className = 'shop-rack';
    shopRack.style.left = `${shopRackLeft}px`;
    shopRack.style.top = `${shopRackTop}px`;
    shopRack.style.width = `${shopRackWidth}px`;
    shopRack.style.height = `${(shopRows - 1) * shopGapY + baseRecordSize + 150}px`;
    map.appendChild(shopRack);

    for (let row = 0; row < shopRows; row += 1) {
      const shelf = document.createElement('div');
      shelf.className = 'shop-shelf';
      shelf.style.left = '0px';
      shelf.style.width = '100%';
      shelf.style.top = `${shopStartY + row * shopGapY + baseRecordSize / 2 + (isMobileViewport ? -6 : -10) - shopRackTop}px`;
      shopRack.appendChild(shelf);
    }

    mainArtists.forEach((a, i) => {
      const row = Math.floor(i / shopColumns);
      const col = i % shopColumns;
      const rowStartX = shopRackLeft + (isMobileViewport ? 42 : 72) + baseRecordSize / 2;
      const centerX = rowStartX + col * shopGapX;
      const centerY = shopStartY + row * shopGapY;
      const recordSize = baseRecordSize;
      const cardW = recordSize + (isMobileViewport ? 30 : 48);
      const cardH = recordSize + (isMobileViewport ? 62 : 72);
      const left = clamp(centerX - cardW / 2, 72, mapWidth - cardW - 72);
      const top = clamp(centerY - recordSize / 2 + (col % 2 ? 2 : -2), 72, mapHeight - cardH - 72);
      const aIdx = artists.indexOf(a);

      const tile = document.createElement('div');
      tile.className = 'tile is-live';
      tile.dataset.artistIndex = aIdx;
      tile.style.left = `${left}px`;
      tile.style.top = `${top}px`;
      tile.style.width = `${cardW}px`;
      tile.style.height = `${cardH}px`;
      tile.style.zIndex = shopDepths[i % shopDepths.length];
      tile.style.setProperty('--tile-rotate', `${shopRotations[i % shopRotations.length]}deg`);
      tile.style.setProperty('--record-size', `${recordSize}px`);

      const indexLabel = String(aIdx + 1).padStart(2, '0');
      const word = a.adjectives?.[0] || a.bio || frontWords[a.display] || a.genre;
      const frontMeta = `${a.genre} / ${a.works}`;
      const backBg = a.color;
      tile.style.setProperty('--tile-accent', backBg);

      tile.innerHTML = `
      <div class="tile-inner">
        <div class="record-disc" aria-label="${a.name} record">
          <div class="record-surface"></div>
          <div class="record-label-center">
            <div class="record-bio">${word}</div>
          </div>
        </div>
        <div class="record-caption">
          <span class="record-caption-name">${a.name}</span>
          <span class="record-caption-divider">/</span>
          <span class="record-caption-genre">${a.genre}</span>
        </div>
      </div>`;

      tile.addEventListener('mouseenter', () => tile.classList.add('is-hovering'));

      tile.addEventListener('mouseleave', () => {
        if (stage.classList.contains('panning') && tile.classList.contains('selected')) return;
        if (isDraggingMain && pressedTile === tile) return;
        tile.classList.remove('is-hovering');
      });

      map.appendChild(tile);
    });

    setMapPan((W - mapWidth) / 2, (H - mapHeight) / 2, { immediate: true });

    if (new URLSearchParams(window.location.search).get('edit') === 'youngsun') {
      const youngsunIndex = artists.findIndex(a => a.display === 'c');
      if (youngsunIndex >= 0) setTimeout(() => openArtist(youngsunIndex), 80);
    }


    function openArtist(i) {
      const a = artists[i];
      const pageArtist = document.getElementById('page-artist');
      resetArtistHeaderControls();
      document.getElementById('header-artist-name').textContent = a.name;
      document.getElementById('artist-meta').textContent = `${a.genre} · ${a.works}`;
      document.getElementById('artist-works').innerHTML = a.html;
      pageArtist.dataset.display = a.display || '';
      pageArtist.classList.add('visible');
      pageArtist.scrollTop = 0;
      if (a.display === 'b') {
        pageArtist.style.background = '#000';
        pageArtist.style.color = '#fff';
        document.getElementById('header-artist-name').style.color = '#fff';
        document.getElementById('artist-meta').style.color = 'rgba(255,255,255,0.5)';
        document.querySelector('.back-btn').style.color = 'rgba(255,255,255,0.5)';
        document.querySelector('.artist-page-header').style.borderColor = 'rgba(255,255,255,0.1)';
      }
      if (a.display !== 'b') pageArtist.style.background = 'var(--bg)';
      if (typeof a.init === 'function') a.init();
    }

function resetArtistHeaderControls() {
  const pageArtist = document.getElementById('page-artist');
  const backButton = document.querySelector('.back-btn');
  if (pageArtist) pageArtist.classList.remove('youngsun-work-header');
  if (backButton) {
    backButton.innerHTML = '<span class="back-arr">←</span><span>Back</span>';
    backButton.onclick = event => {
      event.preventDefault();
      closeArtist();
    };
  }
}

function closeArtist() {
  if (window._soeunCanvas) { window._soeunCanvas._remove(); window._soeunCanvas = null; }
  if (window._fliesAbort) { window._fliesAbort.abort(); window._fliesAbort = null; }
  if (window._youngsunEditorAbort) { window._youngsunEditorAbort.abort(); window._youngsunEditorAbort = null; }
  const fc = document.getElementById('fly-canvas');
  if (fc && fc._stop) { fc._stop(); fc._stop = null; }
  if (fc) { fc.style.display = 'none'; fc.width = 1; }
  const bc = document.getElementById('bounce-canvas');
  if (bc && bc._stop) { bc._stop(); bc._stop = null; }
  resetStagePan({ animateTiles: false });
  cursor.classList.remove('hover');
  document.getElementById('page-artist').classList.remove('from-pan');
  resetArtistHeaderControls();
  document.getElementById('page-artist').style.background = 'var(--bg)';
  document.getElementById('page-artist').style.color = '';
  document.getElementById('header-artist-name').style.color = '';
  document.getElementById('artist-meta').style.color = '';
  document.querySelector('.back-btn').style.color = '';
  document.querySelector('.artist-page-header').style.borderColor = '';
  document.getElementById('page-artist').removeAttribute('data-display');
  document.getElementById('page-artist').classList.remove('visible');
  document.getElementById('artist-works').innerHTML = '';
}
