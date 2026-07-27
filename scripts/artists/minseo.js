window.artists = window.artists || [];
window.artists.push({
        name: '김민서', genre: 'Oriental Painting', works: '5 works', color: '#978EF9', display: 'minseo',
        adjectives: ['자기소개'],
        html: `<div class="display-e" id="bounce-stage">
  <canvas id="bounce-canvas"></canvas>
</div>`,
        init: initMinseo
      });

function initMinseo() {
  setTimeout(initMinseoBounce, 300);
}

function initMinseoBounce() {
  const oldCanvas = document.getElementById('bounce-canvas');
  if (!oldCanvas) return;
  const canvas = oldCanvas.cloneNode(false);
  oldCanvas.parentNode.replaceChild(canvas, oldCanvas);
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.width = window.innerWidth;
  canvas.height = document.documentElement.clientHeight;
  const ctx = canvas.getContext('2d');
  const hitCanvas = document.createElement('canvas');
  hitCanvas.width = canvas.width;
  hitCanvas.height = canvas.height;
  const hitCtx = hitCanvas.getContext('2d', { willReadFrequently: true });

      const images = [
        { src: 'minseo/work1.png', link: 'https://www.instagram.com/p/DJdxyALp1SL/' },
        { src: 'minseo/work2.png', link: 'https://www.instagram.com/p/DJdx163Jp7h/' },
        { src: 'minseo/work3.png', link: 'https://www.instagram.com/p/DJdyfxJJdfC/' },
        { src: 'minseo/work4.png', link: 'https://www.instagram.com/p/DJdyWAYpxHC/' },
        { src: 'minseo/work5.png', link: 'https://www.instagram.com/p/DEcxWFhSNAR/' },
      ];

      function extractPolygon(img, w, h, steps = 128) {
        const oc = document.createElement('canvas');
        oc.width = w; oc.height = h;
        const oc_ctx = oc.getContext('2d');
        oc_ctx.drawImage(img, 0, 0, w, h);
        const data = oc_ctx.getImageData(0, 0, w, h).data;
        const pts = [];
        for (let a = 0; a < steps; a++) {
          const angle = (a / steps) * Math.PI * 2;
          const cx = w / 2, cy = h / 2;
          const maxR = Math.sqrt(cx * cx + cy * cy);
          let foundR = 4;
          for (let r = maxR; r > 4; r -= 2) {
            const px = Math.round(cx + Math.cos(angle) * r);
            const py = Math.round(cy + Math.sin(angle) * r);
            if (px < 0 || px >= w || py < 0 || py >= h) continue;
            if (data[(py * w + px) * 4 + 3] > 20) { foundR = r; break; }
          }
          pts.push({ x: cx + Math.cos(angle) * foundR, y: cy + Math.sin(angle) * foundR });
        }
        return pts;
      }

      function polygonsOverlap(polyA, oxA, oyA, polyB, oxB, oyB) {
        for (const p of polyA) {
          if (pointInPolygon(p.x + oxA, p.y + oyA, polyB, oxB, oyB)) return true;
        }
        for (const p of polyB) {
          if (pointInPolygon(p.x + oxB, p.y + oyB, polyA, oxA, oyA)) return true;
        }
        for (let i = 0; i < polyA.length; i++) {
          const a1 = worldPoint(polyA[i], oxA, oyA);
          const a2 = worldPoint(polyA[(i + 1) % polyA.length], oxA, oyA);
          for (let j = 0; j < polyB.length; j++) {
            const b1 = worldPoint(polyB[j], oxB, oyB);
            const b2 = worldPoint(polyB[(j + 1) % polyB.length], oxB, oyB);
            if (segmentsIntersect(a1, a2, b1, b2)) return true;
          }
        }
        return false;
      }

      function worldPoint(p, ox, oy) {
        return { x: p.x + ox, y: p.y + oy };
      }

      function pointInPolygon(px, py, poly, ox, oy) {
        let inside = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
          const xi = poly[i].x + ox, yi = poly[i].y + oy;
          const xj = poly[j].x + ox, yj = poly[j].y + oy;
          if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) inside = !inside;
        }
        return inside;
      }

      function segmentsIntersect(a, b, c, d) {
        const o1 = orientation(a, b, c);
        const o2 = orientation(a, b, d);
        const o3 = orientation(c, d, a);
        const o4 = orientation(c, d, b);
        if (o1 !== o2 && o3 !== o4) return true;
        if (o1 === 0 && pointOnSegment(c, a, b)) return true;
        if (o2 === 0 && pointOnSegment(d, a, b)) return true;
        if (o3 === 0 && pointOnSegment(a, c, d)) return true;
        if (o4 === 0 && pointOnSegment(b, c, d)) return true;
        return false;
      }

      function orientation(a, b, c) {
        const v = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
        if (Math.abs(v) < 0.0001) return 0;
        return v > 0 ? 1 : 2;
      }

      function pointOnSegment(p, a, b) {
        return p.x <= Math.max(a.x, b.x) + 0.0001 && p.x >= Math.min(a.x, b.x) - 0.0001 &&
          p.y <= Math.max(a.y, b.y) + 0.0001 && p.y >= Math.min(a.y, b.y) - 0.0001;
      }

      function canvasPoint(e) {
        const rect = canvas.getBoundingClientRect();
        return {
          x: (e.clientX - rect.left) * (canvas.width / rect.width),
          y: (e.clientY - rect.top) * (canvas.height / rect.height),
        };
      }

      function findTopHitBall(x, y) {
        const px = Math.floor(x);
        const py = Math.floor(y);
        if (px < 0 || px >= hitCanvas.width || py < 0 || py >= hitCanvas.height) return null;
        const data = hitCtx.getImageData(px, py, 1, 1).data;
        if (data[3] <= 20) return null;

        let bestBall = null;
        let bestDiff = Infinity;
        balls.forEach(ball => {
          const diff = Math.abs(data[0] - ball.hitColor);
          if (diff < bestDiff) {
            bestDiff = diff;
            bestBall = ball;
          }
        });
        return bestDiff <= 12 ? bestBall : null;
      }

      let loaded = 0;
      const balls = images.map((item, idx) => {
        const img = new Image();
        const w = 220;
        const ball = {
          img, w, h: 220, link: item.link, polygon: null, hitCanvas: null, hitColor: (idx + 1) * 40,
          x: Math.random() * (canvas.width - w),
          y: Math.random() * (canvas.height - 220),
          vx: (Math.random() - 0.5) * 4 + (Math.random() > 0.5 ? 2 : -2),
          vy: (Math.random() - 0.5) * 4 + (Math.random() > 0.5 ? 2 : -2),
        };
        img.onload = () => {
          const ratio = img.naturalHeight / img.naturalWidth;
          ball.h = w * ratio;
          ball.polygon = extractPolygon(img, w, ball.h);
          const pw = Math.floor(w);
          const ph = Math.floor(ball.h);
          const oc = document.createElement('canvas');
          oc.width = pw; oc.height = ph;
          oc.getContext('2d').drawImage(img, 0, 0, pw, ph);
          ball.pw = pw;
          ball.ph = ph;
          ball.offscreen = oc;
          ball.pixelData = oc.getContext('2d').getImageData(0, 0, pw, ph).data;
          const hitMask = document.createElement('canvas');
          hitMask.width = pw;
          hitMask.height = ph;
          const maskCtx = hitMask.getContext('2d');
          maskCtx.drawImage(img, 0, 0, pw, ph);
          maskCtx.globalCompositeOperation = 'source-in';
          maskCtx.fillStyle = `rgb(${ball.hitColor}, 0, 0)`;
          maskCtx.fillRect(0, 0, pw, ph);
          ball.hitCanvas = hitMask;
          loaded++;
        };
        img.src = item.src;
        return ball;
      });

      let boundsW = canvas.width;
      let boundsH = canvas.height;

      function resizeBounceCanvas() {
        const oldW = boundsW || window.innerWidth;
        const oldH = boundsH || document.documentElement.clientHeight;
        canvas.width = window.innerWidth;
        canvas.height = document.documentElement.clientHeight;
        hitCanvas.width = canvas.width;
        hitCanvas.height = canvas.height;
        boundsW = canvas.width;
        boundsH = canvas.height;
        const sx = boundsW / oldW;
        const sy = boundsH / oldH;
        balls.forEach(b => {
          b.x = Math.min(Math.max(0, b.x * sx), Math.max(0, boundsW - b.w));
          b.y = Math.min(Math.max(0, b.y * sy), Math.max(0, boundsH - b.h));
        });
      }

      window.addEventListener('resize', resizeBounceCanvas);

      let mouseX = -999, mouseY = -999;
      canvas.addEventListener('mousemove', e => {
        const p = canvasPoint(e);
        mouseX = p.x;
        mouseY = p.y;
      });
      canvas.addEventListener('mouseleave', () => {
        mouseX = -999;
        mouseY = -999;
        window.cursor.classList.remove('hover');
      });

      function clampBall(b) {
        if (b.x < 0) { b.x = 0; b.vx = Math.abs(b.vx); }
        if (b.x + b.w > boundsW) { b.x = boundsW - b.w; b.vx = -Math.abs(b.vx); }
        if (b.y < 0) { b.y = 0; b.vy = Math.abs(b.vy); }
        if (b.y + b.h > boundsH) { b.y = boundsH - b.h; b.vy = -Math.abs(b.vy); }
      }

      let animFrame;
      let active = true;
      function loop() {
        if (!active) return;

        balls.forEach(b => {
          b.x += b.vx;
          b.y += b.vy;
          clampBall(b);
        });

        if (loaded === balls.length) {
          for (let i = 0; i < balls.length; i++) {
            for (let j = i + 1; j < balls.length; j++) {
              const a = balls[i], b = balls[j];
              if (!a.polygon || !b.polygon) continue;
              if (polygonsOverlap(a.polygon, a.x, a.y, b.polygon, b.x, b.y)) {
                const acx = a.x + a.w / 2, acy = a.y + a.h / 2;
                const bcx = b.x + b.w / 2, bcy = b.y + b.h / 2;
                const dx = acx - bcx, dy = acy - bcy;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const nx = dx / dist, ny = dy / dist;
                const relVx = a.vx - b.vx, relVy = a.vy - b.vy;
                const dot = relVx * nx + relVy * ny;
                if (dot < 0) {
                  const impulse = dot * 0.8;
                  a.vx -= impulse * nx; a.vy -= impulse * ny;
                  b.vx += impulse * nx; b.vy += impulse * ny;
                }
                a.x += nx * 2; a.y += ny * 2;
                b.x -= nx * 2; b.y -= ny * 2;
                clampBall(a);
                clampBall(b);
              }
            }
          }
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hitCtx.clearRect(0, 0, hitCanvas.width, hitCanvas.height);
        balls.forEach(b => {
          if (b.img.complete && b.img.naturalWidth > 0) {
            ctx.drawImage(b.img, b.x, b.y, b.w, b.h);
            if (b.hitCanvas) hitCtx.drawImage(b.hitCanvas, b.x, b.y, b.w, b.h);
          }
        });

        if (mouseX >= 0 && mouseY >= 0) {
          const hitBall = findTopHitBall(mouseX, mouseY);
          window.cursor.classList.toggle('hover', Boolean(hitBall));
        }

        animFrame = requestAnimationFrame(loop);
      }

      canvas.addEventListener('click', e => {
        const p = canvasPoint(e);
        const hitBall = findTopHitBall(p.x, p.y);
        if (hitBall) window.open(hitBall.link, '_blank');
      });

      loop();
      canvas._stop = () => {
        active = false;
        window.removeEventListener('resize', resizeBounceCanvas);
        cancelAnimationFrame(animFrame);
      };
    }
