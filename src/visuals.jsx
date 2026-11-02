import React from 'react';

export function PillarVisual({ variant }) {
  return <svg className={`pillar-visual visual-${variant}`} viewBox="0 0 320 170" aria-hidden="true">
    <defs><radialGradient id={`glow-${variant}`}><stop stopColor="#66d9ef" stopOpacity=".22"/><stop offset="1" stopColor="#66d9ef" stopOpacity="0"/></radialGradient></defs>
    <ellipse cx="160" cy="85" rx="145" ry="80" fill={`url(#glow-${variant})`} />
    {variant === 'risk' ? <g fill="none" stroke="#66d9ef"><ellipse cx="160" cy="85" rx="105" ry="54" opacity=".2"/><ellipse cx="160" cy="85" rx="67" ry="35" opacity=".5"/><path d="M55 85h210M160 31v108" opacity=".25"/><path d="M106 68l54 17 74-27M160 85l-21 45" opacity=".65"/><circle cx="160" cy="85" r="6" fill="#b5f3ff"/><circle className="signal-node" cx="106" cy="68" r="4" fill="#66d9ef"/><circle cx="234" cy="58" r="4" fill="#66d9ef"/><circle cx="139" cy="130" r="4" fill="#66d9ef"/></g> : variant === 'defense' ? <g fill="none" stroke="#66d9ef"><path d="M100 45l60-24 60 24v47c0 28-60 57-60 57s-60-29-60-57Z" opacity=".25"/><path d="M117 56l43-18 43 18v34c0 20-43 42-43 42s-43-22-43-42Z" opacity=".7"/><path className="check-path" d="m140 83 14 14 30-32" strokeWidth="3"/><path d="M50 80h42m136 0h42M64 96h27m139 0h26" opacity=".35"/></g> : <g stroke="#66d9ef" fill="none"><path d="M55 85h210" opacity=".35"/>{[70,160,250].map((x,i)=><g key={x}><rect x={x-25} y="60" width="50" height="50" rx="7" fill="#0b2030" opacity=".9"/><rect x={x-11} y="74" width="22" height="22" rx="3" opacity={i===1?1:.4}/></g>)}<circle className="flow-particle" cx="105" cy="85" r="3" fill="#c1f5ff"/><path d="M70 55V36h180v19" opacity=".25"/></g>}
  </svg>;
}
