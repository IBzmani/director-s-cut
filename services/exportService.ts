
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { Frame } from '../types';

let ffmpegInstance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

// Explicit versions to ensure compatibility
const FFMPEG_VERSION = '0.12.10';
const CORE_VERSION = '0.12.6';

/**
 * Using jsDelivr as it has better header consistency for cross-origin workers.
 */
const WRAPPER_BASE_URL = `https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@${FFMPEG_VERSION}/dist/esm`;
const CORE_BASE_URL = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/esm`;

/**
 * Robustly converts an image URL or data URL to a Uint8Array.
 * Handles CORS issues by providing a fallback placeholder if the fetch fails.
 */
async function getFileUint8Array(url: string): Promise<Uint8Array> {
  if (!url) return getFallbackPlaceholder();

  if (url.startsWith('data:')) {
    try {
      const base64Data = url.split(',')[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } catch (e) {
      console.error("Failed to parse image data URL", e);
      return getFallbackPlaceholder();
    }
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
    });
    
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.warn(`Failed to fetch image: ${url}. Error: ${error instanceof Error ? error.message : String(error)}. Using fallback.`);
    return getFallbackPlaceholder();
  }
}

/**
 * Returns a 1x1 black pixel PNG placeholder as a Uint8Array.
 */
function getFallbackPlaceholder(): Uint8Array {
  return new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x00, 0x00, 0x00, 0x00, 0x3a, 0x7e, 0x9b,
    0x55, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0x60, 0x00, 0x00, 0x00,
    0x02, 0x00, 0x01, 0xe2, 0x21, 0xbc, 0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
    0x42, 0x60, 0x82
  ]);
}

/**
 * Ensures FFmpeg is loaded once. 
 * CRITICAL FIX: To prevent "Failed to construct Worker" errors in cross-origin 
 * environments, we MUST load the worker script via a Blob URL.
 */
async function loadFFmpeg(): Promise<FFmpeg> {
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const ff = new FFmpeg();
      
      // We must fetch ALL required assets as Blobs to satisfy CORS/Worker origin policies.
      // 1. coreURL: The main logic for FFmpeg core.
      // 2. wasmURL: The binary WebAssembly file.
      // 3. workerURL: The internal worker used by the wrapper.
      const [coreURL, wasmURL, workerURL] = await Promise.all([
        toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.js`, 'text/javascript'),
        toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.wasm`, 'application/wasm'),
        toBlobURL(`${WRAPPER_BASE_URL}/worker.js`, 'text/javascript'),
      ]).catch(err => {
        const msg = "Critical Error: Failed to fetch FFmpeg core assets from CDN. Check your connection.";
        console.error(msg, err);
        throw new Error(msg);
      });

      await ff.load({
        coreURL,
        wasmURL,
        workerURL, // Provided wrapper worker as a Blob URL to bypass security restrictions
      });
      
      ffmpegInstance = ff;
      return ff;
    } catch (err) {
      loadPromise = null;
      throw err;
    }
  })();

  return loadPromise;
}

/**
 * Utility to get audio duration from base64 PCM data.
 */
async function getAudioDuration(base64: string): Promise<number> {
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    
    // Fix: Access AudioContext through window with casting to avoid missing type errors
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass({ sampleRate: 24000 });
    
    try {
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
      return buffer.duration;
    } finally {
      ctx.close();
    }
  } catch (e) {
    console.warn("Could not determine audio duration, defaulting to 5.0s");
    return 5.0;
  }
}

export const exportCinemaMovie = async (
  frames: Frame[], 
  onProgress: (progress: number) => void
) => {
  const ff = await loadFFmpeg();
  
  const progressHandler = ({ progress }: { progress: number }) => {
    onProgress(Math.round(progress * 100));
  };
  ff.on('progress', progressHandler);

  try {
    const validFrames = frames.filter(f => f.image && f.audioData);
    if (validFrames.length === 0) throw new Error("No frames with both vision and audio found for export.");

    // Phase 1: Write assets
    for (let i = 0; i < validFrames.length; i++) {
      const frame = validFrames[i];
      const imgData = await getFileUint8Array(frame.image);
      await ff.writeFile(`img${i}.png`, imgData);
      
      const audioBinary = atob(frame.audioData!);
      const audioBytes = new Uint8Array(audioBinary.length);
      for (let j = 0; j < audioBinary.length; j++) audioBytes[j] = audioBinary.charCodeAt(j);
      await ff.writeFile(`aud${i}.raw`, audioBytes);
    }

    const segmentFiles: string[] = [];
    
    // Phase 2: Encode Segments
    for (let i = 0; i < validFrames.length; i++) {
      const duration = await getAudioDuration(validFrames[i].audioData!);
      const outName = `seg${i}.mp4`;
      
      // Use fixed precision for duration to avoid CLI parsing issues
      await ff.exec([
        '-loop', '1',
        '-t', duration.toFixed(3),
        '-i', `img${i}.png`,
        '-f', 's16le',
        '-ar', '24000',
        '-ac', '1',
        '-i', `aud${i}.raw`,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-pix_fmt', 'yuv420p',
        '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2',
        outName
      ]);
      segmentFiles.push(outName);
    }

    // Phase 3: Join Segments
    const concatList = segmentFiles.map(name => `file ${name}`).join('\n');
    await ff.writeFile('list.txt', concatList);

    await ff.exec([
      '-f', 'concat',
      '-safe', '0',
      '-i', 'list.txt',
      '-c', 'copy',
      'output.mp4'
    ]);

    const data = await ff.readFile('output.mp4');
    const url = URL.createObjectURL(new Blob([(data as Uint8Array).buffer], { type: 'video/mp4' }));
    
    // Phase 4: Cleanup
    try {
      for (let i = 0; i < validFrames.length; i++) {
        await ff.deleteFile(`img${i}.png`);
        await ff.deleteFile(`aud${i}.raw`);
        await ff.deleteFile(`seg${i}.mp4`);
      }
      await ff.deleteFile('list.txt');
      await ff.deleteFile('output.mp4');
    } catch (cleanupErr) {
      console.warn("FS Cleanup warning:", cleanupErr);
    }

    return url;
  } finally {
    ff.off('progress', progressHandler);
  }
};
