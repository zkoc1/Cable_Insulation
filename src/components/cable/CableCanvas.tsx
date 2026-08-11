import React, { useEffect, useRef } from 'react';
import type { CableTypeCategory } from '../../core/interfaces/cable';
import { CableTypeCategoryEnum as C } from '../../core/interfaces/cable';

interface Props {
  cableType: CableTypeCategory;
  width?: number;
  height?: number;
  /** When true, draws the industrial vector schematic thumbnail (matching reference screenshot) */
  thumbnail?: boolean;
}

/**
 * Draws cable cross-section diagrams matching EK_2 specification & reference UI.
 * 
 * - Thumbnail Mode: Renders exact industrial geometry matching reference screenshot
 *   (Multi-core trefoil, rounded sector triangle, 2-core dumbbell, flat 3-core, AER ridges).
 * - Full Mode: Microscope view with measurement guidelines, O1/O2 markers & dimension text.
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

    // Clear background
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = thumbnail ? '#f8f9fa' : '#111111';
    ctx.fillRect(0, 0, W, H);

    // Colors
    const cDarkSheath = thumbnail ? '#262626' : '#2a2a2a';
    const cGreenLayer = thumbnail ? '#388e3c' : '#43a047';
    const cWhiteCore  = thumbnail ? '#ffffff' : '#eeeeee';
    const cStroke     = thumbnail ? '#1a1a1a' : '#ddd';

    // Helper: Circle
    const drawCircle = (x: number, y: number, r: number, fill: string, stroke?: string, lw = 1.5) => {
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1, r), 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lw;
        ctx.stroke();
      }
    };

    // Helper: Rounded Triangle for Sector Cables (Matches Row 4 of reference image)
    const drawRoundedTriangle = (x: number, y: number, r: number, fill: string, stroke?: string, lw = 1.5) => {
      ctx.beginPath();
      const angles = [-Math.PI / 2, (Math.PI * 1) / 6, (Math.PI * 5) / 6];
      const p1 = { x: x + Math.cos(angles[0]) * r, y: y + Math.sin(angles[0]) * r };
      const p2 = { x: x + Math.cos(angles[1]) * r, y: y + Math.sin(angles[1]) * r };
      const p3 = { x: x + Math.cos(angles[2]) * r, y: y + Math.sin(angles[2]) * r };

      const cornerRadius = r * 0.4;
      ctx.moveTo((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
      ctx.arcTo(p2.x, p2.y, p3.x, p3.y, cornerRadius);
      ctx.arcTo(p3.x, p3.y, p1.x, p1.y, cornerRadius);
      ctx.arcTo(p3.x, p3.y, p1.x, p1.y, cornerRadius);
      ctx.closePath();

      ctx.fillStyle = fill;
      ctx.fill();
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lw;
        ctx.stroke();
      }
    };

    // --- THUMBNAIL GRAPHIC RENDERER (Matches Reference Screenshot Row by Row) ---
    if (thumbnail) {
      if (cableType === C.XLPE_HV) {
        // Single Round: Dark sheath -> Green insulation ring -> Dark semiconductor -> White core
        drawCircle(cx, cy, 25, cDarkSheath, cStroke, 1.5);
        drawCircle(cx, cy, 19, cGreenLayer);
        drawCircle(cx, cy, 11, cDarkSheath);
        drawCircle(cx, cy, 5.5, cWhiteCore);

      } else if (cableType === C.TESISAT_SINGLE_COLOR) {
        // Single Round Yellow-Green: Dark sheath -> Yellow/Green split ring -> White core
        drawCircle(cx, cy, 25, cDarkSheath, cStroke, 1.5);

        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, 19, Math.PI * 0.2, Math.PI * 1.2);
        ctx.fillStyle = '#fbc02d'; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, 19, Math.PI * 1.2, Math.PI * 2.2);
        ctx.fillStyle = cGreenLayer; ctx.fill();
        ctx.restore();

        drawCircle(cx, cy, 9, cWhiteCore);

      } else if (cableType === C.TESISAT_MULTI_CORE) {
        // 3-Core Trefoil: 3 outer lobes forming trefoil -> 3 green insulation rings -> 3 white cores
        const dist = 9.5;
        const angles = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];

        // 3-lobe outer dark sheath
        ctx.beginPath();
        angles.forEach(a => {
          const px = cx + Math.cos(a) * dist;
          const py = cy + Math.sin(a) * dist;
          ctx.arc(px, py, 14, 0, Math.PI * 2);
        });
        ctx.fillStyle = cDarkSheath;
        ctx.fill();

        // 3 green insulation cores with white centers
        angles.forEach(a => {
          const px = cx + Math.cos(a) * dist;
          const py = cy + Math.sin(a) * dist;
          drawCircle(px, py, 8.5, cGreenLayer);
          drawCircle(px, py, 4, cWhiteCore);
        });

      } else if (cableType === C.TESISAT_NYAF_SOM) {
        // Single Round Stranded/Solid: Thick dark sheath -> Green insulation -> White center multi-strand
        drawCircle(cx, cy, 25, cDarkSheath, cStroke, 1.5);
        drawCircle(cx, cy, 17.5, cGreenLayer);
        drawCircle(cx, cy, 8.5, cWhiteCore);

        // Small multi-strand dots
        for (let i = 0; i < 6; i++) {
          const a = (i * 60 * Math.PI) / 180;
          drawCircle(cx + Math.cos(a) * 4.5, cy + Math.sin(a) * 4.5, 1.5, '#777777');
        }

      } else if (cableType === C.AER) {
        // AER Aerial Ridged: Dark circle with 3 outer bumps -> Green insulation -> White core
        for (let i = 0; i < 3; i++) {
          const a = (i * 120 * Math.PI) / 180 - Math.PI / 2;
          drawCircle(cx + Math.cos(a) * 23, cy + Math.sin(a) * 23, 5, cDarkSheath);
        }
        drawCircle(cx, cy, 21, cDarkSheath, cStroke, 1.5);
        drawCircle(cx, cy, 14.5, cGreenLayer);
        drawCircle(cx, cy, 7, cWhiteCore);

      } else if (cableType === C.NYIF) {
        // 2-Core Dumbbell (Figure-8): 2 connected dark circles -> 2 green rings -> 2 white cores
        ctx.beginPath();
        ctx.arc(cx - 11, cy, 14, 0, Math.PI * 2);
        ctx.arc(cx + 11, cy, 14, 0, Math.PI * 2);
        ctx.fillStyle = cDarkSheath;
        ctx.fill();

        drawCircle(cx - 11, cy, 9, cGreenLayer);
        drawCircle(cx - 11, cy, 4.5, cWhiteCore);
        drawCircle(cx + 11, cy, 9, cGreenLayer);
        drawCircle(cx + 11, cy, 4.5, cWhiteCore);

      } else if (cableType === C.YASSI_TTR) {
        // Flat 3-Core: Flat rectangle sheath -> 3 inline green insulation rings -> 3 white cores
        const w = 50, h = 20;
        ctx.beginPath();
        ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 9);
        ctx.fillStyle = cDarkSheath; ctx.fill();
        ctx.strokeStyle = cStroke; ctx.lineWidth = 1.5; ctx.stroke();

        [-15, 0, 15].forEach(offset => {
          drawCircle(cx + offset, cy, 6.5, cGreenLayer);
          drawCircle(cx + offset, cy, 3, cWhiteCore);
        });

      } else if (cableType === C.SEKTOR) {
        // Rounded Sector Triangle (Matches Row 4 of reference image)
        drawRoundedTriangle(cx, cy + 2, 27, cDarkSheath, cStroke, 1.5);
        drawRoundedTriangle(cx, cy + 2, 19, cGreenLayer);
        drawRoundedTriangle(cx, cy + 2, 10, cWhiteCore);
      }
      return;
    }

    // --- FULL MEASUREMENT CANVAS RENDERER (EK_2 Guidelines & Dark Microscope View) ---

    const dashLine = (x1: number, y1: number, x2: number, y2: number, color = '#facc15') => {
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    };

    const label = (text: string, x: number, y: number, color = '#facc15') => {
      ctx.font = 'bold 11px Segoe UI, sans-serif';
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
    };

    const radial6 = (cx2: number, cy2: number, r1: number, r2: number) => {
      ctx.save();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      for (let i = 0; i < 6; i++) {
        const a = (i * 60 * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(cx2 + Math.cos(a) * r1, cy2 + Math.sin(a) * r1);
        ctx.lineTo(cx2 + Math.cos(a) * r2, cy2 + Math.sin(a) * r2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
    };

    const cross = (x: number, y: number, color: string, lbl: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x, y + 6); ctx.stroke();
      label(lbl, x + 8, y - 4, color);
    };

    if (cableType === C.XLPE_HV) {
      drawCircle(cx, cy, 185, '#2a2a2a', '#e8c840', 3);
      drawCircle(cx, cy, 168, '#444', '#ddd', 2);
      drawCircle(cx, cy, 140, '#1a1a1a', '#43a047', 2);
      drawCircle(cx, cy, 90, '#333', '#6af', 2);
      drawCircle(cx, cy, 70, '#222', '#f55', 2);
      drawCircle(cx + 5, cy - 4, 42, '#555', '#eee', 1.5);

      radial6(cx, cy, 90, 140);
      cross(cx, cy, '#e8c840', 'O1');
      cross(cx + 5, cy - 4, '#f55', 'O2');

      label('t_min_xlpe', cx + 92, cy + 5);
      label('t_max_xlpe', cx - 148, cy - 10);
      label('İç Yarı İletken', cx - 88, cy - 96, '#6af');
      label('XLPE İzolasyon', cx + 95, cy - 85, '#43a047');
      label('Dış Yarı İletken', cx - 172, cy + 60, '#ddd');
      label('eksen kaçıklığı', cx - 5, cy + 195, '#fff');
      dashLine(cx, cy, cx + 5, cy - 4, '#fff');

    } else if (cableType === C.TESISAT_SINGLE_COLOR) {
      drawCircle(cx, cy, 170, '#1a1a1a', '#bbb', 2.5);

      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, 155, 0, Math.PI); ctx.closePath();
      ctx.fillStyle = 'rgba(200,170,0,0.55)'; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 155, Math.PI, Math.PI * 2); ctx.closePath();
      ctx.fillStyle = 'rgba(30,140,30,0.55)'; ctx.fill();
      ctx.restore();

      drawCircle(cx, cy, 155, 'transparent', '#ddd', 1.8);
      drawCircle(cx + 6, cy - 4, 80, '#222', '#f55', 2);
      drawCircle(cx + 6, cy - 4, 45, '#555', '#ddd', 1.5);

      radial6(cx, cy, 80, 155);
      cross(cx, cy, '#bbb', 'O1');
      cross(cx + 6, cy - 4, '#f55', 'O2');

      label('tmin', cx + 82, cy + 5);
      ctx.save();
      ctx.strokeStyle = '#4af'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(cx, cy, 162, 0, Math.PI * 0.5); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 162, Math.PI, Math.PI * 1.5); ctx.stroke();
      ctx.restore();
      label('y1', cx + 140, cy - 100, '#4af');
      label('y2', cx - 155, cy + 120, '#4af');
      label('≥%30 renk oranı', cx - 60, cy + 180, '#fff');

    } else if (cableType === C.TESISAT_MULTI_CORE) {
      drawCircle(cx, cy, 170, '#1a1a1a', '#f55', 2.5);
      drawCircle(cx, cy, 150, '#222', '#44f', 2);

      const cores: [number, number][] = [
        [cx, cy - 72],
        [cx - 62, cy + 36],
        [cx + 62, cy + 36],
      ];
      cores.forEach(([x, y], i) => {
        drawCircle(x, y, 52, '#1a1a1a', '#43a047', 2);
        drawCircle(x, y, 30, '#333', '#aaa', 1.5);
        label(`t${i + 1}`, x - 10, y - 58, '#facc15');
      });

      cross(cx, cy, '#44f', 'O2');
      cross(cx - 2, cy - 3, '#f55', 'O1');
      label('eksen kaçıklığı = |O1-O2|', cx - 70, cy + 185, '#fff');

    } else if (cableType === C.TESISAT_NYAF_SOM) {
      drawCircle(cx, cy, 168, '#1a1a1a', '#44f', 2.5);
      drawCircle(cx, cy, 148, '#111', '#ddd', 2);
      drawCircle(cx + 5, cy - 4, 78, '#222', '#f55', 2);

      for (let i = 0; i < 10; i++) {
        const a = (i * 36 * Math.PI) / 180;
        drawCircle(cx + 5 + Math.cos(a) * 44, cy - 4 + Math.sin(a) * 44, 12, '#333', '#aaa', 1);
      }
      drawCircle(cx + 5, cy - 4, 18, '#555', '#ddd', 1.2);

      radial6(cx, cy, 78, 148);
      cross(cx, cy, '#ddd', 'O1');
      cross(cx + 5, cy - 4, '#f55', 'O2');
      label('tmin', cx + 80, cy + 5);

    } else if (cableType === C.AER) {
      for (let i = 0; i < 3; i++) {
        const a = (i * 120 * Math.PI) / 180 - Math.PI / 2;
        const px = cx + Math.cos(a) * 162;
        const py = cy + Math.sin(a) * 162;
        ctx.save();
        ctx.translate(px, py); ctx.rotate(a);
        ctx.beginPath(); ctx.ellipse(0, 0, 10, 20, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#333'; ctx.fill();
        ctx.strokeStyle = '#bbb'; ctx.lineWidth = 2; ctx.stroke();
        ctx.restore();
        label('Çb', px + 12, py + 4, '#facc15');
      }

      drawCircle(cx, cy, 148, '#1a1a1a', '#e8c840', 2.5);
      drawCircle(cx + 6, cy - 5, 80, '#222', 'orange', 2);
      drawCircle(cx + 6, cy - 5, 44, '#444', '#ddd', 1.5);

      radial6(cx, cy, 80, 148);
      cross(cx, cy, '#e8c840', 'O1');
      cross(cx + 6, cy - 5, 'orange', 'O2');
      label('tmin', cx + 82, cy + 5);

    } else if (cableType === C.NYIF) {
      const bw = 300, bh = 130;
      ctx.beginPath();
      ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 20);
      ctx.fillStyle = '#1a1a1a'; ctx.fill();
      ctx.strokeStyle = '#ddd'; ctx.lineWidth = 2.5; ctx.stroke();

      [cx - 82, cx + 82].forEach(x => {
        drawCircle(x, cy, 46, '#111', 'orange', 2);
        drawCircle(x, cy, 28, '#222', '#f55', 1.8);
        drawCircle(x, cy, 14, '#555', '#ddd', 1);
      });

      dashLine(cx - 36, cy, cx + 36, cy, '#4af');
      label('y2 (köprü genişliği)', cx - 50, cy - 12, '#4af');
      dashLine(cx - bw / 2 + 8, cy - bh / 2 + 8, cx - bw / 2 + 8, cy + bh / 2 - 8, '#4af');
      label('y1', cx - bw / 2 + 12, cy + 5, '#4af');
      label('tmin', cx - 106, cy - 55, '#facc15');

    } else if (cableType === C.YASSI_TTR) {
      const bw = 340, bh = 120;
      ctx.beginPath();
      ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 14);
      ctx.fillStyle = '#1a1a1a'; ctx.fill();
      ctx.strokeStyle = '#ddd'; ctx.lineWidth = 2.5; ctx.stroke();

      [cx - 106, cx, cx + 106].forEach((x, i) => {
        drawCircle(x, cy, 42, '#222', '#ddd', 2);
        drawCircle(x, cy, 22, '#333', '#aaa', 1.5);
        label(`t${i + 1}`, x - 10, cy - 50, '#facc15');
      });

      dashLine(cx - bw / 2 + 6, cy - bh / 2 + 6, cx + bw / 2 - 6, cy - bh / 2 + 6, '#4af');
      label('y2 (genişlik)', cx - 60, cy - bh / 2 + 20, '#4af');
      dashLine(cx - bw / 2 + 6, cy - bh / 2 + 6, cx - bw / 2 + 6, cy + bh / 2 - 6, '#4af');
      label('y1', cx - bw / 2 + 10, cy + 8, '#4af');

    } else if (cableType === C.SEKTOR) {
      drawRoundedTriangle(cx, cy + 10, 160, '#1e1e1e', '#bbb', 2.5);
      drawRoundedTriangle(cx, cy + 10, 110, '#333', '#43a047', 2);
      drawRoundedTriangle(cx, cy + 10, 50, '#555', '#eee', 1.5);
      label('tmin', cx + 60, cy + 30, '#facc15');
      cross(cx, cy + 10, '#4af', 'O2');
    }

    // bottom note
    ctx.font = '9px Segoe UI, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillText('EK_2 kesit diyagramı', 8, H - 6);
  }, [cableType, thumbnail]);

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      style={{
        borderRadius: thumbnail ? 4 : 6,
        display: 'block',
        maxWidth: '100%',
      }}
    />
  );
};
