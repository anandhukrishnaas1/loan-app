/**
 * File Uploader Component
 * Drag-and-drop file upload with preview and compression
 */

import { compressImage, isImageFile, formatFileSize, validateFileSize, validateFileType } from '../utils/image-compress.js';
import { showToast } from './toast.js';

/**
 * Create a file uploader for a specific document category
 */
export function createFileUploader(category, options = {}) {
  const {
    maxFiles = 5,
    maxSizeMB = 5,
    accept = 'image/jpeg,image/png,image/webp,application/pdf',
    onFilesChange = () => {},
  } = options;

  const files = [];

  const wrapper = document.createElement('div');
  wrapper.className = 'file-uploader';
  wrapper.dataset.category = category;

  // Drop Zone
  const zone = document.createElement('div');
  zone.className = 'upload-zone';
  zone.id = `upload-zone-${category}`;
  zone.innerHTML = `
    <div class="upload-zone-icon">📁</div>
    <div class="upload-zone-text">
      Drag & drop files here or <strong>click to browse</strong>
    </div>
    <div class="upload-zone-hint">
      JPG, PNG, WebP or PDF • Max ${maxSizeMB}MB per file
    </div>
  `;

  // Hidden file input
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = accept;
  input.multiple = true;
  input.className = 'visually-hidden';
  input.id = `file-input-${category}`;

  // Preview grid
  const previewGrid = document.createElement('div');
  previewGrid.className = 'upload-preview-grid';
  previewGrid.id = `preview-grid-${category}`;

  // Events
  zone.addEventListener('click', () => input.click());

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('dragover');
  });

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('dragover');
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });

  input.addEventListener('change', () => {
    if (input.files.length) {
      handleFiles(input.files);
      input.value = '';
    }
  });

  async function handleFiles(fileList) {
    for (const file of Array.from(fileList)) {
      if (files.length >= maxFiles) {
        showToast('error', 'Limit Reached', `Maximum ${maxFiles} files allowed`);
        break;
      }

      // Validate type
      const typeError = validateFileType(file);
      if (typeError) {
        showToast('error', 'Invalid File', typeError);
        continue;
      }

      // Validate size
      const sizeError = validateFileSize(file, maxSizeMB);
      if (sizeError) {
        showToast('error', 'File Too Large', sizeError);
        continue;
      }

      let processedFile = {
        id: Date.now() + Math.random().toString(36).slice(2),
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: null,
        compressedSize: null,
      };

      // Compress images
      if (isImageFile(file)) {
        try {
          const result = await compressImage(file);
          processedFile.preview = result.dataUrl;
          processedFile.compressedSize = result.compressedSize;
          processedFile.blob = result.blob;
        } catch {
          // Fall back to original file
          processedFile.preview = URL.createObjectURL(file);
        }
      }

      files.push(processedFile);
      renderPreview(processedFile);
    }

    onFilesChange(files.map(f => ({
      id: f.id, name: f.name, size: f.size, type: f.type,
      compressedSize: f.compressedSize,
    })));
  }

  function renderPreview(file) {
    const item = document.createElement('div');
    item.className = 'upload-preview-item';
    item.dataset.fileId = file.id;

    if (file.preview) {
      const thumb = document.createElement('img');
      thumb.className = 'upload-preview-thumb';
      thumb.src = file.preview;
      thumb.alt = file.name;
      item.appendChild(thumb);
    } else {
      const icon = document.createElement('div');
      icon.className = 'upload-preview-file-icon';
      icon.textContent = file.type === 'application/pdf' ? '📄' : '📎';
      item.appendChild(icon);
    }

    const info = document.createElement('div');
    info.className = 'upload-preview-info';
    info.innerHTML = `
      <div class="upload-preview-name" title="${file.name}">${file.name}</div>
      <div class="upload-preview-size">${formatFileSize(file.compressedSize || file.size)}${file.compressedSize ? ' (compressed)' : ''}</div>
    `;
    item.appendChild(info);

    // Simulated upload progress
    const progress = document.createElement('div');
    progress.className = 'upload-progress';
    const bar = document.createElement('div');
    bar.className = 'upload-progress-bar';
    bar.style.width = '0%';
    progress.appendChild(bar);
    item.appendChild(progress);

    // Simulate upload progress
    let w = 0;
    const interval = setInterval(() => {
      w += Math.random() * 30 + 10;
      if (w >= 100) {
        w = 100;
        clearInterval(interval);
        setTimeout(() => progress.remove(), 500);
      }
      bar.style.width = w + '%';
    }, 200);

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'upload-preview-remove';
    removeBtn.innerHTML = '×';
    removeBtn.title = 'Remove file';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = files.findIndex(f => f.id === file.id);
      if (idx > -1) files.splice(idx, 1);
      item.remove();
      onFilesChange(files.map(f => ({
        id: f.id, name: f.name, size: f.size, type: f.type,
      })));
    });
    item.appendChild(removeBtn);

    previewGrid.appendChild(item);
  }

  wrapper.appendChild(zone);
  wrapper.appendChild(input);
  wrapper.appendChild(previewGrid);

  // Public API
  wrapper.getFiles = () => files;
  wrapper.hasFiles = () => files.length > 0;
  wrapper.getFileCount = () => files.length;

  return wrapper;
}
