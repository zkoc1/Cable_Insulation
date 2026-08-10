import React, { useEffect, useRef } from 'react';
import type { CableTypeCategory } from '../../core/interfaces/cable';
import { CableTypeCategoryEnum as C } from '../../core/interfaces/cable';

interface Props {
  cableType: CableTypeCategory;
  width?: number;
  height?: number;
  /** When true, draws on white background (for icon thumbnails) */
  thumbnail?: boolean;
}

/**
 * Draws cable cross-section diagrams matching EK_2 illustrations.
 * Black background with light-gray/white layer outlines — same look as
 * the real microscope images shown in the specification document.
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

    // background
    ctx.fillStyle = thumbnail ? '#f0f0f0' : '#111';
    ctx.fillRect(0, 0, W, H);

    // helper: draw a filled circle with an outline
    const ring = (
      x: number, y: number, r: number,
      fill: string, stroke: string, lw = 2
    ) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lw;
      ctx.stroke();
    };

    // helper: dashed measurement line
    const dashLine = (
      x1: number, y1: number, x2: number, y2: number, color = '#facc15'
    ) => {
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    };

    // helper: small measurement label
    const label = (text: string, x: number, y: number, color = '#facc15') => {
      ctx.font = `bold ${thumbnail ? 8 : 11}px Segoe UI, sans-serif`;
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
    };

    // helper: 6 radial measurement lines at 60° intervals (EK_2 method)
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

    // center cross marker for O1/O2
    const cross = (x: number, y: number, color: string, lbl: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x, y + 6); ctx.stroke();
      label(lbl, x + 8, y - 4, color);
    };

    if (cableType === C.XLPE_HV) {
      // EK_2 Fig.3: outer (yellow) → dış yarı iletken (gray) → XLPE (dark) → iç yarı iletken (gray) → iletken (white)
      ring(cx, cy, 185, '#2a2a2a', '#e8c840', 3);   // dış sınır (sarı)
      ring(cx, cy, 168, '#444', '#ddd', 2);           // dış yarı iletken dış
      ring(cx, cy, 140, '#1a1a1a', '#bbb', 2);        // XLPE dış → yeşil
      ring(cx, cy, 90, '#333', '#6af', 2);             // iç yarı iletken → mavi
      ring(cx, cy, 70, '#222', '#f55', 2);             // iletken dış → kırmızı
      ring(cx + 5, cy - 4, 42, '#555', '#eee', 1.5);  // iletken (beyaz)

      radial6(cx, cy, 90, 140);  // XLPE 60° ölçüm çizgileri

      cross(cx, cy, '#e8c840', 'O1');
      cross(cx + 5, cy - 4, '#f55', 'O2');

      label('t_min_xlpe', cx + 92, cy + 5);
      label('t_max_xlpe', cx - 148, cy - 10);
      if (!thumbnail) {
        label('İç Yarı İletken', cx - 88, cy - 96, '#6af');
        label('XLPE İzolasyon', cx + 95, cy - 85);
        label('Dış Yarı İletken', cx - 172, cy + 60, '#ddd');
        label('eksen kaçıklığı', cx - 5, cy + 195, '#fff');
        dashLine(cx, cy, cx + 5, cy - 4, '#fff');
      }

    } else if (cableType === C.TESISAT_SINGLE_COLOR) {
      // EK_2 Fig.6: sarı-yeşil renkli tek damarlı
      // dış çember
      ring(cx, cy, 170, '#1a1a1a', '#bbb', 2.5);

      // sarı yarım (üst) + yeşil yarım (alt) — renk oranı gösterimi
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, 155, 0, Math.PI); ctx.closePath();
      ctx.fillStyle = 'rgba(200,170,0,0.55)'; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 155, Math.PI, Math.PI * 2); ctx.closePath();
      ctx.fillStyle = 'rgba(30,140,30,0.55)'; ctx.fill();
      ctx.restore();

      ring(cx, cy, 155, 'transparent', '#ddd', 1.8);
      ring(cx + 6, cy - 4, 80, '#222', '#f55', 2);   // iletken dış
      ring(cx + 6, cy - 4, 45, '#555', '#ddd', 1.5); // iletken iç

      radial6(cx, cy, 80, 155);

      cross(cx, cy, '#bbb', 'O1');
      cross(cx + 6, cy - 4, '#f55', 'O2');

      label('tmin', cx + 82, cy + 5);
      if (!thumbnail) {
        // y1/y2 yay gösterimi
        ctx.save();
        ctx.strokeStyle = '#4af'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(cx, cy, 162, 0, Math.PI * 0.5); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, 162, Math.PI, Math.PI * 1.5); ctx.stroke();
        ctx.restore();
        label('y1', cx + 140, cy - 100, '#4af');
        label('y2', cx - 155, cy + 120, '#4af');
        label('≥%30 renk oranı', cx - 60, cy + 180, '#fff');
      }

    } else if (cableType === C.TESISAT_MULTI_CORE) {
      // EK_2 Fig.12: 3 damarlı çok iletkenli
      ring(cx, cy, 170, '#1a1a1a', '#f55', 2.5);  // dış (kırmızı)
      ring(cx, cy, 150, '#222', '#44f', 2);         // iç grup (mavi)

      // 3 damar 120° aralıkla
      const cores: [number, number][] = [
        [cx, cy - 72],
        [cx - 62, cy + 36],
        [cx + 62, cy + 36],
      ];
      cores.forEach(([x, y], i) => {
        ring(x, y, 52, '#1a1a1a', '#ddd', 2);
        ring(x, y, 30, '#333', '#aaa', 1.5);
        label(`t${i + 1}`, x - 10, y - 58, '#facc15');
      });

      cross(cx, cy, '#44f', 'O2');
      cross(cx - 2, cy - 3, '#f55', 'O1');
      if (!thumbnail) label('eksen kaçıklığı = |O1-O2|', cx - 70, cy + 185, '#fff');

    } else if (cableType === C.TESISAT_NYAF_SOM) {
      // EK_2 Fig.14: tek damarlı çok telli / som
      ring(cx, cy, 168, '#1a1a1a', '#44f', 2.5);  // dış mavi
      ring(cx, cy, 148, '#111', '#ddd', 2);
      ring(cx + 5, cy - 4, 78, '#222', '#f55', 2); // iletken dış kırmızı

      // çok telli görünümü (küçük tel daireleri)
      for (let i = 0; i < 10; i++) {
        const a = (i * 36 * Math.PI) / 180;
        ring(cx + 5 + Math.cos(a) * 44, cy - 4 + Math.sin(a) * 44, 12, '#333', '#aaa', 1);
      }
      ring(cx + 5, cy - 4, 18, '#555', '#ddd', 1.2);

      radial6(cx, cy, 78, 148);
      cross(cx, cy, '#ddd', 'O1');
      cross(cx + 5, cy - 4, '#f55', 'O2');
      label('tmin', cx + 80, cy + 5);

    } else if (cableType === C.AER) {
      // EK_2 Fig.16: AER çıkıntılı kablo
      // 3 çıkıntı
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
        if (!thumbnail) label('Çb', px + 12, py + 4, '#facc15');
      }

      ring(cx, cy, 148, '#1a1a1a', '#e8c840', 2.5); // dış (sarı O1)
      ring(cx + 6, cy - 5, 80, '#222', 'orange', 2); // iletken (turuncu O2)
      ring(cx + 6, cy - 5, 44, '#444', '#ddd', 1.5);

      radial6(cx, cy, 80, 148);
      cross(cx, cy, '#e8c840', 'O1');
      cross(cx + 6, cy - 5, 'orange', 'O2');
      label('tmin', cx + 82, cy + 5);

    } else if (cableType === C.NYIF) {
      // EK_2 Fig.19: NYIF yassı 2 damarlı
      const bw = 300, bh = 130;
      ctx.beginPath();
      ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 20);
      ctx.fillStyle = '#1a1a1a';
      ctx.fill();
      ctx.strokeStyle = '#ddd'; ctx.lineWidth = 2.5; ctx.stroke();

      // sol ve sağ damar
      [cx - 82, cx + 82].forEach(x => {
        ring(x, cy, 46, '#111', 'orange', 2);  // damar dış (turuncu)
        ring(x, cy, 28, '#222', '#f55', 1.8);  // iletken (kırmızı)
        ring(x, cy, 14, '#555', '#ddd', 1);
      });

      // köprü boyutları
      if (!thumbnail) {
        dashLine(cx - 36, cy, cx + 36, cy, '#4af');
        label('y2 (köprü genişliği)', cx - 50, cy - 12, '#4af');
        dashLine(cx - bw / 2 + 8, cy - bh / 2 + 8, cx - bw / 2 + 8, cy + bh / 2 - 8, '#4af');
        label('y1', cx - bw / 2 + 12, cy + 5, '#4af');
        label('tmin', cx - 106, cy - 55, '#facc15');
      }

    } else if (cableType === C.YASSI_TTR) {
      // EK_2 Fig.22: Yassı TTR 3 damarlı
      const bw = 340, bh = 120;
      ctx.beginPath();
      ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 14);
      ctx.fillStyle = '#1a1a1a'; ctx.fill();
      ctx.strokeStyle = '#ddd'; ctx.lineWidth = 2.5; ctx.stroke();

      // 3 damar eşit aralıkla
      [cx - 106, cx, cx + 106].forEach((x, i) => {
        ring(x, cy, 42, '#222', '#ddd', 2);
        ring(x, cy, 22, '#333', '#aaa', 1.5);
        label(`t${i + 1}`, x - 10, cy - 50, '#facc15');
      });

      if (!thumbnail) {
        // y1/y2 boyut çizgileri
        dashLine(cx - bw / 2 + 6, cy - bh / 2 + 6, cx + bw / 2 - 6, cy - bh / 2 + 6, '#4af');
        label('y2 (genişlik)', cx - 60, cy - bh / 2 + 20, '#4af');
        dashLine(cx - bw / 2 + 6, cy - bh / 2 + 6, cx - bw / 2 + 6, cy + bh / 2 - 6, '#4af');
        label('y1', cx - bw / 2 + 10, cy + 8, '#4af');
      }

    } else if (cableType === C.SEKTOR) {
      // EK_2: sektör kesit — 3 eşit dilim
      const secAngle = (2 * Math.PI) / 3;
      for (let i = 0; i < 3; i++) {
        const startA = i * secAngle - secAngle / 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, 150, startA, startA + secAngle);
        ctx.closePath();
        ctx.fillStyle = '#1e1e1e';
        ctx.fill();
        ctx.strokeStyle = '#bbb'; ctx.lineWidth = 2; ctx.stroke();

        const mid = startA + secAngle / 2;
        ring(cx + Math.cos(mid) * 80, cy + Math.sin(mid) * 80, 32, '#333', '#aaa', 1.5);
        if (!thumbnail) label('tmin', cx + Math.cos(mid) * 115 - 14, cy + Math.sin(mid) * 115 + 4, '#facc15');
      }
      cross(cx, cy, '#4af', 'O2');
    }

    // bottom-right tiny note (skip on thumbnails)
    if (!thumbnail) {
      ctx.font = '9px Segoe UI, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillText('EK_2 kesit diyagramı', 8, H - 6);
    }
  }, [cableType, thumbnail]);

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      style={{
        borderRadius: thumbnail ? 4 : 6,
        border: `1px solid ${thumbnail ? '#ccc' : '#333'}`,
        display: 'block',
        maxWidth: '100%',
      }}
    />
  );
};
