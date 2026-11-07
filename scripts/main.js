const cursor = document.getElementById('cursor');
window.cursor = cursor;
let cursorX = -80;
let cursorY = -80;
let cursorFrame = null;
document.addEventListener('mousemove', event => {
  cursorX = event.clientX;
  cursorY = event.clientY;
  if (cursorFrame) return;
  cursorFrame = requestAnimationFrame(() => {
    cursorFrame = null;
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
  });
});
document.addEventListener('mouseover', event => {
  const interactive = event.target.closest('.orbit-record:not(.is-placeholder), .youngsun-object, .youngsun-transition-gate, .youngsun-ttori-wanderer, .youngsun-contract-drop, .youngsun-pdf-close, .youngsun-work-back, .back-btn, a.logo, .artist-transition-gate, .archive-toggle, .archive-close, .archive-list-item');
  cursor.classList.toggle('hover', Boolean(interactive));
});

['youngsun/ttori_the_dog/ttori.png',
 'youngsun/ttori_the_dog/ttori_the_dog.webp',
 'youngsun/ttori_the_dog/ttori_wall.png',
 'youngsun/ttori_the_dog/ttori_sit.png',
 'youngsun/ttori_the_dog/contract.png',
 'youngsun/makeup_following/makeup_thumb.png',
 'youngsun/makeup_following/makeup_photo.jpg',
 'youngsun/makeup_following/makeup_01_keyed.png',
 'youngsun/makeup_following/makeup_01.png',
 'youngsun/makeup_following/makeup_02.png',
 ...Array.from({ length: 17 }, (_, index) => `soeun/애니메이션/${index + 1}.PNG`),
 'minseo/work1.png', 'minseo/work2.png', 'minseo/work3.png', 'minseo/work4.png', 'minseo/work5.png'
].forEach(src => { const image = new Image(); image.src = src; });

const artists = window.artists || [];
// Remove a key to restore iAn (a) or Minseo (minseo) on screen.
const hiddenArtistDisplays = new Set(['a', 'minseo']);
const stage = document.getElementById('stage');
let isOpeningArtist = false;
let transitionTimers = [];
const carousel = createRecordCarousel(stage, artists, openArtistFromRecord, hiddenArtistDisplays);

function queueTransition(callback, delay) {
  const id = setTimeout(() => {
    transitionTimers = transitionTimers.filter(timer => timer !== id);
    callback();
  }, delay);
  transitionTimers.push(id);
}

function resetStagePan() {
  transitionTimers.forEach(clearTimeout);
  transitionTimers = [];
  document.querySelectorAll('.artist-transition-card, .artist-transition-gate').forEach(element => element.remove());
  document.body.classList.remove('artist-transitioning');
  stage.classList.remove('panning');
  cursor.classList.remove('hover');
  isOpeningArtist = false;
  carousel.reset();
}

const archiveToggle = document.querySelector('.archive-toggle');
const archivePanel = document.getElementById('archive-panel');
const archiveClose = document.querySelector('.archive-close');
const archiveList = document.getElementById('archive-list');

function setArchiveOpen(open) {
  document.body.classList.toggle('archive-open', open);
  archivePanel.setAttribute('aria-hidden', String(!open));
  archiveToggle.setAttribute('aria-expanded', String(open));
  cursor.classList.remove('hover');
  carousel.setPaused(open || document.getElementById('page-artist').classList.contains('visible'));
}

artists.forEach((artist, index) => {
  if (hiddenArtistDisplays.has(artist.display)) return;
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
archiveToggle.addEventListener('click', () => setArchiveOpen(!document.body.classList.contains('archive-open')));
archiveClose.addEventListener('click', () => setArchiveOpen(false));
archivePanel.addEventListener('click', event => { if (event.target === archivePanel) setArchiveOpen(false); });
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (isOpeningArtist) resetStagePan();
  else if (document.body.classList.contains('archive-open')) setArchiveOpen(false);
});

function createTransitionGate() {
  const gate = document.createElement('button');
  gate.type = 'button';
  gate.className = 'artist-transition-gate';
  gate.setAttribute('aria-label', '작가 페이지 진입 취소');
  gate.innerHTML = `<svg viewBox="0 0 48 48" aria-hidden="true">
    <circle class="gate-base" cx="24" cy="24" r="19.5"></circle>
    <circle class="gate-progress" cx="24" cy="24" r="19.5"></circle>
    <g class="gate-x">
      <line class="gate-x-line" x1="18" y1="18" x2="30" y2="30"></line>
      <line class="gate-x-line" x1="30" y1="18" x2="18" y2="30"></line>
    </g></svg>`;
  gate.addEventListener('click', resetStagePan);
  document.body.appendChild(gate);
  return gate;
}

function openArtistFromRecord(index, element) {
  if (isOpeningArtist) return;
  isOpeningArtist = true;
  stage.classList.add('panning');
  document.body.classList.add('artist-transitioning');
  const artist = artists[index];
  const rect = element.getBoundingClientRect();
  const card = document.createElement('div');
  card.className = 'artist-transition-card';
  card.style.left = `${rect.left}px`;
  card.style.top = `${rect.top}px`;
  card.style.width = `${rect.width}px`;
  card.innerHTML = `<div class="tile-back-name">${artist.name}</div><div class="tile-back-genre">${artist.genre}</div>`;
  document.body.appendChild(card);
  const gate = createTransitionGate();
  const framing = carousel.focus(index);
  if (framing) {
    card.style.setProperty('--pan-disc-size', `${framing.diameter}px`);
    gate.style.setProperty('--pan-disc-size', `${framing.diameter}px`);
  }
  requestAnimationFrame(() => card.classList.add('to-center'));
  queueTransition(() => {
    gate.classList.add('visible');
    requestAnimationFrame(() => gate.classList.add('filling'));
    let opened = false;
    const finish = () => {
      if (opened || !isOpeningArtist) return;
      opened = true;
      card.classList.add('exit');
      gate.classList.add('exit');
      const page = document.getElementById('page-artist');
      page.classList.add('from-pan');
      openArtist(index);
      queueTransition(() => {
        page.classList.remove('from-pan');
        resetStagePan();
      }, 720);
    };
    gate.querySelector('.gate-progress').addEventListener('animationend', finish, { once: true });
    queueTransition(finish, 1780);
  }, 980);
}

if (new URLSearchParams(window.location.search).get('edit') === 'youngsun') {
  const index = artists.findIndex(artist => artist.display === 'c');
  if (index >= 0) setTimeout(() => openArtist(index), 80);
}

function openArtist(index) {
  const artist = artists[index];
  if (!artist) return;
  const page = document.getElementById('page-artist');
  resetArtistHeaderControls();
  document.getElementById('header-artist-name').textContent = artist.name;
  document.getElementById('artist-meta').textContent = `${artist.genre} · ${artist.works}`;
  document.getElementById('artist-works').innerHTML = artist.html;
  page.dataset.display = artist.display || '';
  page.classList.add('visible');
  page.scrollTop = 0;
  carousel.setPaused(true);
  const dark = artist.theme === 'dark';
  page.style.background = dark ? '#000' : 'var(--bg)';
  page.style.color = dark ? '#fff' : '';
  document.getElementById('header-artist-name').style.color = dark ? '#fff' : '';
  document.getElementById('artist-meta').style.color = dark ? 'rgba(255,255,255,0.5)' : '';
  document.querySelector('.back-btn').style.color = dark ? 'rgba(255,255,255,0.5)' : '';
  document.querySelector('.artist-page-header').style.borderColor = dark ? 'rgba(255,255,255,0.1)' : '';
  if (typeof artist.init === 'function') artist.init();
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
  if (window._soeunAnimation) { window._soeunAnimation._remove(); window._soeunAnimation = null; }
  if (window._fliesAbort) { window._fliesAbort.abort(); window._fliesAbort = null; }
  if (window._youngsunEditorAbort) { window._youngsunEditorAbort.abort(); window._youngsunEditorAbort = null; }
  if (typeof window.stopYoungsunMakeupCamera === 'function') window.stopYoungsunMakeupCamera();
  const fc = document.getElementById('fly-canvas');
  if (fc && fc._stop) { fc._stop(); fc._stop = null; }
  if (fc) { fc.style.display = 'none'; fc.width = 1; }
  const bc = document.getElementById('bounce-canvas');
  if (bc && bc._stop) { bc._stop(); bc._stop = null; }
  resetStagePan();
  cursor.classList.remove('hover');
  const page = document.getElementById('page-artist');
  page.classList.remove('from-pan');
  resetArtistHeaderControls();
  page.style.background = 'var(--bg)';
  page.style.color = '';
  document.getElementById('header-artist-name').style.color = '';
  document.getElementById('artist-meta').style.color = '';
  document.querySelector('.back-btn').style.color = '';
  document.querySelector('.artist-page-header').style.borderColor = '';
  page.removeAttribute('data-display');
  page.classList.remove('visible');
  document.getElementById('artist-works').innerHTML = '';
  carousel.setPaused(false);
}
