window.artists = window.artists || [];
window.artists.push({
  name: '박소은 / Soeun Park',
  genre: 'Oriental Painting',
  works: '— works',
  color: '#12201a',
  display: 'b',
  adjectives: ['자기소개'],
  html: `<div class="display-b soeun-main-page" aria-label="박소은 메인 영역"></div>`,
  init: initSoeun
});

function initSoeun() {
  if (window._soeunCanvas) {
    window._soeunCanvas._remove();
    window._soeunCanvas = null;
  }
}
