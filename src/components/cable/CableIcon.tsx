/* SVG cross-section icons for cable type selector */
import React from 'react';
import type { CableTypeCategory } from '../../core/interfaces/cable';
import { CableTypeCategoryEnum } from '../../core/interfaces/cable';

/* Each icon returns a small SVG showing the cable cross-section silhouette */
const icons: Partial<Record<CableTypeCategory, React.ReactElement>> = {
  [CableTypeCategoryEnum.XLPE_HV]: (
    <svg viewBox="0 0 60 60" width="48" height="48">
      <circle cx="30" cy="30" r="28" fill="#1a1a24" stroke="#4ade80" strokeWidth="2"/>
      <circle cx="30" cy="30" r="20" fill="#052e16" stroke="#22c55e" strokeWidth="1.5"/>
      <circle cx="30" cy="30" r="12" fill="#1e293b" stroke="#3b82f6" strokeWidth="1"/>
      <circle cx="31" cy="29" r="7" fill="#ef4444"/>
    </svg>
  ),
  [CableTypeCategoryEnum.TESISAT_SINGLE_COLOR]: (
    <svg viewBox="0 0 60 60" width="48" height="48">
      <circle cx="30" cy="30" r="27" fill="#1a1a24" stroke="#facc15" strokeWidth="2"/>
      <circle cx="30" cy="30" r="15" fill="#713f12" stroke="#eab308" strokeWidth="1.5"/>
      <circle cx="30" cy="30" r="8" fill="#a16207"/>
    </svg>
  ),
  [CableTypeCategoryEnum.TESISAT_MULTI_CORE]: (
    <svg viewBox="0 0 60 60" width="48" height="48">
      <circle cx="30" cy="30" r="27" fill="#1a1a24" stroke="#38bdf8" strokeWidth="2"/>
      <circle cx="21" cy="25" r="8" fill="#1e3a5f" stroke="#38bdf8" strokeWidth="1.2"/>
      <circle cx="39" cy="25" r="8" fill="#1e3a5f" stroke="#38bdf8" strokeWidth="1.2"/>
      <circle cx="30" cy="38" r="8" fill="#1e3a5f" stroke="#38bdf8" strokeWidth="1.2"/>
      <circle cx="21" cy="25" r="4" fill="#38bdf8"/>
      <circle cx="39" cy="25" r="4" fill="#38bdf8"/>
      <circle cx="30" cy="38" r="4" fill="#38bdf8"/>
    </svg>
  ),
  [CableTypeCategoryEnum.TESISAT_NYAF_SOM]: (
    <svg viewBox="0 0 60 60" width="48" height="48">
      <circle cx="30" cy="30" r="27" fill="#1a1a24" stroke="#a78bfa" strokeWidth="2"/>
      <circle cx="30" cy="30" r="16" fill="#2e1065" stroke="#7c3aed" strokeWidth="1.5"/>
      <circle cx="30" cy="30" r="8" fill="#7c3aed"/>
    </svg>
  ),
  [CableTypeCategoryEnum.AER]: (
    <svg viewBox="0 0 60 60" width="48" height="48">
      <circle cx="30" cy="30" r="22" fill="#1a1a24" stroke="#fb923c" strokeWidth="2"/>
      {/* ridge protrusions */}
      {[0,60,120,180,240,300].map(a => (
        <rect key={a} x="28" y="2" width="4" height="8" rx="2" fill="#fb923c"
          transform={`rotate(${a} 30 30)`}/>
      ))}
      <circle cx="30" cy="30" r="12" fill="#431407" stroke="#ea580c" strokeWidth="1.2"/>
      <circle cx="30" cy="30" r="6" fill="#c2410c"/>
    </svg>
  ),
  [CableTypeCategoryEnum.NYIF]: (
    <svg viewBox="0 0 70 40" width="56" height="32">
      <rect x="2" y="4" width="66" height="32" rx="8" fill="#1a1a24" stroke="#34d399" strokeWidth="2"/>
      <circle cx="22" cy="20" r="10" fill="#052e16" stroke="#22c55e" strokeWidth="1.5"/>
      <circle cx="22" cy="20" r="5" fill="#22c55e"/>
      <circle cx="48" cy="20" r="10" fill="#052e16" stroke="#22c55e" strokeWidth="1.5"/>
      <circle cx="48" cy="20" r="5" fill="#22c55e"/>
    </svg>
  ),
  [CableTypeCategoryEnum.YASSI_TTR]: (
    <svg viewBox="0 0 80 35" width="64" height="28">
      <rect x="2" y="2" width="76" height="31" rx="6" fill="#1a1a24" stroke="#e879f9" strokeWidth="2"/>
      <circle cx="18" cy="17" r="8" fill="#2d0a3e" stroke="#a855f7" strokeWidth="1.5"/>
      <circle cx="18" cy="17" r="4" fill="#a855f7"/>
      <circle cx="40" cy="17" r="8" fill="#2d0a3e" stroke="#a855f7" strokeWidth="1.5"/>
      <circle cx="40" cy="17" r="4" fill="#a855f7"/>
      <circle cx="62" cy="17" r="8" fill="#2d0a3e" stroke="#a855f7" strokeWidth="1.5"/>
      <circle cx="62" cy="17" r="4" fill="#a855f7"/>
    </svg>
  ),
  [CableTypeCategoryEnum.SEKTOR]: (
    <svg viewBox="0 0 60 60" width="48" height="48">
      <path d="M30 30 L30 5 A25 25 0 0 1 52 42 Z" fill="#052e16" stroke="#4ade80" strokeWidth="2"/>
      <path d="M30 30 L52 42 A25 25 0 0 1 8 42 Z" fill="#052e16" stroke="#4ade80" strokeWidth="2"/>
      <path d="M30 30 L8 42 A25 25 0 0 1 30 5 Z" fill="#052e16" stroke="#4ade80" strokeWidth="2"/>
      <circle cx="30" cy="30" r="10" fill="#0f766e" stroke="#2dd4bf" strokeWidth="1.5"/>
      <circle cx="30" cy="30" r="5" fill="#2dd4bf"/>
    </svg>
  ),
};

interface Props { type: CableTypeCategory; size?: number; }

export const CableIcon: React.FC<Props> = ({ type }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
    {icons[type]}
  </div>
);
