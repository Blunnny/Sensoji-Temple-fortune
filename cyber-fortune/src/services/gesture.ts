declare const Hands: {
  new (config: { locateFile: (file: string) => string }): GestureHands;
};
declare const Camera: {
  new (
    video: HTMLVideoElement,
    options: { onFrame: () => Promise<void>; width: number; height: number },
  ): GestureCamera;
};

interface GestureHands {
  setOptions(options: Record<string, unknown>): void;
  onResults(callback: (results: GestureResults) => void): void;
  send(input: { image: HTMLVideoElement }): Promise<void>;
}

interface GestureCamera {
  start(): void;
  stop(): void;
}

interface GestureResults {
  multiHandLandmarks?: Array<Array<{ x: number; y: number }>>;
}

export type GestureDrawerCallbacks = {
  onHover: (index: number) => void;
  onClearHover: () => void;
  onSelectStart: (index: number) => void;
  onSelectEnd: () => void;
  onConfirm: () => void;
  onRefresh: () => void;
  onShake?: (power: number) => void;
  onPray?: () => void;
  showSkeleton?: boolean;
};

const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];

let gestureCamera: GestureCamera | null = null;
let gestureVideo: HTMLVideoElement | null = null;

export function stopGestureCamera(): void {
  if (gestureCamera && typeof gestureCamera.stop === "function") {
    gestureCamera.stop();
  }
  gestureCamera = null;

  if (gestureVideo) {
    gestureVideo.pause();
    gestureVideo.srcObject = null;
    gestureVideo.remove();
    gestureVideo = null;
  }
}

export async function startGestureOnDrawer(
  previewEl: HTMLElement,
  drawerCount: number,
  callbacks: GestureDrawerCallbacks,
  isRefreshingRef: { current: boolean },
): Promise<void> {
  if (typeof window === "undefined") return;
  if (typeof Hands === "undefined" || typeof Camera === "undefined") return;

  stopGestureCamera();

  const video = document.createElement("video");
  video.autoplay = true;
  video.playsInline = true;
  video.muted = true;
  video.className = "camera-video";
  gestureVideo = video;

  previewEl.innerHTML = "";
  previewEl.classList.add("camera-preview-wrap");
  previewEl.appendChild(video);

  let overlayCanvas: HTMLCanvasElement | null = null;
  let overlayCtx: CanvasRenderingContext2D | null = null;

  if (callbacks.showSkeleton) {
    overlayCanvas = document.createElement("canvas");
    overlayCanvas.className = "gesture-overlay";
    overlayCtx = overlayCanvas.getContext("2d");
    previewEl.appendChild(overlayCanvas);
    const syncOverlay = (): void => {
      if (!overlayCanvas) return;
      overlayCanvas.width = video.videoWidth || 200;
      overlayCanvas.height = video.videoHeight || 150;
    };
    video.addEventListener("loadeddata", syncOverlay);
    syncOverlay();
  }

  let hoverIndex = -1;
  let lastWristY = 0;
  let shakeAccum = 0;
  let lastPrayTime = 0;
  let selectedIndex: number | null = null;
  let wasPinching = false;
  let pinchStartTime = 0;
  let wasMiddlePinching = false;
  let lastGestureTime = 0;
  let lastRefreshTime = 0;

  let smoothX = 0;
  let smoothY = 0;
  const smoothingFactor = 0.2;

  const hands = new Hands({
    locateFile: (file: string) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  });

  hands.setOptions({
    maxNumHands: callbacks.onPray ? 2 : 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6,
  });

  function drawSkeleton(landmarks: Array<{ x: number; y: number }>): void {
    if (!overlayCtx || !overlayCanvas) return;
    const w = overlayCanvas.width;
    const h = overlayCanvas.height;
    overlayCtx.clearRect(0, 0, w, h);
    overlayCtx.strokeStyle = "rgba(212, 160, 23, 0.8)";
    overlayCtx.lineWidth = 2;
    for (const [a, b] of HAND_CONNECTIONS) {
      overlayCtx.beginPath();
      overlayCtx.moveTo(landmarks[a].x * w, landmarks[a].y * h);
      overlayCtx.lineTo(landmarks[b].x * w, landmarks[b].y * h);
      overlayCtx.stroke();
    }
    overlayCtx.fillStyle = "rgba(183, 46, 46, 0.9)";
    for (const p of landmarks) {
      overlayCtx.beginPath();
      overlayCtx.arc(p.x * w, p.y * h, 3, 0, Math.PI * 2);
      overlayCtx.fill();
    }
  }

  hands.onResults((results: GestureResults) => {
    if (isRefreshingRef.current) return;

    const multi = results?.multiHandLandmarks ?? [];

    if (multi.length >= 2 && callbacks.onPray) {
      const w0 = multi[0][0];
      const w1 = multi[1][0];
      const dist = Math.hypot(w0.x - w1.x, w0.y - w1.y);
      if (dist < 0.15) {
        const now = Date.now();
        if (now - lastPrayTime > 3000) {
          lastPrayTime = now;
          callbacks.onPray();
        }
      }
    }

    if (!multi.length) {
      hoverIndex = -1;
      callbacks.onClearHover();
      wasPinching = false;
      if (overlayCtx && overlayCanvas) {
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      }
      return;
    }

    const landmarks = multi[0];

    if (callbacks.showSkeleton) drawSkeleton(landmarks);

    if (callbacks.onShake) {
      const wrist = landmarks[0];
      const dy = Math.abs(wrist.y - lastWristY);
      if (lastWristY > 0 && dy > 0.02) {
        shakeAccum += dy * 80;
        if (shakeAccum > 8) {
          callbacks.onShake(shakeAccum);
          shakeAccum = 0;
        }
      }
      lastWristY = wrist.y;
    }
    const wrist = landmarks[0];
    const indexTip = landmarks[8];
    const thumbTip = landmarks[4];
    const middleTip = landmarks[12];
    const middleMcp = landmarks[9];

    const palmSize =
      Math.hypot(middleMcp.x - wrist.x, middleMcp.y - wrist.y) || 0.0001;

    const xNormTarget = 1 - Math.min(0.999, Math.max(0, indexTip.x));
    const yNormTarget = Math.min(0.999, Math.max(0, indexTip.y));

    if (smoothX === 0 && smoothY === 0) {
      smoothX = xNormTarget;
      smoothY = yNormTarget;
    } else {
      smoothX = smoothX * (1 - smoothingFactor) + xNormTarget * smoothingFactor;
      smoothY = smoothY * (1 - smoothingFactor) + yNormTarget * smoothingFactor;
    }

    const cols = 3;
    const rows = Math.max(1, Math.ceil(drawerCount / cols));
    const col = Math.min(cols - 1, Math.floor(smoothX * cols));
    const row = Math.min(rows - 1, Math.floor(smoothY * rows));
    const nextHoverIndex = Math.min(drawerCount - 1, row * cols + col);

    if (nextHoverIndex !== hoverIndex) {
      hoverIndex = nextHoverIndex;
      callbacks.onHover(hoverIndex);
    }

    const pinchRatio =
      Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y) / palmSize;
    const isPinching = pinchRatio < 0.4;

    const middlePinchRatio =
      Math.hypot(thumbTip.x - middleTip.x, thumbTip.y - middleTip.y) / palmSize;
    const isMiddlePinching = middlePinchRatio < 0.4;

    if (isPinching && !wasPinching && hoverIndex >= 0) {
      selectedIndex = hoverIndex;
      pinchStartTime = Date.now();
      callbacks.onSelectStart(selectedIndex);
    } else if (!isPinching && wasPinching) {
      selectedIndex = null;
      pinchStartTime = 0;
      callbacks.onSelectEnd();
    }

    if (isMiddlePinching && !wasMiddlePinching) {
      const now = Date.now();
      if (now - lastRefreshTime > 1000) {
        lastRefreshTime = now;
        isRefreshingRef.current = true;
        hoverIndex = -1;
        selectedIndex = null;
        callbacks.onClearHover();
        callbacks.onRefresh();
        window.setTimeout(() => {
          isRefreshingRef.current = false;
        }, 1500);
      }
    }

    wasPinching = isPinching;
    wasMiddlePinching = isMiddlePinching;

    if (isPinching && selectedIndex !== null && pinchStartTime > 0) {
      const now = Date.now();
      if (now - pinchStartTime > 2000 && now - lastGestureTime > 1500) {
        lastGestureTime = now;
        stopGestureCamera();
        callbacks.onConfirm();
      }
    }
  });

  gestureCamera = new Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width: 640,
    height: 480,
  });

  try {
    gestureCamera.start();
  } catch {
    stopGestureCamera();
  }
}
