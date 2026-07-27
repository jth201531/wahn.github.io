window.artists = window.artists || [];
window.artists.push({
        name: '유영선', genre: 'Multimedia', works: '3 works', color: '#147bb7', display: 'c',
        adjectives: ['자기소개'],
        html: `<div class="display-c" id="fly-stage">
  <div class="work-grid youngsun-layout">
    <a class="w-item youngsun-work youngsun-work-player" href="#" aria-label="Youngsun work player"><span class="youngsun-caption">&lt;12번째 선수&gt;, 2채널, 2025</span></a>
    <a class="w-item youngsun-work youngsun-work-stone" href="#" aria-label="Youngsun work stone"><span class="youngsun-caption">&lt;돌이 되기&gt;, 알루미늄 호일, 2025</span></a>
    <a class="w-item youngsun-work youngsun-work-makeup" href="#" aria-label="Youngsun work makeup"><span class="youngsun-caption">&lt;화장 따라하기&gt;, 원형 스크린에 1채널, 2025</span></a>
  </div>
</div>`,
        init: initYoungsun
      });

const YOUNGSUN_LAYOUT_KEY = 'wahn-youngsun-layout-v1';
const YOUNGSUN_CAPTION_KEY = 'wahn-youngsun-captions-v1';
const YOUNGSUN_WORK_CLASSES = ['youngsun-work-player', 'youngsun-work-stone', 'youngsun-work-makeup'];

function initYoungsun() {
  applyYoungsunSavedLayout();
  applyYoungsunSavedCaptions();
  if (new URLSearchParams(window.location.search).get('edit') === 'youngsun') {
    initYoungsunLayoutEditor();
  }
  document.getElementById('fly-canvas').style.display = 'block';
  setTimeout(initYoungsunFlies, 1000);
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
