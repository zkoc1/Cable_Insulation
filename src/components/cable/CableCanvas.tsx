import React, { useEffect, useRef } from 'react';
import type { CableTypeCategory } from '../../core/interfaces/cable';
import { CableTypeCategoryEnum as C } from '../../core/interfaces/cable';

interface Props { cableType: CableTypeCategory; width?: number; height?: number; }

/* Draws a detailed cross-section diagram matching EK_2 illustrations */
export const CableCanvas: React.FC<Props> = ({ cableType, width = 520, height = 440 }) => {
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
    ctx.fillStyle = '#080a0d';
    ctx.fillRect(0, 0, W, H);

    /* ── helper: draw dashed radial lines (60° intervals) ── */
    const radialLines = (fromR: number, toR: number, color = 'rgba(255,255,255,0.35)') => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 6; i++) {
        const a = (i * 60 * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * fromR, cy + Math.sin(a) * fromR);
        ctx.lineTo(cx + Math.cos(a) * toR,   cy + Math.sin(a) * toR);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
    };

    /* ── helper: draw filled + stroked circle ── */
    const circle = (x: number, y: number, r: number, fill: string, stroke: string, sw = 2.5) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = sw;
      ctx.stroke();
    };

    /* ── helper: center marker ── */
    const marker = (x: number, y: number, color: string, label: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(label, x + 7, y - 5);
    };

    /* ── helper: measurement arrow label ── */
    const measureLabel = (text: string, x: number, y: number) => {
      ctx.fillStyle = 'rgba(250,204,21,0.9)';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(text, x, y);
    };

    if (cableType === C.XLPE_HV) {
      /* VELOX style: outer(yellow) → XLPE(red fill) → inner semi-con(blue) → conductor(white) */
      circle(cx, cy, 190, 'transparent', '#eab308', 2.5);                     // outer boundary
      circle(cx, cy, 175, 'rgba(185,28,28,0.55)', '#ef4444', 2);              // XLPE outer
      circle(cx, cy, 95,  'rgba(30,41,59,0.9)',   '#3b82f6', 2);              // inner semi-con
      circle(cx + 6, cy - 4, 62, '#374151', '#6b7280', 1.5);                  // conductor (offset → eccentricity)
      /* conductor strands (multi-wire look) */
      for (let i = 0; i < 6; i++) {
        const a = (i * 60 * Math.PI) / 180;
        circle(cx + 6 + Math.cos(a) * 28, cy - 4 + Math.sin(a) * 28, 12, '#9ca3af', '#d1d5db', 1);
      }
      circle(cx + 6, cy - 4, 14, '#d1d5db', '#f1f5f9', 1);

      radialLines(95, 175, 'rgba(100,200,120,0.5)');

      marker(cx, cy, '#eab308', 'O1');
      marker(cx + 6, cy - 4, '#ef4444', 'O2');

      /* tmin/tmax labels */
      measureLabel('t_min_xlpe', cx + 98, cy - 18);
      measureLabel('t_max_xlpe', cx + 115, cy + 20);
      measureLabel('Dış Yarı İletken', cx - 185, cy - 20);
      measureLabel('XLPE İzolasyon',   cx + 110, cy - 90);
      measureLabel('İç Yarı İletken',  cx - 100, cy - 105);

    } else if (cableType === C.TESISAT_SINGLE_COLOR) {
      /* Two-color single core – yellow-green isolation */
      circle(cx, cy, 170, 'transparent', '#facc15', 2.5);
      /* insulation fill – split color (yellow / green) */
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, 160, 0, Math.PI); ctx.closePath();
      ctx.fillStyle = 'rgba(234,179,8,0.45)'; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 160, Math.PI, Math.PI * 2); ctx.closePath();
      ctx.fillStyle = 'rgba(34,197,94,0.45)'; ctx.fill();
      ctx.restore();
      circle(cx, cy, 160, 'transparent', '#eab308', 1.8);
      circle(cx + 5, cy - 3, 80, '#374151', '#6b7280', 2);    // conductor
      circle(cx + 5, cy - 3, 40, '#9ca3af', '#f1f5f9', 1.5);

      /* arc labels y1 / y2 */
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(cx, cy, 165, 0, Math.PI * 0.6); ctx.stroke();
      measureLabel('y1', cx + 140, cy - 110);
      ctx.beginPath(); ctx.arc(cx, cy, 165, Math.PI, Math.PI * 1.6); ctx.stroke();
      measureLabel('y2', cx - 170, cy + 110);

      marker(cx, cy, '#facc15', 'O1');
      marker(cx + 5, cy - 3, '#ef4444', 'O2');
      radialLines(80, 160, 'rgba(250,204,21,0.4)');
      measureLabel('tmin', cx + 82, cy + 10);
      measureLabel('≥30% renk oranı', cx - 90, cy + 175);

    } else if (cableType === C.TESISAT_MULTI_CORE) {
      /* 3-core stranded */
      circle(cx, cy, 175, 'transparent', '#38bdf8', 2.5);
      circle(cx, cy, 160, 'rgba(30,58,95,0.4)', '#1d4ed8', 1.5);
      const corePos = [[cx, cy - 75], [cx - 65, cy + 38], [cx + 65, cy + 38]] as [number,number][];
      corePos.forEach(([x, y], i) => {
        circle(x, y, 48, 'rgba(30,64,175,0.55)', '#3b82f6', 1.8);
        circle(x, y, 25, '#374151', '#6b7280', 1.5);
        measureLabel(`t${i + 1}`, x - 12, y - 52);
      });
      marker(cx, cy, '#38bdf8', 'O2');
      measureLabel('Dış Kılıf', cx + 120, cy - 155);

    } else if (cableType === C.TESISAT_NYAF_SOM) {
      /* Solid / fine-wire single core */
      circle(cx, cy, 170, 'transparent', '#a78bfa', 2.5);
      circle(cx, cy, 155, 'rgba(109,40,217,0.35)', '#7c3aed', 2);
      /* fine wires */
      for (let i = 0; i < 12; i++) {
        const a = (i * 30 * Math.PI) / 180;
        circle(cx + Math.cos(a) * 55, cy + Math.sin(a) * 55, 16, '#4c1d95', '#7c3aed', 1);
      }
      circle(cx, cy, 22, '#7c3aed', '#c4b5fd', 1.5);
      radialLines(80, 155, 'rgba(196,181,253,0.4)');
      marker(cx, cy, '#a78bfa', 'O1');
      measureLabel('tmin', cx + 82, cy + 12);
      measureLabel('İletken (çok telli)', cx - 50, cy + 3);

    } else if (cableType === C.AER) {
      /* AER with ridges */
      /* ridges */
      for (let i = 0; i < 3; i++) {
        const a = (i * 120 * Math.PI) / 180;
        const rx = cx + Math.cos(a) * 165;
        const ry = cy + Math.sin(a) * 165;
        ctx.save();
        ctx.translate(rx, ry);
        ctx.rotate(a);
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 22, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(251,146,60,0.5)';
        ctx.fill();
        ctx.strokeStyle = '#fb923c';
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.restore();
        measureLabel('Çb', rx + 14, ry + 4);
      }
      circle(cx, cy, 155, 'rgba(67,20,7,0.6)', '#ea580c', 2.5);
      circle(cx + 4, cy - 3, 80, '#374151', '#6b7280', 2);
      circle(cx + 4, cy - 3, 42, '#9ca3af', '#f1f5f9', 1.5);
      radialLines(80, 155, 'rgba(251,146,60,0.4)');
      marker(cx, cy, '#fb923c', 'O1');
      marker(cx + 4, cy - 3, '#ef4444', 'O2');
      measureLabel('tmin', cx + 83, cy + 10);

    } else if (cableType === C.NYIF) {
      /* Flat NYIF – two cores side by side + bridge */
      const bw = 280, bh = 140;
      ctx.beginPath();
      ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 18);
      ctx.fillStyle = 'rgba(5,46,22,0.5)';
      ctx.fill();
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      [cx - 82, cx + 82].forEach(x => {
        circle(x, cy, 44, 'rgba(6,78,59,0.6)', '#10b981', 1.8);
        circle(x, cy, 24, '#374151', '#6b7280', 1.5);
        circle(x, cy, 12, '#9ca3af', '#d1d5db', 1);
      });
      /* bridge dimension lines */
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.5; ctx.setLineDash([4,3]);
      ctx.beginPath(); ctx.moveTo(cx - 38, cy); ctx.lineTo(cx + 38, cy); ctx.stroke();
      ctx.setLineDash([]);
      measureLabel('y2 (köprü)', cx - 35, cy - 8);
      ctx.beginPath(); ctx.moveTo(cx - bw/2 + 8, cy - bh/2 + 8); ctx.lineTo(cx - bw/2 + 8, cy + bh/2 - 8); ctx.strokeStyle='#38bdf8'; ctx.stroke();
      measureLabel('y1', cx - bw/2 + 12, cy + 5);
      measureLabel('tmin', cx - 107, cy - 52);

    } else if (cableType === C.YASSI_TTR) {
      /* Flat TTR – 3 cores in a row */
      const bw = 340, bh = 130;
      ctx.beginPath();
      ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 14);
      ctx.fillStyle = 'rgba(46,16,101,0.4)';
      ctx.fill();
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      const xs = [cx - 110, cx, cx + 110];
      xs.forEach((x, i) => {
        circle(x, cy, 42, 'rgba(76,29,149,0.55)', '#7c3aed', 1.8);
        circle(x, cy, 22, '#374151', '#6b7280', 1.5);
        measureLabel(`t${i + 1}`, x - 8, cy - 46);
      });
      /* y1/y2 */
      ctx.strokeStyle = '#e879f9'; ctx.lineWidth = 1.2; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(cx - bw/2 + 6, cy - bh/2 + 6); ctx.lineTo(cx + bw/2 - 6, cy - bh/2 + 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - bw/2 + 6, cy - bh/2 + 6); ctx.lineTo(cx - bw/2 + 6, cy + bh/2 - 6); ctx.stroke();
      ctx.setLineDash([]);
      measureLabel('y2 (genişlik)', cx - 60, cy - bh/2 + 18);
      measureLabel('y1', cx - bw/2 + 10, cy + 10);

    } else if (cableType === C.SEKTOR) {
      /* Sector cable – triangular cross-section */
      const drawSector = (offsetX: number, offsetY: number, r: number, startAngle: number, endAngle: number, fill: string, stroke: string) => {
        ctx.beginPath();
        ctx.moveTo(cx + offsetX, cy + offsetY);
        ctx.arc(cx + offsetX, cy + offsetY, r, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2;
        ctx.stroke();
      };
      /* Three sectors arranged in triangle */
      const sectorAngle = (2 * Math.PI) / 3;
      for (let i = 0; i < 3; i++) {
        const startA = i * sectorAngle - sectorAngle / 2 - Math.PI / 2;
        const endA   = startA + sectorAngle;
        drawSector(0, 0, 150, startA, endA, 'rgba(5,46,22,0.55)', '#4ade80');
        const midA = startA + sectorAngle / 2;
        const lx = cx + Math.cos(midA) * 90;
        const ly = cy + Math.sin(midA) * 90;
        circle(lx, ly, 35, '#374151', '#6b7280', 1.5);
        circle(lx, ly, 18, '#9ca3af', '#d1d5db', 1);
        measureLabel('tmin', lx + 37, ly + 4);
      }
      marker(cx, cy, '#4ade80', 'O2');
      measureLabel('O2 (Yalıtım merkezi)', cx + 8, cy - 10);
      measureLabel('Sektör Kesit', cx - 50, cy - 165);
    }

    /* ── watermark version ── */
    ctx.fillStyle = 'rgba(74,222,128,0.08)';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText('VELOX Engine – test image', 10, H - 10);

  }, [cableType]);

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      style={{ borderRadius: 8, border: '1px solid #262d3a', display: 'block', maxWidth: '100%' }}
    />
  );
};
