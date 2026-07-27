window.artists = window.artists || [];
window.artists.push({
        name: '유영선', genre: 'Multimedia', works: '3 works', color: '#147bb7', display: 'c',
        adjectives: ['자기소개'],
        html: `<div class="display-c youngsun-main-page" id="fly-stage" aria-label="유영선 메인 영역">
  <div class="youngsun-object-field">
    <button class="youngsun-object youngsun-object-ttori" type="button" data-youngsun-work="ttori" aria-label="또리는 강쥐">
      <span class="youngsun-object-fill" aria-hidden="true"><img src="youngsun/ttori_the_dog/ttori.png" alt=""></span>
      <img class="youngsun-object-img" src="youngsun/ttori_the_dog/ttori.png" alt="">
    </button>
  </div>
  <section class="youngsun-work-detail" data-youngsun-detail="ttori" aria-hidden="true">
    <button class="youngsun-ttori-wanderer" type="button" data-ttori-wanderer aria-label="또리 계약서 떨어뜨리기">
      <img class="youngsun-ttori-wanderer-img" data-ttori-img data-run-src="youngsun/ttori_the_dog/ttori.png" data-sit-src="youngsun/ttori_the_dog/ttori_sit.png" src="youngsun/ttori_the_dog/ttori.png" alt="">
    </button>
    <button class="youngsun-contract-drop" type="button" data-ttori-contract aria-label="또리 입양 계약서 보기">
      <img src="youngsun/ttori_the_dog/contract.png" alt="">
    </button>
    <div class="youngsun-pdf-panel" data-ttori-pdf-panel aria-hidden="true">
      <button class="youngsun-pdf-close" type="button" data-ttori-pdf-close aria-label="계약서 닫기">×</button>
      <iframe class="youngsun-pdf-frame" src="youngsun/ttori_the_dog/ttori_contract.pdf" title="또리 입양 계약서"></iframe>
    </div>
    <div class="youngsun-work-detail-title">또리는 강쥐</div>
  </section>
</div>`,
        init: initYoungsun
      });

const YOUNGSUN_WORK_META = {
  ttori: {
    caption: '<또리는 강쥐>, 2022, 벽면에 흑연, 가변설치',
  },
};

const YOUNGSUN_TTORI_TRANSITION_IMAGE = 'youngsun/ttori_the_dog/ttori_the_dog.webp';
const YOUNGSUN_TTORI_TRANSITION_RATIO = 173 / 225;
const YOUNGSUN_LAYOUT_KEY = 'wahn-youngsun-layout-v1';
const YOUNGSUN_CAPTION_KEY = 'wahn-youngsun-captions-v1';
const YOUNGSUN_WORK_CLASSES = ['youngsun-work-player', 'youngsun-work-stone', 'youngsun-work-makeup'];

function initYoungsun() {
  if (window._fliesAbort) { window._fliesAbort.abort(); window._fliesAbort = null; }
  if (window._youngsunEditorAbort) { window._youngsunEditorAbort.abort(); window._youngsunEditorAbort = null; }
  document.body.classList.remove('youngsun-editing');
  const flyCanvas = document.getElementById('fly-canvas');
  if (flyCanvas) {
    if (flyCanvas._stop) { flyCanvas._stop(); flyCanvas._stop = null; }
    flyCanvas.style.display = 'none';
    flyCanvas.width = 1;
    flyCanvas.height = 1;
  }
  restoreYoungsunArtistHeader();
  initYoungsunMainObjects();
}

function initYoungsunMainObjects() {
  const stage = document.querySelector('.youngsun-main-page');
  if (!stage) return;
  const fillDuration = 1050;

  stage.querySelectorAll('.youngsun-object').forEach(object => {
    let fillTimer = null;

    const resetFill = () => {
      clearTimeout(fillTimer);
      object.classList.remove('is-filling', 'is-filled');
      object.setAttribute('aria-pressed', 'false');
    };

    object.addEventListener('pointerenter', () => {
      clearTimeout(fillTimer);
      object.classList.add('is-filling');
      fillTimer = setTimeout(() => {
        object.classList.add('is-filled');
        object.setAttribute('aria-pressed', 'true');
      }, fillDuration);
    });

    object.addEventListener('pointerleave', () => {
      if (!stage.classList.contains('is-work-open') && !stage.classList.contains('is-work-transitioning')) resetFill();
    });

    object.addEventListener('click', e => {
      if (!object.classList.contains('is-filled')) {
        e.preventDefault();
        return;
      }
      startYoungsunWorkTransition(stage, object, object.dataset.youngsunWork);
    });
  });

  stage.querySelectorAll('[data-youngsun-back]').forEach(button => {
    button.addEventListener('click', () => closeYoungsunWork(stage));
  });

  initYoungsunTtoriInteraction(stage);
}

function startYoungsunWorkTransition(stage, object, workId) {
  const detail = stage.querySelector(`[data-youngsun-detail="${workId}"]`);
  if (!detail || stage.classList.contains('is-work-open') || stage.classList.contains('is-work-transitioning')) return;

  clearYoungsunWorkTransition(stage, { resetObjects: false, immediate: true });

  const stageRect = stage.getBoundingClientRect();
  const objectRect = object.getBoundingClientRect();
  const startHeight = objectRect.height;
  const startWidth = startHeight * YOUNGSUN_TTORI_TRANSITION_RATIO;
  const startLeft = objectRect.left - stageRect.left + objectRect.width / 2 - startWidth / 2;
  const startTop = objectRect.top - stageRect.top + objectRect.height / 2 - startHeight / 2;
  const overlay = document.createElement('div');
  overlay.className = 'youngsun-work-transition';
  overlay.style.setProperty('--transition-start-left', `${startLeft}px`);
  overlay.style.setProperty('--transition-start-top', `${startTop}px`);
  overlay.style.setProperty('--transition-start-width', `${startWidth}px`);
  overlay.style.setProperty('--transition-start-height', `${startHeight}px`);
  overlay.innerHTML = `
    <div class="youngsun-work-transition-image" aria-hidden="true">
      <img src="${YOUNGSUN_TTORI_TRANSITION_IMAGE}" alt="">
    </div>
    <button class="youngsun-transition-gate" type="button" aria-label="또리는 강쥐 진입 취소">
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle class="gate-base" cx="24" cy="24" r="19.5"></circle>
        <circle class="gate-progress" cx="24" cy="24" r="19.5"></circle>
        <g class="gate-x">
          <line class="gate-x-line" x1="18" y1="18" x2="30" y2="30"></line>
          <line class="gate-x-line" x1="30" y1="18" x2="18" y2="30"></line>
        </g>
      </svg>
    </button>`;

  const gate = overlay.querySelector('.youngsun-transition-gate');
  const progress = overlay.querySelector('.gate-progress');
  let didOpen = false;

  stage._youngsunWorkTransitionOverlay = overlay;
  stage._youngsunWorkTransitionTimers = [];
  stage.classList.add('is-work-transitioning');
  object.classList.add('is-opening');
  object.disabled = true;
  stage.appendChild(overlay);

  const cancel = event => {
    event?.preventDefault();
    event?.stopPropagation();
    if (didOpen) return;
    clearYoungsunWorkTransition(stage, { resetObjects: true });
  };

  const finish = () => {
    if (didOpen) return;
    if (!stage.classList.contains('is-work-transitioning') || stage._youngsunWorkTransitionOverlay !== overlay) return;
    didOpen = true;
    clearYoungsunWorkTransitionTimers(stage);
    if (!document.body.contains(stage)) return;
    overlay.classList.add('is-exit');
    gate.classList.add('exit');
    openYoungsunWork(stage, workId);
    stage.classList.remove('is-work-transitioning');
    object.classList.remove('is-opening');
    object.disabled = false;
    window.cursor?.classList.remove('hover');
    stage._youngsunWorkTransitionOverlay = null;
    window.setTimeout(() => overlay.remove(), 620);
  };

  gate.addEventListener('click', cancel);
  progress.addEventListener('animationend', finish, { once: true });

  requestAnimationFrame(() => overlay.classList.add('is-active'));
  setYoungsunWorkTransitionTimer(stage, () => {
    if (!stage.classList.contains('is-work-transitioning')) return;
    gate.classList.add('visible');
    requestAnimationFrame(() => gate.classList.add('filling'));
  }, 880);
  setYoungsunWorkTransitionTimer(stage, finish, 2700);
}

function setYoungsunWorkTransitionTimer(stage, fn, delay) {
  stage._youngsunWorkTransitionTimers = stage._youngsunWorkTransitionTimers || [];
  const timer = window.setTimeout(() => {
    stage._youngsunWorkTransitionTimers = (stage._youngsunWorkTransitionTimers || []).filter(id => id !== timer);
    fn();
  }, delay);
  stage._youngsunWorkTransitionTimers.push(timer);
  return timer;
}

function clearYoungsunWorkTransitionTimers(stage) {
  (stage._youngsunWorkTransitionTimers || []).forEach(timer => clearTimeout(timer));
  stage._youngsunWorkTransitionTimers = [];
}

function clearYoungsunWorkTransition(stage, { resetObjects = true, immediate = false } = {}) {
  if (!stage) return;
  clearYoungsunWorkTransitionTimers(stage);
  const overlay = stage._youngsunWorkTransitionOverlay;
  stage.classList.remove('is-work-transitioning');
  stage.querySelectorAll('.youngsun-object').forEach(object => {
    object.classList.remove('is-opening');
    object.disabled = false;
    if (resetObjects) {
      object.classList.remove('is-filling', 'is-filled');
      object.setAttribute('aria-pressed', 'false');
    }
  });
  window.cursor?.classList.remove('hover');

  if (!overlay) return;
  stage._youngsunWorkTransitionOverlay = null;
  if (immediate) {
    overlay.remove();
    return;
  }
  overlay.classList.add('is-canceling');
  window.setTimeout(() => overlay.remove(), 420);
}

function openYoungsunWork(stage, workId) {
  const detail = stage.querySelector(`[data-youngsun-detail="${workId}"]`);
  if (!detail) return;
  stage.classList.add('is-work-open');
  stage.querySelectorAll('.youngsun-work-detail').forEach(panel => {
    const active = panel === detail;
    panel.classList.toggle('is-visible', active);
    panel.setAttribute('aria-hidden', active ? 'false' : 'true');
  });
  setYoungsunWorkHeader(stage, workId);
  if (workId === 'ttori') startYoungsunTtoriIntro(stage);
}

function closeYoungsunWork(stage) {
  clearYoungsunWorkTransition(stage, { resetObjects: true, immediate: true });
  stage.classList.remove('is-work-open');
  stage.querySelectorAll('.youngsun-work-detail').forEach(panel => {
    panel.classList.remove('is-visible');
    panel.setAttribute('aria-hidden', 'true');
  });
  stage.querySelectorAll('.youngsun-object').forEach(object => {
    object.classList.remove('is-filling', 'is-filled');
    object.setAttribute('aria-pressed', 'false');
  });
  resetYoungsunTtori(stage);
  restoreYoungsunArtistHeader();
}

function initYoungsunTtoriInteraction(stage) {
  const detail = stage.querySelector('[data-youngsun-detail="ttori"]');
  const ttori = detail?.querySelector('[data-ttori-wanderer]');
  const contract = detail?.querySelector('[data-ttori-contract]');
  const pdfClose = detail?.querySelector('[data-ttori-pdf-close]');
  if (!detail || !ttori || !contract || !pdfClose) return;

  resetYoungsunTtori(stage);
  ttori.addEventListener('click', () => triggerYoungsunTtoriDrop(stage));
  contract.addEventListener('click', () => openYoungsunTtoriPdf(stage));
  pdfClose.addEventListener('click', e => {
    e.preventDefault();
    closeYoungsunTtoriPdf(stage);
  });
}

function resetYoungsunTtori(stage) {
  const detail = stage?.querySelector('[data-youngsun-detail="ttori"]');
  const ttori = detail?.querySelector('[data-ttori-wanderer]');
  const ttoriImg = detail?.querySelector('[data-ttori-img]');
  const contract = detail?.querySelector('[data-ttori-contract]');
  const pdfPanel = detail?.querySelector('[data-ttori-pdf-panel]');
  if (!detail || !ttori || !ttoriImg || !contract || !pdfPanel) return;

  clearTimeout(stage._ttoriStartTimer);
  clearTimeout(stage._ttoriSitTimer);
  clearTimeout(stage._ttoriContractReadyTimer);
  detail.classList.remove('is-ttori-ready', 'is-ttori-intro', 'is-contract-dropping', 'is-ttori-settled', 'is-contract-ready', 'is-pdf-open');
  ttori.classList.remove('is-paused', 'is-sitting');
  ttori.disabled = false;
  ttori.removeAttribute('style');
  contract.classList.remove('is-dropping');
  contract.disabled = true;
  contract.removeAttribute('style');
  pdfPanel.setAttribute('aria-hidden', 'true');
  ttoriImg.src = ttoriImg.dataset.runSrc;
}

function startYoungsunTtoriIntro(stage) {
  const detail = stage?.querySelector('[data-youngsun-detail="ttori"]');
  if (!detail) return;

  resetYoungsunTtori(stage);
  detail.classList.add('is-ttori-intro');
  clearTimeout(stage._ttoriStartTimer);
  stage._ttoriStartTimer = setTimeout(() => {
    if (!detail.classList.contains('is-visible') || detail.classList.contains('is-contract-dropping')) return;
    detail.classList.remove('is-ttori-intro');
    detail.classList.add('is-ttori-ready');
  }, 1000);
}

function triggerYoungsunTtoriDrop(stage) {
  const detail = stage.querySelector('[data-youngsun-detail="ttori"]');
  const ttori = detail?.querySelector('[data-ttori-wanderer]');
  const ttoriImg = detail?.querySelector('[data-ttori-img]');
  const contract = detail?.querySelector('[data-ttori-contract]');
  if (!detail || !ttori || !ttoriImg || !contract) return;
  if (!detail.classList.contains('is-visible') || detail.classList.contains('is-contract-dropping')) return;

  const detailRect = detail.getBoundingClientRect();
  const ttoriRect = ttori.getBoundingClientRect();
  const left = ttoriRect.left - detailRect.left;
  const top = ttoriRect.top - detailRect.top;
  const contractSize = clampNumber(detailRect.width * 0.085, 58, 116);
  const startX = clampNumber(left + ttoriRect.width * 0.08 - contractSize * 0.5, 12, detailRect.width - contractSize - 12);
  const startY = clampNumber(top + ttoriRect.height * 0.52 - contractSize * 0.48, 12, detailRect.height - contractSize - 12);
  const endX = clampNumber(startX + detailRect.width * 0.08, 18, detailRect.width - contractSize - 18);
  const endY = Math.max(startY + 44, detailRect.height - contractSize - clampNumber(detailRect.height * 0.055, 20, 54));

  clearTimeout(stage._ttoriStartTimer);
  detail.classList.remove('is-ttori-ready', 'is-ttori-intro');
  ttori.style.animation = 'none';
  ttori.style.left = `${left}px`;
  ttori.style.top = `${top}px`;
  ttori.style.width = `${ttoriRect.width}px`;
  ttori.style.transform = 'none';
  ttori.classList.add('is-paused');
  ttori.disabled = true;

  contract.style.width = `${contractSize}px`;
  contract.style.setProperty('--contract-start-x', `${startX}px`);
  contract.style.setProperty('--contract-start-y', `${startY}px`);
  contract.style.setProperty('--contract-end-x', `${endX}px`);
  contract.style.setProperty('--contract-end-y', `${endY}px`);
  contract.classList.remove('is-dropping');
  contract.getBoundingClientRect();
  detail.classList.add('is-contract-dropping');
  contract.classList.add('is-dropping');
  contract.disabled = true;

  clearTimeout(stage._ttoriSitTimer);
  clearTimeout(stage._ttoriContractReadyTimer);
  stage._ttoriContractReadyTimer = setTimeout(() => {
    contract.disabled = false;
    detail.classList.add('is-contract-ready');
  }, 1360);
  stage._ttoriSitTimer = setTimeout(() => {
    ttoriImg.src = ttoriImg.dataset.sitSrc;
    ttori.classList.add('is-sitting');
    detail.classList.add('is-ttori-settled');
  }, 1720);
}

function openYoungsunTtoriPdf(stage) {
  const detail = stage.querySelector('[data-youngsun-detail="ttori"]');
  const contract = detail?.querySelector('[data-ttori-contract]');
  const pdfPanel = detail?.querySelector('[data-ttori-pdf-panel]');
  if (!detail || !contract || !pdfPanel) return;
  if (!detail.classList.contains('is-contract-ready')) return;

  contract.disabled = true;
  detail.classList.add('is-pdf-open');
  pdfPanel.setAttribute('aria-hidden', 'false');
}

function closeYoungsunTtoriPdf(stage) {
  startYoungsunTtoriIntro(stage);
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setYoungsunWorkHeader(stage, workId) {
  const work = YOUNGSUN_WORK_META[workId];
  const page = document.getElementById('page-artist');
  const headerName = document.getElementById('header-artist-name');
  const artistMeta = document.getElementById('artist-meta');
  const backButton = document.querySelector('.back-btn');
  if (!work || !page || !headerName || !artistMeta || !backButton) return;

  page.classList.add('youngsun-work-header');
  headerName.textContent = work.caption;
  artistMeta.textContent = '';
  backButton.innerHTML = '<span class="back-arr">←</span><span>Works</span>';
  backButton.onclick = event => {
    event.preventDefault();
    closeYoungsunWork(stage);
  };
}

function restoreYoungsunArtistHeader() {
  const page = document.getElementById('page-artist');
  const headerName = document.getElementById('header-artist-name');
  const artistMeta = document.getElementById('artist-meta');
  const backButton = document.querySelector('.back-btn');
  if (!page || !headerName || !artistMeta || !backButton) return;

  page.classList.remove('youngsun-work-header');
  headerName.textContent = '유영선';
  artistMeta.textContent = 'Multimedia · 3 works';
  backButton.innerHTML = '<span class="back-arr">←</span><span>Back</span>';
  backButton.onclick = event => {
    event.preventDefault();
    closeArtist();
  };
}

function applyYoungsunSavedLayout() {
  const saved = readYoungsunLayout();
  if (!saved) return;
  saved.forEach(item => {
    const el = document.querySelector(`.${item.cls}`);
    if (!el) return;
    el.style.left = `${item.left}px`;
    el.style.top = `${item.top}px`;
    el.style.right = 'auto';
    el.style.width = `${item.width}px`;
    el.style.height = `${item.height}px`;
  });
}

function readYoungsunLayout() {
  try {
    const saved = localStorage.getItem(YOUNGSUN_LAYOUT_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (err) {
    return null;
  }
}

function readYoungsunCaptions() {
  try {
    const saved = localStorage.getItem(YOUNGSUN_CAPTION_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (err) {
    return null;
  }
}

function applyYoungsunSavedCaptions() {
  const saved = readYoungsunCaptions();
  document.querySelectorAll('.youngsun-caption').forEach(caption => {
    if (!caption.dataset.defaultText) caption.dataset.defaultText = caption.textContent;
  });
  if (!saved) return;
  saved.forEach(item => {
    const el = document.querySelector(`.${item.cls} .youngsun-caption`);
    if (!el) return;
    if (typeof item.text === 'string') el.textContent = item.text;
    el.style.left = `${item.left}px`;
    el.style.top = `${item.top}px`;
    el.style.bottom = 'auto';
    if (item.maxWidth) el.style.maxWidth = `${item.maxWidth}px`;
  });
}

function captureYoungsunCaptions() {
  return Array.from(document.querySelectorAll('.youngsun-work')).map(work => {
    const caption = work.querySelector('.youngsun-caption');
    if (!caption) return null;
    const workRect = work.getBoundingClientRect();
    const captionRect = caption.getBoundingClientRect();
    return {
      cls: getYoungsunWorkClass(work),
      text: caption.textContent.trim(),
      left: Math.round(captionRect.left - workRect.left),
      top: Math.round(captionRect.top - workRect.top),
      maxWidth: Math.round(captionRect.width),
    };
  }).filter(item => item && item.cls);
}

function saveYoungsunCaptions() {
  localStorage.setItem(YOUNGSUN_CAPTION_KEY, JSON.stringify(captureYoungsunCaptions()));
}

function getYoungsunWorkClass(el) {
  return YOUNGSUN_WORK_CLASSES.find(cls => el.classList.contains(cls));
}

function captureYoungsunLayout() {
  const grid = document.querySelector('.youngsun-layout');
  if (!grid) return [];
  const gridRect = grid.getBoundingClientRect();
  return Array.from(document.querySelectorAll('.youngsun-work')).map(el => {
    const r = el.getBoundingClientRect();
    return {
      cls: getYoungsunWorkClass(el),
      left: Math.round(r.left - gridRect.left),
      top: Math.round(r.top - gridRect.top),
      width: Math.round(r.width),
      height: Math.round(r.height),
    };
  }).filter(item => item.cls);
}

function buildYoungsunLayoutCss(layout = captureYoungsunLayout(), captions = captureYoungsunCaptions()) {
  const workCss = layout.map(item => `.display-c .${item.cls} {
  left: ${item.left}px;
  top: ${item.top}px;
  right: auto;
  width: ${item.width}px;
  height: ${item.height}px;
}`).join('\n\n');
  const captionCss = captions.map(item => `.display-c .${item.cls} .youngsun-caption {
  left: ${item.left}px;
  top: ${item.top}px;
  bottom: auto;
  max-width: ${item.maxWidth}px;
} /* ${item.text} */`).join('\n\n');
  return [workCss, captionCss].filter(Boolean).join('\n\n');
}

function saveYoungsunLayout(panelTextarea) {
  const layout = captureYoungsunLayout();
  const captions = captureYoungsunCaptions();
  localStorage.setItem(YOUNGSUN_LAYOUT_KEY, JSON.stringify(layout));
  localStorage.setItem(YOUNGSUN_CAPTION_KEY, JSON.stringify(captions));
  if (panelTextarea) panelTextarea.value = buildYoungsunLayoutCss(layout, captions);
}

function initYoungsunLayoutEditor() {
  if (window._youngsunEditorAbort) window._youngsunEditorAbort.abort();
  window._youngsunEditorAbort = new AbortController();
  const signal = window._youngsunEditorAbort.signal;
  const grid = document.querySelector('.youngsun-layout');
  const items = Array.from(document.querySelectorAll('.youngsun-work'));
  if (!grid || !items.length) return;

  document.body.classList.add('youngsun-editing');
  document.querySelector('.youngsun-editor-panel')?.remove();

  const panel = document.createElement('div');
  panel.className = 'youngsun-editor-panel';
  panel.innerHTML = `
    <div class="youngsun-editor-title">Youngsun Layout</div>
    <textarea readonly spellcheck="false"></textarea>
    <div class="youngsun-editor-actions">
      <button type="button" data-action="copy">Copy CSS</button>
      <button type="button" data-action="reset">Reset</button>
    </div>`;
  document.body.appendChild(panel);
  const textarea = panel.querySelector('textarea');

  function finishEdit() {
    saveYoungsunLayout(textarea);
  }

  items.forEach(el => {
    el.setAttribute('draggable', 'false');
    el.style.right = 'auto';
    const caption = el.querySelector('.youngsun-caption');
    if (caption) {
      caption.dataset.defaultText = caption.dataset.defaultText || caption.textContent;
      caption.contentEditable = 'true';
      caption.spellcheck = false;
      caption.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
      }, { signal });
      caption.addEventListener('input', () => {
        saveYoungsunCaptions();
        finishEdit();
      }, { signal });
      caption.addEventListener('pointerdown', e => {
        if (e.button !== 0) return;
        e.stopPropagation();
        const workRect = el.getBoundingClientRect();
        const captionRect = caption.getBoundingClientRect();
        const start = {
          x: e.clientX,
          y: e.clientY,
          left: captionRect.left - workRect.left,
          top: captionRect.top - workRect.top,
        };
        let dragging = false;

        const onMove = moveEvent => {
          const dx = moveEvent.clientX - start.x;
          const dy = moveEvent.clientY - start.y;
          if (!dragging && Math.hypot(dx, dy) < 4) return;
          if (!dragging) {
            dragging = true;
            caption.blur();
            caption.contentEditable = 'false';
            caption.classList.add('is-editing');
          }
          caption.style.left = `${Math.round(start.left + dx)}px`;
          caption.style.top = `${Math.round(start.top + dy)}px`;
          caption.style.bottom = 'auto';
          saveYoungsunCaptions();
          finishEdit();
        };

        const onUp = () => {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          caption.classList.remove('is-editing');
          caption.contentEditable = 'true';
          if (!dragging) caption.focus();
          saveYoungsunCaptions();
          finishEdit();
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp, { once: true });
      }, { signal });
    }
    if (!el.querySelector('.youngsun-resize-handle')) {
      const handle = document.createElement('span');
      handle.className = 'youngsun-resize-handle';
      el.appendChild(handle);
    }

    el.addEventListener('click', e => e.preventDefault(), { signal });
    el.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      e.preventDefault();
      const gridRect = grid.getBoundingClientRect();
      const itemRect = el.getBoundingClientRect();
      const isResize = e.target.classList.contains('youngsun-resize-handle');
      const start = {
        x: e.clientX,
        y: e.clientY,
        left: itemRect.left - gridRect.left,
        top: itemRect.top - gridRect.top,
        width: itemRect.width,
        height: itemRect.height,
      };
      el.classList.add('is-editing');

      const onMove = moveEvent => {
        const dx = moveEvent.clientX - start.x;
        const dy = moveEvent.clientY - start.y;
        if (isResize) {
          el.style.width = `${Math.max(80, Math.round(start.width + dx))}px`;
          el.style.height = `${Math.max(80, Math.round(start.height + dy))}px`;
        } else {
          el.style.left = `${Math.max(0, Math.round(start.left + dx))}px`;
          el.style.top = `${Math.max(0, Math.round(start.top + dy))}px`;
          el.style.right = 'auto';
        }
        finishEdit();
      };

      const onUp = () => {
        el.classList.remove('is-editing');
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        finishEdit();
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp, { once: true });
    }, { signal });
  });

  panel.querySelector('[data-action="copy"]').addEventListener('click', async () => {
    textarea.value = buildYoungsunLayoutCss();
    textarea.select();
    try {
      await navigator.clipboard.writeText(textarea.value);
    } catch (err) {
      document.execCommand('copy');
    }
  }, { signal });

  panel.querySelector('[data-action="reset"]').addEventListener('click', () => {
    localStorage.removeItem(YOUNGSUN_LAYOUT_KEY);
    localStorage.removeItem(YOUNGSUN_CAPTION_KEY);
    items.forEach(el => {
      el.style.left = '';
      el.style.top = '';
      el.style.right = '';
      el.style.width = '';
      el.style.height = '';
      const caption = el.querySelector('.youngsun-caption');
      if (caption) {
        caption.textContent = caption.dataset.defaultText || caption.textContent;
        caption.style.left = '';
        caption.style.top = '';
        caption.style.bottom = '';
        caption.style.maxWidth = '';
      }
    });
    textarea.value = buildYoungsunLayoutCss();
  }, { signal });

  signal.addEventListener('abort', () => {
    document.body.classList.remove('youngsun-editing');
    document.querySelectorAll('.youngsun-caption').forEach(caption => {
      caption.contentEditable = 'false';
      caption.classList.remove('is-editing');
    });
    panel.remove();
  }, { once: true });

  saveYoungsunLayout(textarea);
}

function initYoungsunFlies() {
      if (window._fliesAbort) window._fliesAbort.abort();
      window._fliesAbort = new AbortController();
      const signal = window._fliesAbort.signal;
      const canvas = document.getElementById('fly-canvas');
    if (!canvas) return;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.width = window.innerWidth;
    canvas.height = document.documentElement.clientHeight;
    const ctx = canvas.getContext('2d');
      const stage = document.getElementById('fly-stage');

      const FLY_COUNT = 600;
      const FLEE_RADIUS = 140;
      const FLEE_SPEED = 8;

      // 작품 영역은 page-artist 내부 좌표로 보관해서 스크롤 때 흔들리지 않게 한다.
      const items = document.querySelectorAll('.w-item');
      const pageEl = document.getElementById('page-artist');
      if (!items.length) {
        canvas.style.display = 'none';
        return;
      }

      function getItemRect(el) {
        const r = el.getBoundingClientRect();
        const scrollTop = pageEl.scrollTop;
        return {
          left: r.left, top: r.top + scrollTop,
          right: r.right, bottom: r.bottom + scrollTop,
          width: r.width, height: r.height,
        };
      }

      const itemRects = Array.from(items).map(getItemRect);

      function updateItemRects() {
        Array.from(document.querySelectorAll('.w-item')).forEach((el, i) => {
          if (!itemRects[i]) return;
          Object.assign(itemRects[i], getItemRect(el));
        });
      }

      const flies = Array.from({ length: FLY_COUNT }, () => {
        // 랜덤하게 작품 하나 선택
        const r = itemRects[Math.floor(Math.random() * itemRects.length)];
        const homeRatioX = Math.random();
        const homeRatioY = Math.random();
        const x = r.left + homeRatioX * r.width;
        const y = r.top + homeRatioY * r.height;
        return {
          x, y,
          homeRatioX,
          homeRatioY,
          itemRect: r,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          angle: Math.random() * Math.PI * 2,
          wingAngle: Math.random() * Math.PI,
          size: Math.random() * 6 + 10,
          fleeing: false,
        };
      });

      let mx = -999, my = -999;

        document.getElementById('page-artist').addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY + pageEl.scrollTop;
        updateItemRects();
      }, { signal });
      document.getElementById('page-artist').addEventListener('mouseleave', () => { mx = -999; my = -999; }, { signal });


      function drawFly(f, scrollTop) {
        ctx.save();
        ctx.translate(f.x, f.y - scrollTop);
        ctx.rotate(f.angle);

        // 몸통
        ctx.beginPath();
        ctx.ellipse(0, 0, f.size * 0.5, f.size, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(10,10,10,0.92)';
        ctx.fill();

        // 날개
        const w = Math.abs(Math.sin(f.wingAngle)) * f.size * 2.5;
        ctx.beginPath();
        ctx.ellipse(-w * 0.5, -f.size * 0.3, w * 0.5, f.size * 0.6, -0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(30,30,30,0.5)';
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(w * 0.5, -f.size * 0.3, w * 0.5, f.size * 0.6, 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      let animFrame;
      let active = true;
      function loop() {
        if (!active) return;
        const scrollTop = pageEl.scrollTop;
        updateItemRects();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.beginPath();
        itemRects.forEach(r => ctx.rect(r.left, r.top - scrollTop, r.width, r.height));
        ctx.clip();

        flies.forEach(f => {
          const dx = f.x - mx;
          const dy = f.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          if (dist < FLEE_RADIUS) {
            const force = (FLEE_RADIUS - dist) / FLEE_RADIUS;
            f.vx += (dx / dist) * force * FLEE_SPEED;
            f.vy += (dy / dist) * force * FLEE_SPEED;
            f.fleeing = true;
          } else {
            f.fleeing = false;
            const homeX = f.itemRect.left + f.homeRatioX * f.itemRect.width;
            const homeY = f.itemRect.top + f.homeRatioY * f.itemRect.height;
            const hx = homeX - f.x;
            const hy = homeY - f.y;
            f.vx += hx * 0.03;
            f.vy += hy * 0.03;
            f.vx += (Math.random() - 0.5) * 0.4;
            f.vy += (Math.random() - 0.5) * 0.4;
          }

          const speed = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
          const maxSpeed = f.fleeing ? 14 : 6;
          if (speed > maxSpeed) { f.vx = f.vx / speed * maxSpeed; f.vy = f.vy / speed * maxSpeed; }
          if (speed > 0.5) { f.vx *= 0.96; f.vy *= 0.96; }
          f.x += f.vx;
          f.y += f.vy;
          f.angle = Math.atan2(f.vy, f.vx) + Math.PI / 2;
          f.wingAngle += 0.3;

          const r = f.itemRect;
          if (f.x < r.left) { f.x = r.left; f.vx *= -1; }
          if (f.x > r.right) { f.x = r.right; f.vx *= -1; }
          if (f.y < r.top) { f.y = r.top; f.vy *= -1; }
          if (f.y > r.bottom) { f.y = r.bottom; f.vy *= -1; }

          drawFly(f, scrollTop);
        });

        ctx.restore();


        animFrame = requestAnimationFrame(loop);
      }

      loop();
      canvas._stop = () => {
        active = false;
        cancelAnimationFrame(animFrame);
      };
    }
