import type { CableTypeCategory } from '../core/interfaces/cable';
import { CableTypeCategoryEnum as C } from '../core/interfaces/cable';

/**
 * Service to draw optical measurement overlay lines, radial dimensions, 
 * O1/O2 center markers, and parameter callouts onto a canvas context (or camera snapshot).
 */
export class MeasurementOverlayService {
  public static drawOverlay(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    cableType: CableTypeCategory
  ) {
    const cx = W / 2;
    const cy = H / 2;

    // Helper: dashed line
    const dashLine = (x1: number, y1: number, x2: number, y2: number, col = '#facc15', lw = 2) => {
      ctx.save();
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    };

    // Helper: text badge label
    const label = (text: string, x: number, y: number, col = '#facc15', bg?: string) => {
      ctx.save();
      ctx.font = 'bold 12px Segoe UI, Arial, sans-serif';
      if (bg) {
        const tw = ctx.measureText(text).width;
        ctx.fillStyle = bg;
        ctx.fillRect(x - 4, y - 11, tw + 8, 16);
      }
      ctx.fillStyle = col;
      ctx.fillText(text, x, y);
      ctx.restore();
    };

    // Helper: 6 radial measurement lines at 60° intervals
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

    // Center cross marker for O1 / O2
    const cross = (x: number, y: number, col: string, text: string) => {
      ctx.save();
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x + 8, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x, y + 8); ctx.stroke();
      label(text, x + 10, y - 4, col, 'rgba(0,0,0,0.6)');
      ctx.restore();
    };

    // Concentric guideline circle
    const guideCircle = (x: number, y: number, r: number, col: string, lw = 2) => {
      ctx.save();
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };

    // Draw grid overlay for optical inspection scale
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.restore();

    // Cable-specific optical overlay drawings
    switch (cableType) {
      case C.XLPE_HV: {
        const scale = Math.min(W, H) / 500;
        const r1 = 180 * scale, r2 = 140 * scale, r3 = 90 * scale, r4 = 42 * scale;
        guideCircle(cx, cy, r1, '#e8c840', 2.5); // Dış kılıf
        guideCircle(cx, cy, r2, '#43a047', 2);   // XLPE dış
        guideCircle(cx, cy, r3, '#29b6f6', 2);   // İç yarı iletken
        guideCircle(cx + 6 * scale, cy - 5 * scale, r4, '#ef5350', 2); // İletken

        radial6(cx, cy, r3, r2);
        cross(cx, cy, '#e8c840', 'O1 (Merkez)');
        cross(cx + 6 * scale, cy - 5 * scale, '#ef5350', 'O2 (İletken)');

        label('t_min_xlpe = 4.24 mm', cx + r3 + 10, cy + 5, '#facc15', 'rgba(0,0,0,0.7)');
        label('t_max_xlpe = 4.62 mm', cx - r2 - 110, cy - 10, '#facc15', 'rgba(0,0,0,0.7)');
        label('İç Yarı İletken', cx - 80, cy - r3 - 10, '#29b6f6', 'rgba(0,0,0,0.7)');
        label('XLPE Yalıtım', cx + 60, cy - r2 + 10, '#43a047', 'rgba(0,0,0,0.7)');
        dashLine(cx, cy, cx + 6 * scale, cy - 5 * scale, '#ffffff', 2);
        break;
      }

      case C.TESISAT_SINGLE_COLOR: {
        const scale = Math.min(W, H) / 500;
        const r1 = 160 * scale, r2 = 80 * scale;
        guideCircle(cx, cy, r1, '#43a047', 2.5);
        guideCircle(cx + 6 * scale, cy - 4 * scale, r2, '#ef5350', 2);

        radial6(cx, cy, r2, r1);
        cross(cx, cy, '#ffffff', 'O1');
        cross(cx + 6 * scale, cy - 4 * scale, '#ef5350', 'O2');

        label('tmin = 0.72 mm', cx + r2 + 15, cy + 5, '#facc15', 'rgba(0,0,0,0.7)');
        label('Renk Oranı ≥ %30 (y1/y2)', cx - 80, cy + r1 + 15, '#4af', 'rgba(0,0,0,0.7)');
        break;
      }

      case C.TESISAT_MULTI_CORE: {
        const scale = Math.min(W, H) / 500;
        const rOuter = 160 * scale;
        guideCircle(cx, cy, rOuter, '#ef5350', 2.5);

        const cores: [number, number][] = [
          [cx, cy - 70 * scale],
          [cx - 60 * scale, cy + 35 * scale],
          [cx + 60 * scale, cy + 35 * scale],
        ];

        cores.forEach(([x, y], i) => {
          guideCircle(x, y, 50 * scale, '#43a047', 2);
          guideCircle(x, y, 28 * scale, '#ffffff', 1.5);
          cross(x, y, '#facc15', `C${i + 1}`);
          label(`t${i + 1} min`, x - 15, y - 55 * scale, '#facc15', 'rgba(0,0,0,0.7)');
        });
        cross(cx, cy, '#44f', 'O2');
        break;
      }

      case C.SEKTOR: {
        const scale = Math.min(W, H) / 500;
        const secAngle = (2 * Math.PI) / 3;
        for (let i = 0; i < 3; i++) {
          const startA = i * secAngle - secAngle / 2 - Math.PI / 2;
          ctx.save();
          ctx.strokeStyle = '#43a047'; ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, 150 * scale, startA, startA + secAngle);
          ctx.closePath();
          ctx.stroke();
          ctx.restore();

          const mid = startA + secAngle / 2;
          const mx = cx + Math.cos(mid) * 80 * scale;
          const my = cy + Math.sin(mid) * 80 * scale;
          guideCircle(mx, my, 30 * scale, '#ffffff', 1.5);
          label('tmin', cx + Math.cos(mid) * 115 * scale - 14, cy + Math.sin(mid) * 115 * scale + 4, '#facc15', 'rgba(0,0,0,0.7)');
        }
        cross(cx, cy, '#29b6f6', 'O2');
        break;
      }

      default: {
        const scale = Math.min(W, H) / 500;
        const r1 = 150 * scale, r2 = 75 * scale;
        guideCircle(cx, cy, r1, '#43a047', 2.5);
        guideCircle(cx + 5 * scale, cy - 4 * scale, r2, '#ef5350', 2);
        radial6(cx, cy, r2, r1);
        cross(cx, cy, '#ffffff', 'O1');
        cross(cx + 5 * scale, cy - 4 * scale, '#ef5350', 'O2');
        label('tmin = 1.15 mm', cx + r2 + 10, cy + 5, '#facc15', 'rgba(0,0,0,0.7)');
        break;
      }
    }

    // Top status stamp overlay
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(10, 10, 240, 32);
    ctx.strokeStyle = '#3d8b40';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(10, 10, 240, 32);

    ctx.font = 'bold 11px Segoe UI, sans-serif';
    ctx.fillStyle = '#81c784';
    ctx.fillText('✓ OPTİK ÖLÇÜM KATMANI', 20, 26);
    ctx.font = '10px Segoe UI, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('TS EN 60811 UYUMLU', 20, 37);
    ctx.restore();
  }

  /**
   * Combines an image (e.g. live camera snapshot data URL) with optical measurement overlay lines
   * into a single self-contained JPEG data URL.
   */
  public static async createCompositedSnapshot(
    sourceImageDataUrl: string | null,
    cableType: CableTypeCategory,
    width = 640,
    height = 480
  ): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Draw background camera snapshot if available
    if (sourceImageDataUrl) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = sourceImageDataUrl;
      });
    } else {
      // Dark microscope background fallback
      ctx.fillStyle = '#111111';
      ctx.fillRect(0, 0, width, height);
    }

    // Draw measurement overlay lines directly on top of the image
    MeasurementOverlayService.drawOverlay(ctx, width, height, cableType);

    return canvas.toDataURL('image/jpeg', 0.92);
  }
}
