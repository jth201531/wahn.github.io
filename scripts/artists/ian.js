window.artists = window.artists || [];
window.artists.push({
        name: '이안(理𡚴) iAn', genre: 'Photography', works: '4 works', color: '#A8C5B5', display: 'a',
        adjectives: ['세상을 평온하게 물들이다'],
        html: `<div class="display-a"><div class="scroll-track" id="track-0">
        <a class="s-card" href="#" style="background:#1a1a2e"><span class="s-card-label">Work 01</span></a>
        <a class="s-card" href="#" style="background:#16213e"><span class="s-card-label">Work 02</span></a>
        <a class="s-card" href="#" style="background:#0f3460"><span class="s-card-label">Work 03</span></a>
        <a class="s-card" href="#" style="background:#2d2d2d"><span class="s-card-label">Work 04</span></a>
        <a class="s-card" href="#" style="background:#1a1a2e"><span class="s-card-label">Work 05</span></a>
        <a class="s-card" href="#" style="background:#0f3460"><span class="s-card-label">Work 06</span></a>
      </div><p class="hint">← drag to explore</p></div>`,
        init: initIan
      });

function initIan() {
      const track = document.getElementById('track-0');
      if (!track) return;
      let isDragging = false, startX = 0, sl = 0;
      track.addEventListener('mousedown', e => { isDragging = true; startX = e.pageX; sl = track.scrollLeft; });
      document.addEventListener('mousemove', e => { if (!isDragging) return; track.scrollLeft = sl - (e.pageX - startX); });
      document.addEventListener('mouseup', () => isDragging = false);
    }
