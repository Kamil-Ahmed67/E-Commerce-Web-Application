import sharp from 'sharp';

export const SERVER_IMAGE_PRESETS = {
  default: { maxWidth: 1600, quality: 82 },
  banner: { maxWidth: 1920, quality: 82 },
  blog: { maxWidth: 1280, quality: 80 },
  small: { maxWidth: 512, quality: 88 },
};

export async function processImage(buffer, preset = SERVER_IMAGE_PRESETS.default) {
  const image = sharp(buffer, { animated: true });
  const meta = await image.metadata();
  const targetWidth = meta.width ? Math.min(meta.width, preset.maxWidth) : preset.maxWidth;

  return image
    .resize({ width: targetWidth, withoutEnlargement: true })
    .webp({ quality: preset.quality })
    .toBuffer();
}
