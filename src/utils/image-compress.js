/**
 * Image Compression Module
 * Uses Canvas API to resize and compress images client-side
 */

const MAX_DIMENSION = 1024;
const JPEG_QUALITY = 0.7;

/**
 * Compress an image file using Canvas API
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<{blob: Blob, dataUrl: string, originalSize: number, compressedSize: number}>}
 */
export async function compressImage(file, options = {}) {
  const {
    maxDimension = MAX_DIMENSION,
    quality = JPEG_QUALITY,
    outputType = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        try {
          const { width, height } = calculateDimensions(img.width, img.height, maxDimension);

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              const dataUrl = canvas.toDataURL(outputType, quality);
              resolve({
                blob,
                dataUrl,
                originalSize: file.size,
                compressedSize: blob.size,
                width,
                height,
              });
            },
            outputType,
            quality
          );
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Calculate new dimensions maintaining aspect ratio
 */
function calculateDimensions(width, height, maxDim) {
  if (width <= maxDim && height <= maxDim) {
    return { width, height };
  }

  const ratio = Math.min(maxDim / width, maxDim / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

/**
 * Check if a file is an image
 */
export function isImageFile(file) {
  return file.type.startsWith('image/');
}

/**
 * Check if a file is a PDF
 */
export function isPDFFile(file) {
  return file.type === 'application/pdf';
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Create a thumbnail data URL from a file
 */
export async function createThumbnail(file, maxSize = 200) {
  if (!isImageFile(file)) return null;

  const result = await compressImage(file, {
    maxDimension: maxSize,
    quality: 0.6,
  });

  return result.dataUrl;
}

/**
 * Validate file size
 */
export function validateFileSize(file, maxSizeMB = 5) {
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return `File size exceeds ${maxSizeMB}MB limit`;
  }
  return null;
}

/**
 * Validate file type
 */
export function validateFileType(file, allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']) {
  if (!allowedTypes.includes(file.type)) {
    return 'File type not supported. Please upload JPG, PNG, WebP, or PDF files.';
  }
  return null;
}
