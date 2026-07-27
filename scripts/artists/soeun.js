window.artists = window.artists || [];
window.artists.push({
        name: '박소은 / Soeun Park', genre: 'Oriental Paint', works: '— works', color: '#12201a', display: 'b',
        adjectives: ['자기소개'],
        html: `<div style="position:relative; width:100%; height:100%; background:#000; min-height:100vh;">
  <img id="soeun-hand" src="soeun/work1.png" style="width:300px; height:auto; position:absolute; top:2rem; left:2rem; transform-origin:center center; transition:transform 0.1s ease;">
  <img src="soeun/work2.png" style="width:220px; height:auto; position:absolute; top:2rem; right:2rem;">
</div>`,
        init: initSoeun
      });

function initSoeun() {
      setTimeout(() => {
        const img = document.getElementById('soeun-hand');
        if (!img) return;
        window.cursor.classList.add('hover');
        window.cursor.style.setProperty('--cursor-color', '#fff');
        const cursorStyle = document.createElement('style');
        cursorStyle.id = 'soeun-cursor-style';
        cursorStyle.textContent = `
          .cursor {
            --cursor-color: #fff;
            mix-blend-mode: difference !important;
            opacity: 1 !important;
          }
          .cursor-dot,
          .cursor-piece {
            background: #fff !important;
          }
          .cursor.hover {
            background: transparent !important;
          }
        `;
        document.head.appendChild(cursorStyle);

        const beamCanvas = document.createElement('canvas');
        beamCanvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:200;';
        beamCanvas.width = window.innerWidth;
        beamCanvas.height = window.innerHeight;
        document.body.appendChild(beamCanvas);
        const bctx = beamCanvas.getContext('2d');

        let beams = [];
        let charging = false, chargeStart = 0, chargeLevel = 0;
        let lastMouseX = 0, lastMouseY = 0;

        function getTip() {
          const r = img.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const angle = Math.atan2(lastMouseY - cy, lastMouseX - cx);
          return { x: cx + Math.cos(angle) * r.width * 0.48, y: cy + Math.sin(angle) * r.width * 0.48 };
        }

        function drawLoop() {
          bctx.clearRect(0, 0, beamCanvas.width, beamCanvas.height);

          // 충전 효과
          if (charging) {
            chargeLevel = Math.min(1, (Date.now() - chargeStart) / 600);
            const tip = getTip();
            const radius = 4 + chargeLevel * 18;
            const grd = bctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, radius);
            grd.addColorStop(0, `rgba(255,255,255,${0.9 * chargeLevel})`);
            grd.addColorStop(0.4, `rgba(200,200,200,${0.5 * chargeLevel})`);
            grd.addColorStop(1, 'rgba(255,255,255,0)');
            bctx.beginPath();
            bctx.arc(tip.x, tip.y, radius, 0, Math.PI * 2);
            bctx.fillStyle = grd;
            bctx.fill();
            bctx.beginPath();
            bctx.arc(tip.x, tip.y, radius * 0.6, 0, Math.PI * 2);
            bctx.strokeStyle = `rgba(255,255,255,${0.6 * chargeLevel})`;
            bctx.lineWidth = 1.5;
            bctx.stroke();
          }

          // 빔 그리기
          beams = beams.filter(b => b.alpha > 0);
          beams.forEach(b => {
            const dx = b.x2 - b.x1, dy = b.y2 - b.y1;
            const len = Math.sqrt(dx*dx + dy*dy) || 1;
            const nx = -dy/len, ny = dx/len;
            bctx.save();

            const outerGrd = bctx.createLinearGradient(b.x1, b.y1, b.x2, b.y2);
            outerGrd.addColorStop(0, `rgba(255,255,255,0)`);
            outerGrd.addColorStop(0.2, `rgba(255,255,255,${b.alpha * 0.15})`);
            outerGrd.addColorStop(0.5, `rgba(200,200,200,${b.alpha * 0.25})`);
            outerGrd.addColorStop(0.8, `rgba(255,255,255,${b.alpha * 0.15})`);
            outerGrd.addColorStop(1, `rgba(255,255,255,0)`);
            bctx.strokeStyle = outerGrd;
            bctx.lineWidth = 28; bctx.lineCap = 'round';
            bctx.shadowColor = 'rgba(255,255,255,0.3)'; bctx.shadowBlur = 20;
            bctx.beginPath(); bctx.moveTo(b.x1, b.y1); bctx.lineTo(b.x2, b.y2); bctx.stroke();

            bctx.shadowBlur = 12;
            bctx.strokeStyle = `rgba(180,180,180,${b.alpha * 0.5})`; bctx.lineWidth = 14;
            bctx.beginPath(); bctx.moveTo(b.x1, b.y1); bctx.lineTo(b.x2, b.y2); bctx.stroke();

            bctx.shadowBlur = 6;
            bctx.strokeStyle = `rgba(230,230,230,${b.alpha * 0.85})`; bctx.lineWidth = 6;
            bctx.beginPath(); bctx.moveTo(b.x1, b.y1); bctx.lineTo(b.x2, b.y2); bctx.stroke();

            bctx.shadowBlur = 0;
            bctx.strokeStyle = `rgba(255,255,255,${b.alpha})`; bctx.lineWidth = 2.5;
            bctx.beginPath(); bctx.moveTo(b.x1, b.y1); bctx.lineTo(b.x2, b.y2); bctx.stroke();

            if (b.alpha > 0.4) {
              bctx.strokeStyle = `rgba(255,255,255,${b.alpha * 0.4})`; bctx.lineWidth = 1;
              bctx.beginPath(); bctx.moveTo(b.x1, b.y1);
              for (let t = 0.05; t < 1; t += 0.08) {
                bctx.lineTo(b.x1 + dx*t + nx*(Math.random()-0.5)*10, b.y1 + dy*t + ny*(Math.random()-0.5)*10);
              }
              bctx.lineTo(b.x2, b.y2); bctx.stroke();
            }

            const flashGrd = bctx.createRadialGradient(b.x1, b.y1, 0, b.x1, b.y1, 16 + (1-b.alpha)*5);
            flashGrd.addColorStop(0, `rgba(255,255,255,${b.alpha * 0.9})`);
            flashGrd.addColorStop(1, `rgba(255,255,255,0)`);
            bctx.beginPath(); bctx.arc(b.x1, b.y1, 16, 0, Math.PI*2);
            bctx.fillStyle = flashGrd; bctx.fill();

            const impactR = (1 - b.alpha) * 40 * (0.5 + b.power * 0.5);
            if (impactR > 0) {
              bctx.globalAlpha = b.alpha * 0.8;
              bctx.beginPath(); bctx.arc(b.x2, b.y2, impactR, 0, Math.PI*2);
              bctx.strokeStyle = '#fff'; bctx.lineWidth = 2;
              bctx.shadowBlur = 8; bctx.shadowColor = '#fff'; bctx.stroke();
            }

            bctx.restore();
            b.alpha -= 0.018;
          });

          requestAnimationFrame(drawLoop);
        }
        drawLoop();

        const pageEl = document.getElementById('page-artist');
        pageEl.addEventListener('mousemove', e => {
          lastMouseX = e.clientX; lastMouseY = e.clientY;
          const r = img.getBoundingClientRect();
          const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          img.style.transform = `rotate(${Math.atan2(e.clientY-cy, e.clientX-cx)*180/Math.PI}deg)`;
        });
        pageEl.addEventListener('mousedown', e => {
          if (e.target.closest('.artist-page-header, .back-btn')) return;
          charging = true; chargeStart = Date.now(); chargeLevel = 0;
        });
        pageEl.addEventListener('mouseup', e => {
          if (!charging) return;
          charging = false;
          const tip = getTip();
          beams.push({ x1: tip.x, y1: tip.y, x2: e.clientX, y2: e.clientY, alpha: 1, power: chargeLevel });
          chargeLevel = 0;
        });

       beamCanvas._remove = () => {
          window.cursor.classList.remove('hover');
          window.cursor.style.removeProperty('--cursor-color');
          const s = document.getElementById('soeun-cursor-style');
          if (s) s.remove();
          beamCanvas.remove();
        };

        window._soeunCanvas = beamCanvas;
      }, 100);
    }
