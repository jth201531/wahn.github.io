window.artists = window.artists || [];
window.artists.push({
  name: '박소은 / Soeun Park',
  genre: 'Oriental Painting',
  works: '— works',
  color: '#12201a',
  display: 'b',
  adjectives: ['자기소개'],
  html: `<div class="display-b soeun-main-page" aria-label="박소은 메인 영역">
    <canvas class="soeun-animation-canvas" data-soeun-animation></canvas>
  </div>`,
  init: initSoeun
});

const SOEUN_ANIMATION_DIR = 'soeun/애니메이션';
const SOEUN_ANIMATION_FRAMES = Array.from({ length: 17 }, (_, index) => `${SOEUN_ANIMATION_DIR}/${index + 1}.PNG`);

function initSoeun() {
  if (window._soeunCanvas) {
    window._soeunCanvas._remove();
    window._soeunCanvas = null;
  }
  if (window._soeunAnimation) {
    window._soeunAnimation._remove();
    window._soeunAnimation = null;
  }

  const stage = document.querySelector('.soeun-main-page');
  const canvas = document.querySelector('[data-soeun-animation]');
  if (!stage || !canvas) return;

  const ctx = canvas.getContext('2d');
  const holdMs = 1000;
  const travelMs = 3600;
  const naturalWidth = 834;
  const naturalHeight = 1194;
  let frameId = 0;
  let startTime = 0;
  let dpr = 1;
  let width = 1;
  let height = 1;
  let removed = false;
  let images = [];

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function easeInOutCubic(value) {
    return value < 0.5
      ? 4 * value * value * value
      : 1 - Math.pow(-2 * value + 2, 3) / 2;
  }

  function resize() {
    const rect = stage.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function loadFrame(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }

  function drawFrame(image, alpha, progress) {
    const fit = Math.min(width / naturalWidth, height / naturalHeight);
    const push = easeInOutCubic(progress);
    const scale = fit * (1.08 + push * 0.18);
    const drawWidth = naturalWidth * scale;
    const drawHeight = naturalHeight * scale;
    const x = width * (0.5 - push * 0.018) - drawWidth * 0.5;
    const y = height * (0.52 - push * 0.024) - drawHeight * 0.5;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, x, y, drawWidth, drawHeight);
    ctx.restore();
  }

  function drawImpact(progress) {
    if (progress < 0.94) return;
    const amount = clamp((progress - 0.94) / 0.06, 0, 1);
    const gradient = ctx.createRadialGradient(
      width * 0.5,
      height * 0.5,
      Math.min(width, height) * 0.08,
      width * 0.5,
      height * 0.5,
      Math.max(width, height) * 0.52
    );
    gradient.addColorStop(0, `rgba(255, 255, 255, ${0.10 * amount})`);
    gradient.addColorStop(0.45, `rgba(255, 255, 255, ${0.03 * amount})`);
    gradient.addColorStop(1, `rgba(10, 10, 10, ${0.12 * amount})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  function render(now) {
    if (removed) return;
    if (!startTime) startTime = now;

    ctx.clearRect(0, 0, width, height);
    if (!images.length) {
      frameId = requestAnimationFrame(render);
      return;
    }

    const elapsed = now - startTime;
    const rawProgress = clamp((elapsed - holdMs) / travelMs, 0, 1);
    const progress = easeInOutCubic(rawProgress);
    const framePosition = progress * (images.length - 1);
    const frameIndex = Math.min(images.length - 2, Math.floor(framePosition));
    const mix = clamp(framePosition - frameIndex, 0, 1);

    if (rawProgress <= 0) {
      drawFrame(images[0], 1, 0);
    } else if (progress >= 1) {
      drawFrame(images[images.length - 1], 1, 1);
    } else {
      drawFrame(images[frameIndex], 1 - mix, progress);
      drawFrame(images[frameIndex + 1], mix, progress);
    }
    drawImpact(progress);

    frameId = requestAnimationFrame(render);
  }

  resize();
  window.addEventListener('resize', resize);
  frameId = requestAnimationFrame(render);

  Promise.all(SOEUN_ANIMATION_FRAMES.map(loadFrame)).then(loadedImages => {
    if (removed) return;
    images = loadedImages;
    startTime = 0;
  }).catch(error => {
    console.warn('Failed to load Soeun animation frames', error);
  });

  window._soeunAnimation = {
    _remove() {
      removed = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      ctx.clearRect(0, 0, width, height);
    }
  };
}
