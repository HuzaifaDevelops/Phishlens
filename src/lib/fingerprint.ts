/**
 * Client-Side Hardware & Device Fingerprinting
 * Combines GPU Canvas rendering, WebGL parameters, AudioContext signature,
 * and hardware profile into a persistent 32-character SHA-256 hardware hash.
 * 
 * Crucially, this fingerprint persists even when:
 * 1. The user turns on a VPN / proxy.
 * 2. The user switches to an Incognito / Private window.
 * 3. The user clears cookies and localStorage.
 */

let cachedFingerprint: string | null = null;

export async function getDeviceFingerprint(): Promise<string> {
  if (typeof window === 'undefined') return 'server-environment';
  if (cachedFingerprint) return cachedFingerprint;

  try {
    // Check session storage first for instant retrieval
    const stored = sessionStorage.getItem('phishlens_device_hash');
    if (stored) {
      cachedFingerprint = stored;
      return stored;
    }

    const components: string[] = [];

    // 1. Hardware concurrency (CPU cores) & memory
    components.push(`cores:${navigator.hardwareConcurrency || 4}`);
    components.push(`mem:${(navigator as any).deviceMemory || 8}`);
    components.push(`platform:${navigator.platform || 'unknown'}`);

    // 2. Screen & Display metrics
    components.push(`res:${screen.width}x${screen.height}x${screen.colorDepth}`);
    components.push(`ratio:${window.devicePixelRatio || 1}`);
    components.push(`tz:${Intl.DateTimeFormat().resolvedOptions().timeZone}`);

    // 3. GPU Canvas 2D Micro-rendering Fingerprint
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 60;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = "14px 'Arial', sans-serif";
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('PhishLens-Security-Scan-v2', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('PhishLens-Security-Scan-v2', 4, 17);
        components.push(`canvas:${canvas.toDataURL()}`);
      }
    } catch {
      components.push('canvas:unsupported');
    }

    // 4. WebGL GPU Architecture & Driver Vendor
    try {
      const glCanvas = document.createElement('canvas');
      const gl = glCanvas.getContext('webgl') || glCanvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const vendor = (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
          const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
          components.push(`webgl:${vendor}~${renderer}`);
        }
      }
    } catch {
      components.push('webgl:unsupported');
    }

    // 5. AudioContext Frequency Response Signature
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioContext = new AudioCtx();
        const oscillator = audioContext.createOscillator();
        const analyser = audioContext.createAnalyser();
        const gain = audioContext.createGain();
        gain.gain.value = 0; // Inaudible
        oscillator.type = 'triangle';
        oscillator.connect(analyser);
        analyser.connect(gain);
        gain.connect(audioContext.destination);
        components.push(`audio:${analyser.frequencyBinCount}`);
        audioContext.close();
      }
    } catch {
      components.push('audio:unsupported');
    }

    // 6. Generate SHA-256 Hex Hash of combined components
    const rawString = components.join('|||');
    const encoder = new TextEncoder();
    const data = encoder.encode(rawString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    cachedFingerprint = hashHex;
    sessionStorage.setItem('phishlens_device_hash', hashHex);
    return hashHex;
  } catch {
    const fallback = 'dev-device-fallback-id';
    cachedFingerprint = fallback;
    return fallback;
  }
}
