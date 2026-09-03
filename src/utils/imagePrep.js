// Downscale + re-encode a captured/picked photo before it is base64-encoded and sent for
// analysis. Post-M2 Item 2 (latency): a full-resolution phone photo is several MB; base64
// adds ~33%; the whole payload is re-uploaded on every retry. Capping the long edge and
// re-compressing cuts upload time with no accuracy cost for this task (the model tiles the
// image well below this resolution).
//
// Never blocks analysis: if manipulation fails for any reason, the caller falls back to the
// original image.

import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

// ~1568 px is the point above which Gemini's vision tiling gains nothing; below it we lose
// fine detail the Q1/Q2/Q3 reads depend on.
const MAX_LONG_EDGE = 1568;
const JPEG_QUALITY = 0.8;

// srcWidth/srcHeight come from takePictureAsync() / ImagePicker asset — used to avoid
// upscaling an already-small image (resize with a single dimension would enlarge it).
export async function prepareImageForAnalysis(uri, srcWidth, srcHeight) {
  try {
    const longEdge = Math.max(srcWidth || 0, srcHeight || 0);
    const actions = [];
    if (longEdge > MAX_LONG_EDGE && srcWidth && srcHeight) {
      const scale = MAX_LONG_EDGE / longEdge;
      actions.push({
        resize: {
          width: Math.round(srcWidth * scale),
          height: Math.round(srcHeight * scale),
        },
      });
    }
    const result = await manipulateAsync(uri, actions, {
      compress: JPEG_QUALITY,
      format: SaveFormat.JPEG,
      base64: true,
    });
    return { uri: result.uri, base64: result.base64, width: result.width, height: result.height };
  } catch (e) {
    console.warn('[imagePrep] downscale failed, using original:', e?.message);
    return null;
  }
}
