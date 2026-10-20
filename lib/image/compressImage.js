import imageCompression from 'browser-image-compression';

export const IMAGE_PRESETS = {
  product: { maxWidthOrHeight: 1600, maxSizeMB: 0.9, quality: 0.85 },
  thumbnail: { maxWidthOrHeight: 600, maxSizeMB: 0.2, quality: 0.8 },
  banner: { maxWidthOrHeight: 1920, maxSizeMB: 0.9, quality: 0.82 },
  blog: { maxWidthOrHeight: 1280, maxSizeMB: 0.6, quality: 0.8 },
  logo: { maxWidthOrHeight: 512, maxSizeMB: 0.15, quality: 0.9 },
};

function toWebP(file, quality) {
  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' })),
        'image/webp', quality
      );
    };
    img.src = url;
  });
}

export async function compressAndConvert(file, preset) {
  const compressed = await imageCompression(file, {
    maxSizeMB: preset.maxSizeMB,
    maxWidthOrHeight: preset.maxWidthOrHeight,
    useWebWorker: true,
  });
  return toWebP(compressed, preset.quality);
}
