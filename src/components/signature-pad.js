/**
 * Signature Pad Component
 * Canvas-based e-signature capture with smooth strokes
 */

export function createSignaturePad(options = {}) {
  const {
    width = 600,
    height = 200,
    strokeColor = '#ffffff',
    strokeWidth = 2.5,
    onChange = () => {},
  } = options;

  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let paths = []; // For undo
  let currentPath = [];
  let isEmpty = true;

  const container = document.createElement('div');
  container.className = 'signature-container';
  container.style.position = 'relative';

  const canvas = document.createElement('canvas');
  canvas.className = 'signature-canvas';
  canvas.id = 'signature-canvas';
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Placeholder text
  const placeholder = document.createElement('div');
  placeholder.className = 'signature-placeholder';
  placeholder.textContent = 'Sign here';

  // Signature line
  const line = document.createElement('div');
  line.className = 'signature-line';

  // Controls
  const controls = document.createElement('div');
  controls.className = 'signature-controls';

  const undoBtn = document.createElement('button');
  undoBtn.type = 'button';
  undoBtn.className = 'btn btn-sm btn-secondary';
  undoBtn.textContent = '↩ Undo';
  undoBtn.addEventListener('click', undo);

  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.className = 'btn btn-sm btn-danger';
  clearBtn.textContent = '✕ Clear';
  clearBtn.addEventListener('click', clear);

  const downloadBtn = document.createElement('button');
  downloadBtn.type = 'button';
  downloadBtn.className = 'btn btn-sm btn-secondary';
  downloadBtn.textContent = '⬇ Download';
  downloadBtn.addEventListener('click', download);

  const leftControls = document.createElement('div');
  leftControls.style.display = 'flex';
  leftControls.style.gap = '0.5rem';
  leftControls.appendChild(undoBtn);
  leftControls.appendChild(clearBtn);

  controls.appendChild(leftControls);
  controls.appendChild(downloadBtn);

  container.appendChild(canvas);
  container.appendChild(placeholder);
  container.appendChild(line);
  container.appendChild(controls);

  // Resize canvas to match container
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    redraw();
  }

  // Drawing handlers
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  function startDraw(e) {
    e.preventDefault();
    isDrawing = true;
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
    currentPath = [{ x: pos.x, y: pos.y }];
    placeholder.style.opacity = '0';
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    // Smooth with quadratic curve
    const midX = (lastX + pos.x) / 2;
    const midY = (lastY + pos.y) / 2;
    ctx.quadraticCurveTo(lastX, lastY, midX, midY);
    ctx.stroke();

    currentPath.push({ x: pos.x, y: pos.y });
    lastX = pos.x;
    lastY = pos.y;
  }

  function endDraw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    isDrawing = false;
    if (currentPath.length > 1) {
      paths.push([...currentPath]);
      isEmpty = false;
      onChange(getDataUrl());
    }
    currentPath = [];
  }

  // Mouse events
  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', endDraw);
  canvas.addEventListener('mouseleave', endDraw);

  // Touch events
  canvas.addEventListener('touchstart', startDraw);
  canvas.addEventListener('touchmove', draw);
  canvas.addEventListener('touchend', endDraw);
  canvas.addEventListener('touchcancel', endDraw);

  function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const path of paths) {
      if (path.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        const midX = (path[i - 1].x + path[i].x) / 2;
        const midY = (path[i - 1].y + path[i].y) / 2;
        ctx.quadraticCurveTo(path[i - 1].x, path[i - 1].y, midX, midY);
      }
      ctx.stroke();
    }
  }

  function undo() {
    if (paths.length > 0) {
      paths.pop();
      redraw();
      isEmpty = paths.length === 0;
      if (isEmpty) placeholder.style.opacity = '1';
      onChange(isEmpty ? null : getDataUrl());
    }
  }

  function clear() {
    paths = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    isEmpty = true;
    placeholder.style.opacity = '1';
    onChange(null);
  }

  function download() {
    if (isEmpty) return;
    const link = document.createElement('a');
    link.download = 'signature.png';
    link.href = getDataUrl();
    link.click();
  }

  function getDataUrl() {
    return canvas.toDataURL('image/png');
  }

  // Observe resize
  const observer = new ResizeObserver(() => {
    const oldPaths = [...paths];
    resizeCanvas();
    paths = oldPaths;
    redraw();
  });

  // Public API
  container.init = () => {
    observer.observe(canvas);
    setTimeout(resizeCanvas, 100);
  };

  container.isEmpty = () => isEmpty;
  container.getDataUrl = getDataUrl;
  container.clear = clear;

  container.loadFromDataUrl = (dataUrl) => {
    if (!dataUrl) return;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      isEmpty = false;
      placeholder.style.opacity = '0';
    };
    img.src = dataUrl;
  };

  return container;
}
