import React, { useEffect, useRef } from 'react';
import type { CableTypeCategory } from '../../core/interfaces/cable';
import { CableTypeCategoryEnum as C } from '../../core/interfaces/cable';

interface Props {
  cableType: CableTypeCategory;
  width?: number;
  height?: number;
  /** Thumbnail mode: industrial flat-icon style (white bg, dark sheath, green ring, white core) */
  thumbnail?: boolean;
}

/**
 * Draws cable cross-section diagrams.
 * Thumbnail mode matches industrial cable QC reference UI (dark sheath / green insulation / white core).
 * Full mode matches EK_2 microscope cross-section view with measurement annotations.
 */
export const CableCanvas: React.FC<Props> = ({
  cableType,
  width = 500,
  height = 400,
  thumbnail = false,
}) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = thumbnail ? '#f8f9fa' : '#111111';
    ctx.fillRect(0, 0, W, H);

    const SHEATH  = '#262626';
    const GREEN   = '#388e3c';
    const WHITE   = '#ffffff';
    const OUTLINE = '#1a1a1a';

    // Solid circle helper
    const circle = (x: number, y: number, r: number, fill: string, strokeColor?: string, lw = 1.5) => {
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.5, r), 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      if (strokeColor) { ctx.strokeStyle = strokeColor; ctx.lineWidth = lw; ctx.stroke(); }
    };

    // Proper rounded triangle using arcTo — works correctly
    const roundedTriangle = (x: number, y: number, r: number, cornerR: number, fill: string, strokeColor?: string) => {
      const pts = [
        { x: x + Math.cos(-Math.PI / 2) * r,      y: y + Math.sin(-Math.PI / 2) * r },      // top
        { x: x + Math.cos(Math.PI / 6) * r,       y: y + Math.sin(Math.PI / 6) * r },        // bottom-right
        { x: x + Math.cos((5 * Math.PI) / 6) * r, y: y + Math.sin((5 * Math.PI) / 6) * r }, // bottom-left
      ];
      ctx.beginPath();
      ctx.moveTo((pts[2].x + pts[0].x) / 2, (pts[2].y + pts[0].y) / 2);
      ctx.arcTo(pts[0].x, pts[0].y, pts[1].x, pts[1].y, cornerR);
      ctx.arcTo(pts[1].x, pts[1].y, pts[2].x, pts[2].y, cornerR);
      ctx.arcTo(pts[2].x, pts[2].y, pts[0].x, pts[0].y, cornerR);
      ctx.closePath();
      ctx.fillStyle = fill; ctx.fill();
      if (strokeColor) { ctx.strokeStyle = strokeColor; ctx.lineWidth = 1.5; ctx.stroke(); }
    };

    // ── THUMBNAIL MODE ──────────────────────────────────────────────────────────
    if (thumbnail) {
      const S = SHEATH;
      const G = GREEN;
      const W2 = WHITE;
      const O = OUTLINE;

      switch (cableType) {

        case C.XLPE_HV:
          // Simple concentric: sheath → green insulation ring → dark semiconductor → white conductor
          circle(cx, cy, 26, S, O, 1.5);
          circle(cx, cy, 19, G);
          circle(cx, cy, 11, S);
          circle(cx, cy, 5.5, W2);
          break;

        case C.TESISAT_SINGLE_COLOR:
          // Round: sheath → yellow/green split ring → white conductor
          circle(cx, cy, 26, S, O, 1.5);
          // yellow top half
          ctx.save();
          ctx.beginPath(); ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, 19, -Math.PI * 0.9, Math.PI * 0.1);
          ctx.closePath(); ctx.fillStyle = '#fbc02d'; ctx.fill();
          // green bottom half
          ctx.beginPath(); ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, 19, Math.PI * 0.1, Math.PI * 1.1);
          ctx.closePath(); ctx.fillStyle = G; ctx.fill();
          ctx.restore();
          circle(cx, cy, 9, W2);
          break;

        case C.TESISAT_MULTI_CORE: {
          // 3-core trefoil — draw 3 overlapping dark lobes then 3 green+white cores
          const dist = 9.5;
          const coreAngles = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];

          // dark outer sheath for each lobe
          coreAngles.forEach(a => {
            circle(cx + Math.cos(a) * dist, cy + Math.sin(a) * dist, 14, S);
          });
          // stroke outer boundary
          ctx.beginPath();
          coreAngles.forEach(a => {
            ctx.arc(cx + Math.cos(a) * dist, cy + Math.sin(a) * dist, 14, 0, Math.PI * 2);
          });
          ctx.strokeStyle = O; ctx.lineWidth = 1.5; ctx.stroke();

          // green insulation + white core for each
          coreAngles.forEach(a => {
            const px = cx + Math.cos(a) * dist;
            const py = cy + Math.sin(a) * dist;
            circle(px, py, 9, G);
            circle(px, py, 4, W2);
          });
          break;
        }

        case C.TESISAT_NYAF_SOM:
          // Single round: thick sheath → green insulation → stranded white center
          // Slightly thicker sheath than XLPE_HV to distinguish
          circle(cx, cy, 26, S, O, 1.5);
          circle(cx, cy, 18, G);
          circle(cx, cy, 10, W2);
          // small dark dot in center to show stranded wire character
          circle(cx, cy, 2.5, '#999999');
          break;

        case C.AER:
          // Round with 3 external ridge bumps
          for (let i = 0; i < 3; i++) {
            const a = (i * 120 * Math.PI) / 180 - Math.PI / 2;
            circle(cx + Math.cos(a) * 23, cy + Math.sin(a) * 23, 5.5, S);
          }
          circle(cx, cy, 20, S, O, 1.5);
          circle(cx, cy, 13, G);
          circle(cx, cy, 6, W2);
          break;

        case C.NYIF: {
          // 2-core figure-8: two dark circles touching at center, green+white inside each
          const offset = 12;
          // outer sheath for both cores
          ctx.beginPath();
          ctx.arc(cx - offset, cy, 14, 0, Math.PI * 2);
          ctx.fillStyle = S; ctx.fill();
          ctx.beginPath();
          ctx.arc(cx + offset, cy, 14, 0, Math.PI * 2);
          ctx.fillStyle = S; ctx.fill();
          // outline
          ctx.beginPath();
          ctx.arc(cx - offset, cy, 14, 0, Math.PI * 2);
          ctx.arc(cx + offset, cy, 14, 0, Math.PI * 2);
          ctx.strokeStyle = O; ctx.lineWidth = 1.5; ctx.stroke();
          // green insulation + white conductor
          circle(cx - offset, cy, 9, G);
          circle(cx - offset, cy, 4.5, W2);
          circle(cx + offset, cy, 9, G);
          circle(cx + offset, cy, 4.5, W2);
          break;
        }

        case C.YASSI_TTR: {
          // Flat capsule 3-core
          const bw = 50, bh = 20;
          ctx.beginPath();
          ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 9);
          ctx.fillStyle = S; ctx.fill();
          ctx.strokeStyle = O; ctx.lineWidth = 1.5; ctx.stroke();
          [-15, 0, 15].forEach(off => {
            circle(cx + off, cy, 6.5, G);
            circle(cx + off, cy, 3, W2);
          });
          break;
        }

        case C.SEKTOR:
          // Properly rounded triangular sector shape — 3 nested rounded triangles
          roundedTriangle(cx, cy + 3, 27, 9, S, O);
          roundedTriangle(cx, cy + 3, 19, 6, G);
          roundedTriangle(cx, cy + 3, 10, 3, W2);
          break;
      }
      return;
    }

    // ── FULL MEASUREMENT VIEW (EK_2 microscope style) ─────────────────────────

    const dashLine = (x1: number, y1: number, x2: number, y2: number, col = '#facc15') => {
      ctx.save(); ctx.setLineDash([5, 4]);
      ctx.strokeStyle = col; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.setLineDash([]); ctx.restore();
    };

    const lbl = (text: string, x: number, y: number, col = '#facc15') => {
      ctx.font = 'bold 11px Segoe UI, sans-serif';
      ctx.fillStyle = col; ctx.fillText(text, x, y);
    };

    const radial6 = (ox: number, oy: number, r1: number, r2: number) => {
      ctx.save(); ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 1.2;
      for (let i = 0; i < 6; i++) {
        const a = (i * 60 * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(ox + Math.cos(a) * r1, oy + Math.sin(a) * r1);
        ctx.lineTo(ox + Math.cos(a) * r2, oy + Math.sin(a) * r2);
        ctx.stroke();
      }
      ctx.setLineDash([]); ctx.restore();
    };

    const cross = (x: number, y: number, col: string, text: string) => {
      ctx.strokeStyle = col; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x, y + 6); ctx.stroke();
      lbl(text, x + 8, y - 4, col);
    };

    const fullCircle = (x: number, y: number, r: number, fill: string, stroke?: string, lw = 2) => {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = fill; ctx.fill();
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
    };

    switch (cableType) {
      case C.XLPE_HV:
        fullCircle(cx, cy, 185, '#2a2a2a', '#e8c840', 3);
        fullCircle(cx, cy, 168, '#444', '#ddd');
        fullCircle(cx, cy, 140, '#1a1a1a', '#43a047');
        fullCircle(cx, cy, 90, '#333', '#6af');
        fullCircle(cx, cy, 70, '#222', '#f55');
        fullCircle(cx + 5, cy - 4, 42, '#555', '#eee', 1.5);
        radial6(cx, cy, 90, 140);
        cross(cx, cy, '#e8c840', 'O1');
        cross(cx + 5, cy - 4, '#f55', 'O2');
        lbl('t_min_xlpe', cx + 92, cy + 5);
        lbl('XLPE İzolasyon', cx + 95, cy - 85, '#43a047');
        lbl('İç Yarı İletken', cx - 88, cy - 96, '#6af');
        dashLine(cx, cy, cx + 5, cy - 4, '#fff');
        break;

      case C.TESISAT_SINGLE_COLOR:
        fullCircle(cx, cy, 170, '#1a1a1a', '#bbb', 2.5);
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, 155, 0, Math.PI); ctx.closePath();
        ctx.fillStyle = 'rgba(200,170,0,0.55)'; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, 155, Math.PI, Math.PI * 2); ctx.closePath();
        ctx.fillStyle = 'rgba(30,140,30,0.55)'; ctx.fill();
        ctx.restore();
        fullCircle(cx, cy, 155, 'transparent', '#ddd', 1.8);
        fullCircle(cx + 6, cy - 4, 80, '#222', '#f55');
        fullCircle(cx + 6, cy - 4, 45, '#555', '#ddd', 1.5);
        radial6(cx, cy, 80, 155);
        cross(cx, cy, '#bbb', 'O1');
        cross(cx + 6, cy - 4, '#f55', 'O2');
        lbl('tmin', cx + 82, cy + 5);
        lbl('≥%30 renk oranı', cx - 60, cy + 180, '#fff');
        break;

      case C.TESISAT_MULTI_CORE:
        fullCircle(cx, cy, 170, '#1a1a1a', '#f55', 2.5);
        fullCircle(cx, cy, 150, '#222', '#44f');
        [[cx, cy - 72], [cx - 62, cy + 36], [cx + 62, cy + 36]].forEach(([x, y], i) => {
          fullCircle(x, y, 52, '#1a1a1a', '#43a047');
          fullCircle(x, y, 30, '#333', '#aaa', 1.5);
          lbl(`t${i + 1}`, x - 10, y - 58);
        });
        cross(cx, cy, '#44f', 'O2');
        cross(cx - 2, cy - 3, '#f55', 'O1');
        lbl('eksen kaçıklığı = |O1-O2|', cx - 70, cy + 185, '#fff');
        break;

      case C.TESISAT_NYAF_SOM:
        fullCircle(cx, cy, 168, '#1a1a1a', '#44f', 2.5);
        fullCircle(cx, cy, 148, '#111', '#ddd');
        fullCircle(cx + 5, cy - 4, 78, '#222', '#f55');
        for (let i = 0; i < 10; i++) {
          const a = (i * 36 * Math.PI) / 180;
          fullCircle(cx + 5 + Math.cos(a) * 44, cy - 4 + Math.sin(a) * 44, 12, '#333', '#aaa', 1);
        }
        fullCircle(cx + 5, cy - 4, 18, '#555', '#ddd', 1.2);
        radial6(cx, cy, 78, 148);
        cross(cx, cy, '#ddd', 'O1');
        cross(cx + 5, cy - 4, '#f55', 'O2');
        lbl('tmin', cx + 80, cy + 5);
        break;

      case C.AER:
        for (let i = 0; i < 3; i++) {
          const a = (i * 120 * Math.PI) / 180 - Math.PI / 2;
          const px = cx + Math.cos(a) * 162, py = cy + Math.sin(a) * 162;
          ctx.save(); ctx.translate(px, py); ctx.rotate(a);
          ctx.beginPath(); ctx.ellipse(0, 0, 10, 20, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#333'; ctx.fill();
          ctx.strokeStyle = '#bbb'; ctx.lineWidth = 2; ctx.stroke();
          ctx.restore();
          lbl('Çb', px + 12, py + 4);
        }
        fullCircle(cx, cy, 148, '#1a1a1a', '#e8c840', 2.5);
        fullCircle(cx + 6, cy - 5, 80, '#222', 'orange');
        fullCircle(cx + 6, cy - 5, 44, '#444', '#ddd', 1.5);
        radial6(cx, cy, 80, 148);
        cross(cx, cy, '#e8c840', 'O1');
        cross(cx + 6, cy - 5, 'orange', 'O2');
        lbl('tmin', cx + 82, cy + 5);
        break;

      case C.NYIF: {
        const bw = 300, bh = 130;
        ctx.beginPath();
        ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 20);
        ctx.fillStyle = '#1a1a1a'; ctx.fill();
        ctx.strokeStyle = '#ddd'; ctx.lineWidth = 2.5; ctx.stroke();
        [cx - 82, cx + 82].forEach(x => {
          fullCircle(x, cy, 46, '#111', 'orange');
          fullCircle(x, cy, 28, '#222', '#f55', 1.8);
          fullCircle(x, cy, 14, '#555', '#ddd', 1);
        });
        dashLine(cx - 36, cy, cx + 36, cy, '#4af');
        lbl('y2', cx - 8, cy - 10, '#4af');
        lbl('tmin', cx - 106, cy - 55);
        break;
      }

      case C.YASSI_TTR: {
        const bw2 = 340, bh2 = 120;
        ctx.beginPath();
        ctx.roundRect(cx - bw2 / 2, cy - bh2 / 2, bw2, bh2, 14);
        ctx.fillStyle = '#1a1a1a'; ctx.fill();
        ctx.strokeStyle = '#ddd'; ctx.lineWidth = 2.5; ctx.stroke();
        [cx - 106, cx, cx + 106].forEach((x, i) => {
          fullCircle(x, cy, 42, '#222', '#ddd');
          fullCircle(x, cy, 22, '#333', '#aaa', 1.5);
          lbl(`t${i + 1}`, x - 10, cy - 50);
        });
        dashLine(cx - bw2 / 2 + 6, cy - bh2 / 2 + 6, cx + bw2 / 2 - 6, cy - bh2 / 2 + 6, '#4af');
        lbl('y2', cx - 20, cy - bh2 / 2 + 20, '#4af');
        break;
      }

      case C.SEKTOR:
        roundedTriangle(cx, cy + 10, 160, 55, '#1e1e1e', '#bbb');
        roundedTriangle(cx, cy + 10, 108, 37, '#333', '#43a047');
        roundedTriangle(cx, cy + 10, 50, 17, '#555', '#eee');
        cross(cx, cy + 10, '#4af', 'O2');
        lbl('tmin', cx + 60, cy + 30);
        break;
    }

    ctx.font = '9px Segoe UI, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillText('EK_2', 6, H - 5);
  }, [cableType, thumbnail]);

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      style={{ borderRadius: thumbnail ? 4 : 6, display: 'block', maxWidth: '100%' }}
    />
  );
};
