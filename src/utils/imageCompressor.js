/**
 * imageCompressor.js
 * Compresses an image client-side using HTML5 Canvas
 * Reduces high-res phone camera shots from 5-10MB down to ~200-400KB
 */

export async function compressImage(fileOrDataUrl, maxWidth = 1280, maxHeight = 1280, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate aspect ratio preserving bounds
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      // Fill white background for transparent PNG conversions
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Export as compressed JPEG
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas image compression failed'));
            return;
          }
          const compressedFile = new File([blob], `photo_${Date.now()}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          resolve({
            file: compressedFile,
            dataUrl: compressedDataUrl,
            originalSize: typeof fileOrDataUrl === 'string' ? Math.round(fileOrDataUrl.length * 0.75) : fileOrDataUrl.size,
            compressedSize: blob.size,
            width,
            height,
          });
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = (err) => {
      reject(new Error('Failed to load image for compression'));
    };

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}

/**
 * Format bytes into human readable string
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
