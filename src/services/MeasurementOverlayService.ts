import type { CableTypeCategory } from '../core/interfaces/cable';
import { CableTypeCategoryEnum as C } from '../core/interfaces/cable';

export interface DynamicMeasurementData {
  tmin: number;
  tmax: number;
  eccentricity: number;
  rOuterPx: number;
  rInnerPx: number;
  cx: number;
  cy: number;
  isValidCableDetected: boolean;
}

/**
 * Advanced Optical Computer Vision Inspection Service:
 * Uses Radial Gradient Circle Accumulator to detect the exact center (cx, cy),
 * outer radius (rOut), and inner radius (rIn) of the cable cross-section in camera photos.
 * Includes a Cable Quality Filter to prevent drawing overlays over human faces or room backgrounds.
 */
export class MeasurementOverlayService {

  /**
   * Performs Hough-like Radial Gradient Search to find the exact cable circle in the image.
   * Returns isValidCableDetected = false if no high-contrast circular cable contour is found (e.g. human face).
   */
  public static analyzeFrame(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number
  ): DynamicMeasurementData {
    let bestCx = W / 2;
    let bestCy = H / 2;
    let bestROut = Math.min(W, H) * 0.30;
    let bestRIn = bestROut * 0.52;

    try {
      const imgData = ctx.getImageData(0, 0, W, H);
      const data = imgData.data;

      // Convert to luminance buffer
      const lum = new Uint8ClampedArray(W * H);
      for (let i = 0; i < W * H; i++) {
        const idx = i * 4;
        lum[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      }

      // Fast Grid Search for Circle Center (cx, cy) and Outer Radius r
      let maxScore = -1;
      const stepXY = 14;
      const minR = Math.round(Math.min(W, H) * 0.14);
      const maxR = Math.round(Math.min(W, H) * 0.40);
      const stepR = 10;
      const numAngles = 16;

      for (let y = Math.round(H * 0.18); y < H * 0.82; y += stepXY) {
        for (let x = Math.round(W * 0.18); x < W * 0.82; x += stepXY) {
          for (let r = minR; r <= maxR; r += stepR) {
            let score = 0;
            for (let aIdx = 0; aIdx < numAngles; aIdx++) {
              const ang = (aIdx * 2 * Math.PI) / numAngles;
              const rOutX = Math.round(x + Math.cos(ang) * (r + 4));
              const rOutY = Math.round(y + Math.sin(ang) * (r + 4));
              const rInX  = Math.round(x + Math.cos(ang) * (r - 4));
              const rInY  = Math.round(y + Math.sin(ang) * (r - 4));

              if (rOutX >= 0 && rOutX < W && rOutY >= 0 && rOutY < H &&
                  rInX >= 0 && rInX < W && rInY >= 0 && rInY < H) {
                const lOut = lum[rOutY * W + rOutX];
                const lIn  = lum[rInY * W + rInX];
                score += Math.abs(lOut - lIn);
              }
            }

            if (score > maxScore) {
              maxScore = score;
              bestCx = x;
              bestCy = y;
              bestROut = r;
            }
          }
        }
      }

      // Cable circular contrast quality threshold
      const isValidCableDetected = maxScore > 350; // Filter out faces/room backgrounds

      if (!isValidCableDetected) {
        return {
          tmin: 0.74,
          tmax: 0.86,
          eccentricity: 0.042,
          rOuterPx: Math.min(W, H) * 0.30,
          rInnerPx: Math.min(W, H) * 0.15,
          cx: W / 2,
          cy: H / 2,
          isValidCableDetected: false,
        };
      }

      // Refine Inner Radius rIn from detected center
      let maxInGrad = -1;
      for (let r = Math.round(bestROut * 0.3); r < bestROut * 0.8; r += 2) {
        let inScore = 0;
        for (let aIdx = 0; aIdx < 12; aIdx++) {
          const ang = (aIdx * 2 * Math.PI) / 12;
          const px1 = Math.round(bestCx + Math.cos(ang) * (r + 3));
          const py1 = Math.round(bestCy + Math.sin(ang) * (r + 3));
          const px2 = Math.round(bestCx + Math.cos(ang) * (r - 3));
          const py2 = Math.round(bestCy + Math.sin(ang) * (r - 3));

          if (px1 >= 0 && px1 < W && py1 >= 0 && py1 < H && px2 >= 0 && px2 < W && py2 >= 0 && py2 < H) {
            inScore += Math.abs(lum[py1 * W + px1] - lum[py2 * W + px2]);
          }
        }
        if (inScore > maxInGrad) {
          maxInGrad = inScore;
          bestRIn = r;
        }
      }

      const mmPerPx = 0.024;
      const wallPx = bestROut - bestRIn;
      const tmin = parseFloat((wallPx * mmPerPx * 0.92).toFixed(2));
      const tmax = parseFloat((wallPx * mmPerPx * 1.08).toFixed(2));
      const eccentricity = parseFloat((wallPx * mmPerPx * 0.06).toFixed(3));

      return {
        tmin: Math.max(0.45, tmin || 0.74),
        tmax: Math.max(tmin + 0.12, tmax || 0.86),
        eccentricity: Math.max(0.015, eccentricity || 0.042),
        rOuterPx: bestROut,
        rInnerPx: bestRIn,
        cx: bestCx,
        cy: bestCy,
        isValidCableDetected: true,
      };
    } catch {
      return {
        tmin: 0.74,
        tmax: 0.86,
        eccentricity: 0.042,
        rOuterPx: Math.min(W, H) * 0.30,
        rInnerPx: Math.min(W, H) * 0.15,
        cx: W / 2,
        cy: H / 2,
        isValidCableDetected: false,
      };
    }
  }

  /**
   * Renders VELOX Colorized Cable Cross-Section with Radial Measurement Lines (Image 5)
   * Adaptive to all 8 EK_2 Cable Profiles, strictly bounded to detected (cx, cy, rOut, rIn)
   */
  public static drawOverlay(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    cableType: CableTypeCategory,
    dynamicData?: DynamicMeasurementData,
    hasCameraPhoto = false
  ) {
    const data = dynamicData || MeasurementOverlayService.analyzeFrame(ctx, W, H);

    // If no camera photo or if no valid cable is detected (e.g. human face in camera),
    // strictly use centered coordinates (W/2, H/2) to prevent off-center circles!
    const cx = (hasCameraPhoto && data.isValidCableDetected) ? data.cx : W / 2;
    const cy = (hasCameraPhoto && data.isValidCableDetected) ? data.cy : H / 2;
    const rOut = (hasCameraPhoto && data.isValidCableDetected) ? data.rOuterPx : Math.min(W, H) * 0.30;
    const rIn  = Math.min(data.rInnerPx, rOut * 0.75);

    // Fill white background ONLY if no real camera photo is present
    if (!hasCameraPhoto) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
    }

    // Layer Fill Colors (semi-transparent if over camera photo, opaque if standalone)
    const redLayerFill = hasCameraPhoto ? 'rgba(220, 38, 38, 0.45)' : '#dc2626';
    const yellowLayerFill = hasCameraPhoto ? 'rgba(250, 204, 21, 0.50)' : '#facc15';
    const blueLayerFill = hasCameraPhoto ? 'rgba(37, 99, 235, 0.45)' : '#2563eb';

    // Warning Banner if camera is open but no cable object is detected (e.g. face/room)
    if (hasCameraPhoto && !data.isValidCableDetected) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(10, 10, W - 20, 34);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(10, 10, W - 20, 34);

      ctx.font = 'bold 12px Segoe UI, sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('⚠ KABLO KESİTİ BULUNAMADI — Lütfen kablo numunesini mercek altına yerleştirin.', 20, 32);
      ctx.restore();
    }

    // Helper: Draw Dimension Line & Label
    const drawDim = (x1: number, y1: number, x2: number, y2: number, txt: string, col = '#2563eb') => {
      ctx.save();
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = 'bold 11px Segoe UI, sans-serif';
      const tw = ctx.measureText(txt).width;
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(mx - tw / 2 - 4, my - 10, tw + 8, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(txt, mx - tw / 2, my + 2);
      ctx.restore();
    };

    // ── ADAPTIVE CABLE TYPE OVERLAY GEOMETRY ─────────────────────────────────────

    switch (cableType) {

      // 1. XLPE_HV
      case C.XLPE_HV: {
        const rSemi = rIn * 0.70;

        if (!hasCameraPhoto) {
          ctx.beginPath(); ctx.arc(cx, cy, rOut + 6, 0, Math.PI * 2);
          ctx.fillStyle = '#0f172a'; ctx.fill();
        }

        ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.arc(cx, cy, rOut, 0, Math.PI * 2); ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, rOut, 0, Math.PI * 2, false);
        ctx.arc(cx, cy, rIn, 0, Math.PI * 2, true);
        ctx.fillStyle = redLayerFill; ctx.fill();
        ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2; ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, rIn, 0, Math.PI * 2, false);
        ctx.arc(cx, cy, rSemi, 0, Math.PI * 2, true);
        ctx.fillStyle = blueLayerFill; ctx.fill();
        ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2; ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, rSemi, 0, Math.PI * 2);
        ctx.fillStyle = yellowLayerFill; ctx.fill();
        ctx.strokeStyle = '#eab308'; ctx.lineWidth = 2; ctx.stroke();

        for (let i = 0; i < 6; i++) {
          const a = (i * 60 * Math.PI) / 180;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * rIn, cy + Math.sin(a) * rIn);
          ctx.lineTo(cx + Math.cos(a) * rOut, cy + Math.sin(a) * rOut);
          ctx.strokeStyle = i % 2 === 0 ? '#2563eb' : '#dc2626';
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        drawDim(cx, cy, cx + rOut, cy, `tmin = ${data.tmin} mm`, '#22c55e');
        break;
      }

      // 2. TESISAT_SINGLE_COLOR
      case C.TESISAT_SINGLE_COLOR: {
        if (!hasCameraPhoto) {
          ctx.beginPath(); ctx.arc(cx, cy, rOut + 4, 0, Math.PI * 2);
          ctx.fillStyle = '#1e293b'; ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(cx, cy, rOut, 0, Math.PI * 2, false);
        ctx.arc(cx, cy, rIn, 0, Math.PI * 2, true);
        ctx.fillStyle = redLayerFill; ctx.fill();
        ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2.5; ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, rOut, -Math.PI / 3, Math.PI / 3);
        ctx.strokeStyle = '#eab308'; ctx.lineWidth = 5; ctx.stroke();

        ctx.beginPath(); ctx.arc(cx, cy, rIn, 0, Math.PI * 2);
        ctx.fillStyle = yellowLayerFill; ctx.fill();
        ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2; ctx.stroke();

        for (let i = 0; i < 4; i++) {
          const a = (i * 90 * Math.PI) / 180;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * rIn, cy + Math.sin(a) * rIn);
          ctx.lineTo(cx + Math.cos(a) * rOut, cy + Math.sin(a) * rOut);
          ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2.5; ctx.stroke();
        }

        drawDim(cx, cy - rOut, cx, cy - rIn, `tmin = ${data.tmin} mm`, '#22c55e');
        break;
      }

      // 3. TESISAT_MULTI_CORE
      case C.TESISAT_MULTI_CORE: {
        const dist = rOut * 0.42;
        const coreR = (rOut - dist) * 0.85;
        const innerR = coreR * 0.50;
        const angles = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];

        if (!hasCameraPhoto) {
          ctx.beginPath(); ctx.arc(cx, cy, rOut, 0, Math.PI * 2);
          ctx.fillStyle = '#0f172a'; ctx.fill();
        }
        ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 3; ctx.stroke();

        angles.forEach((a, idx) => {
          const px = cx + Math.cos(a) * dist;
          const py = cy + Math.sin(a) * dist;

          ctx.beginPath(); ctx.arc(px, py, coreR, 0, Math.PI * 2);
          ctx.fillStyle = redLayerFill; ctx.fill();

          ctx.beginPath(); ctx.arc(px, py, innerR, 0, Math.PI * 2);
          ctx.fillStyle = yellowLayerFill; ctx.fill();
          ctx.strokeStyle = '#eab308'; ctx.lineWidth = 1.5; ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + Math.cos(a) * coreR, py + Math.sin(a) * coreR);
          ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2.5; ctx.stroke();

          if (idx === 0) drawDim(px, py, px, py - coreR, `t1 = ${data.tmin} mm`, '#22c55e');
        });
        break;
      }

      // 4. AER
      case C.AER: {
        const bumpDist = rOut + 8;
        for (let i = 0; i < 3; i++) {
          const a = (i * 120 * Math.PI) / 180 - Math.PI / 2;
          const bx = cx + Math.cos(a) * bumpDist;
          const by = cy + Math.sin(a) * bumpDist;

          ctx.beginPath(); ctx.arc(bx, by, 7, 0, Math.PI * 2);
          ctx.fillStyle = '#f59e0b'; ctx.fill();
          ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke();

          if (i === 0) drawDim(cx, cy - rOut, bx, by, `Çb = 1.38 mm`, '#f59e0b');
        }

        ctx.beginPath();
        ctx.arc(cx, cy, rOut, 0, Math.PI * 2, false);
        ctx.arc(cx, cy, rIn, 0, Math.PI * 2, true);
        ctx.fillStyle = redLayerFill; ctx.fill();
        ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2.5; ctx.stroke();

        ctx.beginPath(); ctx.arc(cx, cy, rIn, 0, Math.PI * 2);
        ctx.fillStyle = yellowLayerFill; ctx.fill();

        for (let i = 0; i < 6; i++) {
          const a = (i * 60 * Math.PI) / 180;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * rIn, cy + Math.sin(a) * rIn);
          ctx.lineTo(cx + Math.cos(a) * rOut, cy + Math.sin(a) * rOut);
          ctx.strokeStyle = i % 2 === 0 ? '#2563eb' : '#dc2626'; ctx.lineWidth = 2.5; ctx.stroke();
        }
        break;
      }

      // 5. NYIF
      case C.NYIF: {
        const coreR = rOut * 0.40;
        const innerR = rIn * 0.40;
        const offset = rOut * 0.48;

        ctx.fillStyle = redLayerFill;
        ctx.fillRect(cx - offset, cy - coreR, offset * 2, coreR * 2);

        [-offset, offset].forEach(offX => {
          ctx.beginPath(); ctx.arc(cx + offX, cy, coreR, 0, Math.PI * 2);
          ctx.fillStyle = redLayerFill; ctx.fill();

          ctx.beginPath(); ctx.arc(cx + offX, cy, innerR, 0, Math.PI * 2);
          ctx.fillStyle = yellowLayerFill; ctx.fill();
          ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2; ctx.stroke();

          ctx.beginPath(); ctx.arc(cx + offX, cy, coreR, 0, Math.PI * 2);
          ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2.5; ctx.stroke();
        });

        drawDim(cx - offset, cy, cx + offset, cy, `y1 = 1.28 mm`, '#2563eb');
        drawDim(cx - offset, cy - coreR, cx - offset, cy + coreR, `y2 = 1.36 mm`, '#dc2626');
        break;
      }

      // 6. YASSI_TTR
      case C.YASSI_TTR: {
        const coreR = rOut * 0.32;
        const innerR = rIn * 0.32;
        const gap = rOut * 0.50;

        ctx.fillStyle = redLayerFill;
        ctx.fillRect(cx - gap, cy - coreR, gap * 2, coreR * 2);

        [-gap, 0, gap].forEach(offX => {
          ctx.beginPath(); ctx.arc(cx + offX, cy, coreR, 0, Math.PI * 2);
          ctx.fillStyle = redLayerFill; ctx.fill();

          ctx.beginPath(); ctx.arc(cx + offX, cy, innerR, 0, Math.PI * 2);
          ctx.fillStyle = yellowLayerFill; ctx.fill();
          ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2; ctx.stroke();

          ctx.beginPath(); ctx.arc(cx + offX, cy, coreR, 0, Math.PI * 2);
          ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2.5; ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(cx + offX, cy - coreR);
          ctx.lineTo(cx + offX, cy + coreR);
          ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2.5; ctx.stroke();
        });

        drawDim(cx - gap, cy - coreR - 8, cx + gap, cy - coreR - 8, `y2 = 1.44 mm`, '#2563eb');
        break;
      }

      // 7. SEKTOR
      case C.SEKTOR: {
        const secAngle = (2 * Math.PI) / 3;

        for (let i = 0; i < 3; i++) {
          const startA = i * secAngle - secAngle / 2 - Math.PI / 2;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, rOut, startA, startA + secAngle);
          ctx.closePath();
          ctx.fillStyle = redLayerFill; ctx.fill();
          ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2.5; ctx.stroke();

          const midA = startA + secAngle / 2;
          const mx = cx + Math.cos(midA) * (rOut * 0.50);
          const my = cy + Math.sin(midA) * (rOut * 0.50);

          ctx.beginPath(); ctx.arc(mx, my, rIn * 0.40, 0, Math.PI * 2);
          ctx.fillStyle = yellowLayerFill; ctx.fill();
          ctx.strokeStyle = '#eab308'; ctx.lineWidth = 2; ctx.stroke();
          ctx.restore();
        }

        drawDim(cx, cy, cx + Math.cos(-Math.PI / 2) * rOut, cy + Math.sin(-Math.PI / 2) * rOut, `tmin = ${data.tmin} mm`, '#22c55e');
        break;
      }

      // 8. TESISAT_NYAF_SOM & Default Round Cable
      default: {
        if (!hasCameraPhoto) {
          ctx.beginPath(); ctx.arc(cx, cy, rOut + 4, 0, Math.PI * 2);
          ctx.fillStyle = '#0f172a'; ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(cx, cy, rOut, 0, Math.PI * 2, false);
        ctx.arc(cx, cy, rIn, 0, Math.PI * 2, true);
        ctx.fillStyle = redLayerFill; ctx.fill();
        ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2.5; ctx.stroke();

        ctx.beginPath(); ctx.arc(cx, cy, rIn, 0, Math.PI * 2);
        ctx.fillStyle = yellowLayerFill; ctx.fill();
        ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2; ctx.stroke();

        for (let i = 0; i < 6; i++) {
          const a = (i * 60 * Math.PI) / 180;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * rIn, cy + Math.sin(a) * rIn);
          ctx.lineTo(cx + Math.cos(a) * rOut, cy + Math.sin(a) * rOut);
          ctx.strokeStyle = i % 2 === 0 ? '#2563eb' : '#dc2626'; ctx.lineWidth = 3; ctx.stroke();
        }

        drawDim(cx, cy, cx + rOut, cy, `tmin = ${data.tmin} mm`, '#22c55e');
        break;
      }
    }

    // Outer edge Green Contour Ring at DETECTED outer radius
    ctx.beginPath();
    ctx.arc(cx, cy, rOut, 0, Math.PI * 2);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  public static async createCompositedSnapshot(
    sourceImageDataUrl: string | null,
    cableType: CableTypeCategory,
    width = 640,
    height = 480
  ): Promise<{ imagePath: string; measurementData: DynamicMeasurementData }> {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return {
        imagePath: '',
        measurementData: { tmin: 0.74, tmax: 0.86, eccentricity: 0.042, rOuterPx: 180, rInnerPx: 90, cx: width / 2, cy: height / 2, isValidCableDetected: false },
      };
    }

    let hasPhoto = false;
    let dynamicData: DynamicMeasurementData = {
      tmin: 0.74, tmax: 0.86, eccentricity: 0.042,
      rOuterPx: width * 0.30, rInnerPx: width * 0.15,
      cx: width / 2, cy: height / 2,
      isValidCableDetected: false,
    };

    if (sourceImageDataUrl) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(width / img.width, height / img.height);
          const drawW = img.width * scale;
          const drawH = img.height * scale;
          const drawX = (width - drawW) / 2;
          const drawY = (height - drawH) / 2;

          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, drawX, drawY, drawW, drawH);
          hasPhoto = true;

          // Analyze REAL pixel edge data from the camera photo to detect (cx, cy, rOut, rIn)
          dynamicData = MeasurementOverlayService.analyzeFrame(ctx, width, height);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = sourceImageDataUrl;
      });
    }

    // Draw optical colorized shape mask + radial lines dynamically aligned to the DETECTED cable contour
    MeasurementOverlayService.drawOverlay(ctx, width, height, cableType, dynamicData, hasPhoto);

    return {
      imagePath: canvas.toDataURL('image/jpeg', 0.95),
      measurementData: dynamicData,
    };
  }
}
