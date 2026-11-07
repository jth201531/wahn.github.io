/* Three.js r128 CSS3D keeps record labels sharp and supports local file previews. */
function createRecordCarousel(stage, artists, onSelect, hiddenDisplays = new Set()) {
  const scene = new THREE.Scene();
  const ring = new THREE.Group();
  scene.add(ring);
  const camera = new THREE.PerspectiveCamera(40, 1, 1, 10000);
  const renderer = new THREE.CSS3DRenderer();
  renderer.domElement.className = 'record-carousel';
  renderer.domElement.style.zIndex = '1';
  stage.appendChild(renderer.domElement);
  stage.classList.add('record-orbit-stage');
  stage.tabIndex = 0;
  stage.setAttribute('role', 'region');
  stage.setAttribute('aria-label', '작가 레코드');

  const records = [];
  const homePosition = new THREE.Vector3();
  const homeTarget = new THREE.Vector3(0, 20, 0);
  const lookTarget = homeTarget.clone();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const visibleArtists = artists
    .map((artist, artistIndex) => ({ artist, artistIndex }))
    .filter(entry => !hiddenDisplays.has(entry.artist.display));
  const entries = Array.from({ length: visibleArtists.length + 10 }, () => null);
  visibleArtists.forEach((entry, index) => {
    entries[Math.floor(index * entries.length / visibleArtists.length)] = entry;
  });
  const step = Math.PI * 2 / entries.length;
  let radius = 300;
  const snapOffset = -Math.PI / 4;
  let rotation = snapOffset;
  let targetRotation = rotation;
  let frame = 0;
  let lastTime = 0;
  let settleTimer = 0;
  let paused = false;
  let drag = null;
  let suppressClick = false;
  let pan = null;
  let focusedIndex = -1;
  let hoveredIndex = -1;
  let backdrop = null;

  const notes = ['#e7edb8', '#eee0cc', '#d5e8e7', '#e4dcf0'];
  entries.forEach((entry, index) => {
    const artist = entry?.artist;
    const artistIndex = entry?.artistIndex;
    const group = new THREE.Group();
    const element = document.createElement('button');
    element.type = 'button';
    element.className = `orbit-record${artist ? '' : ' is-placeholder'}`;
    element.dataset.recordIndex = index;
    if (artist) {
      element.dataset.artistIndex = artistIndex;
      element.setAttribute('aria-label', `${artist.name}, ${artist.genre}`);
    } else {
      element.setAttribute('aria-label', '추가 작가를 위한 빈 레코드');
      element.setAttribute('aria-disabled', 'true');
      element.tabIndex = -1;
    }
    element.style.setProperty('--tile-accent', artist?.color || '#b8b9b7');
    element.style.setProperty('--note-color', artist ? notes[artistIndex % notes.length] : '#ecece5');
    element.style.setProperty('--note-angle', `${[-4, 3, -2, 4][index % 4]}deg`);
    const koreanName = artist?.name.split('/')[0].trim() || '';
    const face = () => `<span class="record-disc">
      <span class="record-surface"></span>
      <span class="record-label-center"></span>
    </span>
    <span class="record-sleeve">
      <span class="sleeve-imprint" aria-hidden="true">Wahn</span>
      <span class="record-postit"><span class="postit-name">${koreanName}</span><span class="postit-genre">${artist?.genre || ''}</span></span>
    </span>`;
    element.innerHTML = `<span class="orbit-face orbit-front">${face()}</span><span class="orbit-face orbit-back" aria-hidden="true">${face()}</span>`;
    const object = new THREE.CSS3DObject(element);
    group.add(object);
    ring.add(group);
    records.push({ group, element, index, artistIndex, lift: 0 });
    element.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch' || paused || pan || drag) return;
      hoveredIndex = index;
      wake();
    });
    element.addEventListener('pointerleave', () => {
      if (hoveredIndex === index) hoveredIndex = -1;
      wake();
    });
    element.addEventListener('focus', () => { if (!paused && !pan) { hoveredIndex = index; wake(); } });
    element.addEventListener('blur', () => { if (hoveredIndex === index) hoveredIndex = -1; wake(); });
    element.addEventListener('click', () => {
      if (!artist || suppressClick || drag?.moved || paused || pan) return;
      clearTimeout(settleTimer);
      onSelect(artistIndex, element);
    });
  });

  function updateRecords() {
    records.forEach(record => {
      const angle = record.index * step + rotation;
      const lift = record.lift;
      record.group.position.set(Math.sin(angle) * radius, 0, Math.cos(angle) * radius);
      // Record faces follow the radius like spokes, rather than the ring's outer wall.
      record.group.rotation.y = angle + Math.PI / 2;
      record.element.style.setProperty('--record-pull', lift.toFixed(4));
    });
  }

  function resize() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const mobile = width < 760;
    radius = Math.max(mobile ? 260 : 410, entries.length * (mobile ? 20 : 28));
    const size = mobile ? 235 : 310;
    stage.style.setProperty('--orbit-record-size', `${size}px`);
    camera.aspect = width / Math.max(1, height);
    camera.fov = mobile ? 49 : 40;
    const distance = mobile ? radius * 2.6 + 150 : radius * 2.9 + 160;
    homeTarget.x = mobile ? -radius * 0.65 : 0;
    homePosition.set(homeTarget.x, distance * 0.20, distance);
    renderer.setSize(width, height);
    camera.updateProjectionMatrix();
    if (pan || focusedIndex >= 0) reset();
    camera.position.copy(homePosition);
    lookTarget.copy(homeTarget);
    camera.lookAt(lookTarget);
    wake();
  }

  function wake() {
    if (!frame && !paused && !document.hidden) frame = requestAnimationFrame(render);
  }

  function render(now) {
    frame = 0;
    const delta = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 1 / 60;
    lastTime = now;
    const blend = reducedMotion ? 1 : 1 - Math.exp(-11 * delta);
    let moving = Math.abs(targetRotation - rotation) > 0.00005;
    rotation += (targetRotation - rotation) * blend;
    records.forEach(record => {
      const target = record.index === hoveredIndex && focusedIndex < 0 ? 1 : 0;
      if (Math.abs(record.lift - target) > 0.001) moving = true;
      record.lift += (target - record.lift) * blend;
    });
    updateRecords();
    if (pan) {
      const progress = Math.min(1, (now - pan.started) / pan.duration);
      const eased = progress * progress * (3 - 2 * progress);
      camera.position.lerpVectors(pan.fromPosition, pan.toPosition, eased);
      lookTarget.lerpVectors(pan.fromTarget, pan.toTarget, eased);
      camera.lookAt(lookTarget);
      moving = true;
      if (progress === 1) pan = null;
    }
    renderer.render(scene, camera);
    stage.dataset.rotation = rotation.toFixed(4);
    if (moving) wake();
  }

  function settle() {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      if (drag || paused || pan || focusedIndex >= 0) return;
      targetRotation = Math.round((targetRotation - snapOffset) / step) * step + snapOffset;
      wake();
    }, 200);
  }

  stage.addEventListener('wheel', event => {
    if (paused || pan || focusedIndex >= 0) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1;
    const amount = (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) * unit;
    targetRotation -= Math.max(-260, Math.min(260, amount)) * 0.0035;
    hoveredIndex = -1;
    wake();
    settle();
  }, { passive: false });

  stage.addEventListener('pointerdown', event => {
    if (paused || pan || focusedIndex >= 0 || event.button !== 0) return;
    clearTimeout(settleTimer);
    drag = { x: event.clientX, y: event.clientY, rotation: targetRotation, moved: false };
    suppressClick = false;
  });
  window.addEventListener('pointermove', event => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.hypot(dx, dy) > 7) drag.moved = true;
    if (!drag.moved) return;
    hoveredIndex = -1;
    targetRotation = drag.rotation + (Math.abs(dx) > Math.abs(dy) ? dx : -dy) * 0.006;
    stage.classList.add('is-orbit-dragging');
    wake();
  });
  function release(event) {
    if (!drag) return;
    suppressClick = drag.moved || event.type === 'pointercancel';
    drag = null;
    stage.classList.remove('is-orbit-dragging');
    settle();
    // The synthetic click after pointerup belongs to the drag that just ended.
    setTimeout(() => { suppressClick = false; }, 0);
  }
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  window.addEventListener('blur', () => { drag = null; stage.classList.remove('is-orbit-dragging'); });
  stage.addEventListener('keydown', event => {
    if (paused || pan || focusedIndex >= 0) return;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    clearTimeout(settleTimer);
    targetRotation += (['ArrowLeft', 'ArrowUp'].includes(event.key) ? 1 : -1) * step;
    wake();
  });

  function focus(index) {
    clearTimeout(settleTimer);
    targetRotation = rotation;
    const record = records.find(item => item.artistIndex === index);
    if (!record) return;
    if (backdrop) backdrop.remove();
    // Preserve the pre-pan camera view while the live renderer moves one record forward.
    backdrop = renderer.domElement.cloneNode(true);
    backdrop.classList.add('record-carousel-backdrop');
    backdrop.style.zIndex = '0';
    backdrop.inert = true;
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.querySelector(`[data-record-index="${record.index}"]`).querySelectorAll('.record-disc').forEach(disc => {
      disc.style.visibility = 'hidden';
    });
    stage.insertBefore(backdrop, renderer.domElement);
    focusedIndex = record.index;
    hoveredIndex = -1;
    updateRecords();
    scene.updateMatrixWorld(true);
    const center = record.group.getWorldPosition(new THREE.Vector3());
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(record.group.getWorldQuaternion(new THREE.Quaternion()));
    if (normal.dot(camera.position.clone().sub(center)) < 0) normal.negate();
    const diameter = Math.min(stage.clientWidth, stage.clientHeight) * 0.64;
    const halfFov = THREE.MathUtils.degToRad(camera.getEffectiveFOV()) / 2;
    const distance = record.element.clientWidth / (2 * Math.tan(halfFov) * Math.min(1, camera.aspect) * 0.64);
    const toPosition = center.clone().addScaledVector(normal, distance);
    pan = {
      started: performance.now(), duration: reducedMotion ? 80 : 980,
      fromPosition: camera.position.clone(), toPosition,
      fromTarget: lookTarget.clone(), toTarget: center
    };
    records.forEach(item => item.element.classList.toggle('is-selected', item === record));
    wake();
    return { diameter };
  }

  function reset() {
    if (backdrop) { backdrop.remove(); backdrop = null; }
    pan = null;
    focusedIndex = -1;
    hoveredIndex = -1;
    clearTimeout(settleTimer);
    targetRotation = rotation;
    records.forEach(record => { record.lift = 0; record.element.classList.remove('is-selected'); });
    camera.position.copy(homePosition);
    lookTarget.copy(homeTarget);
    camera.lookAt(lookTarget);
    updateRecords();
    renderer.render(scene, camera);
    wake();
  }

  function setPaused(value) {
    paused = value;
    if (paused) {
      clearTimeout(settleTimer);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      hoveredIndex = -1;
    } else {
      lastTime = 0;
      wake();
    }
    stage.inert = value;
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else { lastTime = 0; wake(); }
  });
  window.addEventListener('resize', resize);
  resize();
  document.fonts.ready.then(wake);
  return { focus, reset, setPaused };
}
