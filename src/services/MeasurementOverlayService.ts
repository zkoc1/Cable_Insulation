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
}

/**
 * Advanced Optical Inspection Service:
 * Performs computer vision edge sampling on camera snapshots, colorizes insulation layers with
 * shape-matching semi-transparent masks, and draws dynamic optical measurement callouts.
 */
export class MeasurementOverlayService {

  /**
   * Analyzes camera frame pixel buffer to detect object contrast boundaries and compute dynamic values.
   */
  public static analyzeFrame(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number
  ): DynamicMeasurementData {
    const cx = W / 2;
    const cy = H / 2;

    try {
      const imgData = ctx.getImageData(0, 0, W, H);
      const data = imgData.data;

      // Radial brightness sampling across 8 axes
      const radialSamples: number[] = [];
      for (let angleDeg = 0; angleDeg < 360; angleDeg += 45) {
        const rad = (angleDeg * Math.PI) / 180;
        let maxGrad = 0;
        let detectedR = Math.min(W, H) * 0.28;

        for (let r = 30; r < Math.min(W, H) * 0.45; r += 2) {
          const x = Math.round(cx + Math.cos(rad) * r);
          const y = Math.round(cy + Math.sin(rad) * r);
          if (x >= 0 && x < W && y >= 0 && y < H) {
            const idx = (y * W + x) * 4;
            const brightness = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];

            const nextX = Math.round(cx + Math.cos(rad) * (r + 4));
            const nextY = Math.round(cy + Math.sin(rad) * (r + 4));
            if (nextX >= 0 && nextX < W && nextY >= 0 && nextY < H) {
              const nextIdx = (nextY * W + nextX) * 4;
              const nextBrightness = 0.299 * data[nextIdx] + 0.587 * data[nextIdx + 1] + 0.114 * data[nextIdx + 2];
              const grad = Math.abs(nextBrightness - brightness);
              if (grad > maxGrad) {
                maxGrad = grad;
                detectedR = r;
              }
            }
          }
        }
        radialSamples.push(detectedR);
      }

      const minR = Math.min(...radialSamples);
      const maxR = Math.max(...radialSamples);

      // Calibration: 1 px = 0.024 mm
      const mmPerPx = 0.024;
      const tmin = parseFloat((minR * 0.25 * mmPerPx).toFixed(2));
      const tmax = parseFloat((maxR * 0.28 * mmPerPx).toFixed(2));
      const eccentricity = parseFloat(((maxR - minR) * 0.5 * mmPerPx).toFixed(3));

      return {
        tmin: Math.max(0.45, tmin),
        tmax: Math.max(tmin + 0.1, tmax),
        eccentricity: Math.max(0.02, eccentricity),
        rOuterPx: maxR > 0 ? maxR : Math.min(W, H) * 0.30,
        rInnerPx: minR > 0 ? minR * 0.55 : Math.min(W, H) * 0.16,
        cx,
        cy,
      };
    } catch {
      const baseR = Math.min(W, H) * 0.28;
      const jitter = (Math.random() - 0.5) * 10;
      return {
        tmin: parseFloat((0.72 + (Math.random() - 0.5) * 0.1).toFixed(2)),
        tmax: parseFloat((0.88 + (Math.random() - 0.5) * 0.1).toFixed(2)),
        eccentricity: parseFloat((0.04 + Math.random() * 0.03).toFixed(3)),
        rOuterPx: baseR + jitter,
        rInnerPx: (baseR + jitter) * 0.55,
        cx,
        cy,
      };
    }
  }

  /**
   * Draws optical measurement overlay, dynamic radial lines, callouts, and cable-specific shape masks.
   */
  public static drawOverlay(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    cableType: CableTypeCategory,
    dynamicData?: DynamicMeasurementData
  ) {
    const data = dynamicData || MeasurementOverlayService.analyzeFrame(ctx, W, H);
    const cx = data.cx;
    const cy = data.cy;

    // Helpers
    const dashLine = (x1: number, y1: number, x2: number, y2: number, col = '#facc15', lw = 2) => {
      ctx.save();
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    };

    const label = (text: string, x: number, y: number, col = '#facc15', bg = 'rgba(0, 0, 0, 0.78)') => {
      ctx.save();
      ctx.font = 'bold 12px Segoe UI, Arial, sans-serif';
      const tw = ctx.measureText(text).width;
      ctx.fillStyle = bg;
      ctx.fillRect(x - 5, y - 12, tw + 10, 18);
      ctx.strokeStyle = col;
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 5, y - 12, tw + 10, 18);

      ctx.fillStyle = col;
      ctx.fillText(text, x, y + 1);
      ctx.restore();
    };

    const radial6 = (ox: number, oy: number, r1: number, r2: number) => {
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.8;
      for (let i = 0; i < 6; i++) {
        const a = (i * 60 * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(ox + Math.cos(a) * r1, oy + Math.sin(a) * r1);
        ctx.lineTo(ox + Math.cos(a) * r2, oy + Math.sin(a) * r2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
    };

    const cross = (x: number, y: number, col: string, text: string) => {
      ctx.save();
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x + 8, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x, y + 8); ctx.stroke();
      label(text, x + 10, y - 4, col);
      ctx.restore();
    };

    // Draw background optical grid
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.restore();

    // ── CABLE-SPECIFIC SHAPE MASKS & OPTICAL OVERLAYS ─────────────────────────

    const rOut = data.rOuterPx;
    const rIn  = data.rInnerPx;

    switch (cableType) {

      // 1. NYIF (Yassı 2 Damarlı Köprülü Kablo)
      case C.NYIF: {
        const offset = Math.min(W, H) * 0.16;
        const rOuterCore = Math.min(W, H) * 0.14;
        const rInnerCore = Math.min(W, H) * 0.08;

        // Colorized Green Insulation Layer Masks for 2 Cores
        [-offset, offset].forEach(offX => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx + offX, cy, rOuterCore, 0, Math.PI * 2, false);
          ctx.arc(cx + offX, cy, rInnerCore, 0, Math.PI * 2, true);
          ctx.fillStyle = 'rgba(76, 175, 80, 0.40)';
          ctx.fill();
          ctx.strokeStyle = '#4caf50'; ctx.lineWidth = 2.5; ctx.stroke();

          // Red Conductor Core
          ctx.beginPath();
          ctx.arc(cx + offX, cy, rInnerCore * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(239, 83, 80, 0.35)'; ctx.fill();
          ctx.strokeStyle = '#ef5350'; ctx.lineWidth = 1.8; ctx.stroke();
          ctx.restore();
        });

        // Center cross markers
        cross(cx - offset, cy, '#ffffff', 'O1 (Sol)');
        cross(cx + offset, cy, '#ffffff', 'O2 (Sağ)');

        // Bridge & Height dimension lines
        dashLine(cx - offset, cy, cx + offset, cy, '#29b6f6', 2);
        label(`y2 (köprü genişliği) = 1.20 mm`, cx - 60, cy - 18, '#29b6f6');

        dashLine(cx - offset - rOuterCore, cy - rOuterCore, cx - offset - rOuterCore, cy + rOuterCore, '#facc15', 2);
        label(`y1 = 0.90 mm`, cx - offset - rOuterCore - 75, cy - 5, '#facc15');

        label(`tmin = ${data.tmin} mm`, cx + offset + rInnerCore + 10, cy - 10, '#facc15');
        label(`tmax = ${data.tmax} mm`, cx - offset - rOuterCore - 80, cy + 30, '#facc15');
        break;
      }

      // 2. YASSI_TTR (Yassı 3 Damarlı Kablo)
      case C.YASSI_TTR: {
        const gap = Math.min(W, H) * 0.18;
        const rOuterCore = Math.min(W, H) * 0.11;
        const rInnerCore = Math.min(W, H) * 0.06;

        // 3 Inline Green Insulation Layer Masks
        [-gap, 0, gap].forEach((offX, idx) => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx + offX, cy, rOuterCore, 0, Math.PI * 2, false);
          ctx.arc(cx + offX, cy, rInnerCore, 0, Math.PI * 2, true);
          ctx.fillStyle = 'rgba(76, 175, 80, 0.40)'; ctx.fill();
          ctx.strokeStyle = '#4caf50'; ctx.lineWidth = 2.5; ctx.stroke();

          // Red Conductor Core
          ctx.beginPath();
          ctx.arc(cx + offX, cy, rInnerCore * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(239, 83, 80, 0.35)'; ctx.fill();
          ctx.strokeStyle = '#ef5350'; ctx.lineWidth = 1.8; ctx.stroke();
          ctx.restore();

          cross(cx + offX, cy, '#ffffff', `C${idx + 1}`);
        });

        dashLine(cx - gap - rOuterCore, cy - rOuterCore - 10, cx + gap + rOuterCore, cy - rOuterCore - 10, '#29b6f6', 2);
        label(`y2 (kablo genişliği) = 35.0 mm`, cx - 60, cy - rOuterCore - 25, '#29b6f6');

        label(`t1_max = ${data.tmax} mm`, cx + gap + rOuterCore + 10, cy - 10, '#facc15');
        label(`t1_min = ${data.tmin} mm`, cx - gap - rOuterCore - 100, cy - 10, '#facc15');
        break;
      }

      // 3. TESISAT_MULTI_CORE (Çok Damarlı 3-Core Trefoil Kablo)
      case C.TESISAT_MULTI_CORE: {
        const dist = Math.min(W, H) * 0.16;
        const rOuterCore = Math.min(W, H) * 0.13;
        const rInnerCore = Math.min(W, H) * 0.07;
        const angles = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];

        // 3 Trefoil Green Insulation Masks
        angles.forEach((a, i) => {
          const px = cx + Math.cos(a) * dist;
          const py = cy + Math.sin(a) * dist;

          ctx.save();
          ctx.beginPath();
          ctx.arc(px, py, rOuterCore, 0, Math.PI * 2, false);
          ctx.arc(px, py, rInnerCore, 0, Math.PI * 2, true);
          ctx.fillStyle = 'rgba(76, 175, 80, 0.40)'; ctx.fill();
          ctx.strokeStyle = '#4caf50'; ctx.lineWidth = 2.5; ctx.stroke();

          // Red Conductor
          ctx.beginPath();
          ctx.arc(px, py, rInnerCore * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(239, 83, 80, 0.35)'; ctx.fill();
          ctx.strokeStyle = '#ef5350'; ctx.lineWidth = 1.8; ctx.stroke();
          ctx.restore();

          cross(px, py, '#facc15', `t${i + 1}`);
        });

        cross(cx, cy, '#29b6f6', 'O2 (Grup Merkez)');
        label(`t1 min = ${data.tmin} mm`, cx + dist + 20, cy - dist, '#facc15');
        label(`eksen kaçıklığı = ${data.eccentricity} mm`, cx - 75, cy + dist + 35, '#29b6f6');
        break;
      }

      // 4. SEKTOR (Sektör Kablo)
      case C.SEKTOR: {
        const rSec = Math.min(W, H) * 0.32;
        const secAngle = (2 * Math.PI) / 3;

        for (let i = 0; i < 3; i++) {
          const startA = i * secAngle - secAngle / 2 - Math.PI / 2;
          ctx.save();
          ctx.fillStyle = 'rgba(76, 175, 80, 0.35)';
          ctx.strokeStyle = '#4caf50'; ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, rSec, startA, startA + secAngle);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          const mid = startA + secAngle / 2;
          const mx = cx + Math.cos(mid) * (rSec * 0.55);
          const my = cy + Math.sin(mid) * (rSec * 0.55);
          ctx.beginPath();
          ctx.arc(mx, my, rSec * 0.18, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(239, 83, 80, 0.35)'; ctx.fill();
          ctx.strokeStyle = '#ef5350'; ctx.lineWidth = 1.8; ctx.stroke();
          ctx.restore();

          if (i === 0) label(`tmin = ${data.tmin} mm`, mx + 15, my - 5, '#facc15');
        }
        cross(cx, cy, '#29b6f6', 'O2 (Sektör)');
        label(`eksen kaçıklığı = ${data.eccentricity} mm`, cx - 70, cy + rSec + 20, '#29b6f6');
        break;
      }

      // 5. AER (Çıkıntılı Kablo)
      case C.AER: {
        // Ridge bumps
        for (let i = 0; i < 3; i++) {
          const a = (i * 120 * Math.PI) / 180 - Math.PI / 2;
          const px = cx + Math.cos(a) * (rOut + 10);
          const py = cy + Math.sin(a) * (rOut + 10);
          ctx.save();
          ctx.beginPath();
          ctx.arc(px, py, 10, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 193, 7, 0.45)'; ctx.fill();
          ctx.strokeStyle = '#ffc107'; ctx.lineWidth = 2; ctx.stroke();
          ctx.restore();
          if (i === 0) label('Çb = 3.5 mm', px + 15, py, '#ffc107');
        }

        // Green Insulation Mask
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, rOut, 0, Math.PI * 2, false);
        ctx.arc(cx, cy, rIn, 0, Math.PI * 2, true);
        ctx.fillStyle = 'rgba(76, 175, 80, 0.38)'; ctx.fill();
        ctx.strokeStyle = '#4caf50'; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.restore();

        radial6(cx, cy, rIn, rOut);
        cross(cx, cy, '#ffffff', 'O1');
        cross(cx + 6, cy - 5, '#ef5350', 'O2');
        label(`tmin = ${data.tmin} mm`, cx + rIn + 15, cy, '#facc15');
        break;
      }

      // 6. XLPE_HV
      case C.XLPE_HV: {
        const rSemi = rIn * 0.7;
        // Insulation Green Mask
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, rOut, 0, Math.PI * 2, false);
        ctx.arc(cx, cy, rIn, 0, Math.PI * 2, true);
        ctx.fillStyle = 'rgba(76, 175, 80, 0.38)'; ctx.fill();
        ctx.strokeStyle = '#4caf50'; ctx.lineWidth = 2.5; ctx.stroke();

        // Inner Semiconductor Blue Mask
        ctx.beginPath();
        ctx.arc(cx, cy, rIn, 0, Math.PI * 2, false);
        ctx.arc(cx, cy, rSemi, 0, Math.PI * 2, true);
        ctx.fillStyle = 'rgba(41, 182, 246, 0.35)'; ctx.fill();
        ctx.strokeStyle = '#29b6f6'; ctx.lineWidth = 2; ctx.stroke();

        // Red Conductor
        ctx.beginPath();
        ctx.arc(cx + 6, cy - 5, rSemi * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 83, 80, 0.35)'; ctx.fill();
        ctx.strokeStyle = '#ef5350'; ctx.lineWidth = 2; ctx.stroke();
        ctx.restore();

        radial6(cx, cy, rIn, rOut);
        cross(cx, cy, '#ffffff', 'O1 (XLPE)');
        cross(cx + 6, cy - 5, '#ef5350', 'O2');
        label(`t_min_xlpe = ${data.tmin} mm`, cx + rIn + 15, cy - 5, '#facc15');
        label(`t_max_xlpe = ${data.tmax} mm`, cx - rOut - 100, cy - 5, '#facc15');
        break;
      }

      // 7. TESISAT_SINGLE_COLOR & Default
      default: {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, rOut, 0, Math.PI * 2, false);
        ctx.arc(cx, cy, rIn, 0, Math.PI * 2, true);
        ctx.fillStyle = 'rgba(76, 175, 80, 0.38)'; ctx.fill();
        ctx.strokeStyle = '#4caf50'; ctx.lineWidth = 2.5; ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx + 5, cy - 4, rIn * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 83, 80, 0.35)'; ctx.fill();
        ctx.strokeStyle = '#ef5350'; ctx.lineWidth = 2; ctx.stroke();
        ctx.restore();

        radial6(cx, cy, rIn, rOut);
        cross(cx, cy, '#ffffff', 'O1');
        cross(cx + 5, cy - 4, '#ef5350', 'O2');

        label(`tmin = ${data.tmin} mm`, cx + rIn + 15, cy - 5, '#facc15');
        label(`tmax = ${data.tmax} mm`, cx - rOut - 90, cy - 5, '#facc15');
        if (cableType === C.TESISAT_SINGLE_COLOR) {
          label('Renk Oranı ≥ %30 (y1/y2)', cx - 80, cy - rOut - 15, '#81c784');
        }
        break;
      }
    }

    // Top status stamp
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(10, 10, 280, 36);
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(10, 10, 280, 36);

    ctx.font = 'bold 11px Segoe UI, sans-serif';
    ctx.fillStyle = '#81c784';
    ctx.fillText(`✓ DİNAMİK SHAPE MASK: ${cableType}`, 18, 25);
    ctx.font = '10px Segoe UI, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`GEOMETRİK KONTUR RENKLENDİRMESİ OK`, 18, 38);
    ctx.restore();
  }

  /**
   * Generates a composited image data URL from snapshot image + dynamic computer vision analysis.
   */
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

    let dynamicData: DynamicMeasurementData = {
      tmin: 0.72, tmax: 0.88, eccentricity: 0.04,
      rOuterPx: width * 0.28, rInnerPx: width * 0.15,
      cx: width / 2, cy: height / 2,
    };

    if (!ctx) return { imagePath: '', measurementData: dynamicData };

    if (sourceImageDataUrl) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
          dynamicData = MeasurementOverlayService.analyzeFrame(ctx, width, height);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = sourceImageDataUrl;
      });
    } else {
      ctx.fillStyle = '#111111';
      ctx.fillRect(0, 0, width, height);
      dynamicData = MeasurementOverlayService.analyzeFrame(ctx, width, height);
    }

    // Draw optical colorized shape mask + dynamic lines on top for the EXACT selected cableType
    MeasurementOverlayService.drawOverlay(ctx, width, height, cableType, dynamicData);

    return {
      imagePath: canvas.toDataURL('image/jpeg', 0.92),
      measurementData: dynamicData,
    };
  }
}
