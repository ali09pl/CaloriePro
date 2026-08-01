/**
 * SaloMascot.jsx — portable React reference implementation of Salo.
 *
 * NOTE ON WHY THIS ISN'T WIRED INTO THE APP:
 * CaloriePro ships as static HTML/CSS/vanilla-JS with zero build step
 * (deployed directly to Vercel as static files — see /js/core/salo.js,
 * which every page actually uses). Introducing React here would mean
 * adding a bundler, a build pipeline, and a completely different runtime
 * model — a large architectural change, not a mascot change. That would
 * be a regression in simplicity for no functional benefit today.
 *
 * This file exists so a React port (or a future marketing site, admin
 * dashboard rewrite, etc.) can drop Salo in with zero redesign work. The
 * geometry, colors, and expression logic are an exact match for
 * js/core/salo.js — if you change one, change the other.
 */
import React, { useId } from 'react';

const EXPRESSIONS = ['happy','excited','celebrating','thinking','sleepy','concerned','waving','loading'];

function Eyes({ expr }){
  const L = { cx: 78, cy: 118 }, R = { cx: 122, cy: 118 };
  const rx = 16, ry = 20;

  if (expr === 'sleepy' || expr === 'loading') {
    const midY = expr === 'sleepy' ? 128 : 122;
    return (
      <>
        <path d={`M64,118 Q78,${midY} 92,118`} stroke="#20303B" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d={`M108,118 Q122,${midY} 136,118`} stroke="#20303B" strokeWidth="5" strokeLinecap="round" fill="none" />
      </>
    );
  }

  let pupilOffX = 0, pupilOffY = 0, pupilR = 7;
  if (expr === 'excited' || expr === 'celebrating') { pupilR = 8; pupilOffY = -1; }
  if (expr === 'concerned') { pupilOffY = 2; pupilR = 6.5; }
  if (expr === 'thinking') { pupilOffX = 3; pupilOffY = -2; }

  return (
    <>
      {expr === 'concerned' && (
        <>
          <path d="M66,98 Q78,92 90,98" stroke="#20303B" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M110,98 Q122,92 134,98" stroke="#20303B" strokeWidth="4" strokeLinecap="round" fill="none" />
        </>
      )}
      {expr === 'thinking' && (
        <path d="M66,96 Q78,92 90,96" stroke="#20303B" strokeWidth="4" strokeLinecap="round" fill="none" />
      )}
      <ellipse cx={L.cx} cy={L.cy} rx={rx} ry={ry} fill="#20303B" />
      <ellipse cx={R.cx} cy={R.cy} rx={rx} ry={ry} fill="#20303B" />
      <circle cx={L.cx + pupilOffX} cy={L.cy + pupilOffY} r={pupilR} fill="#0B1015" />
      <circle cx={R.cx + pupilOffX} cy={R.cy + pupilOffY} r={pupilR} fill="#0B1015" />
      <circle cx={L.cx + pupilOffX - 3} cy={L.cy + pupilOffY - 4} r={2.4} fill="#fff" opacity=".9" />
      <circle cx={R.cx + pupilOffX - 3} cy={R.cy + pupilOffY - 4} r={2.4} fill="#fff" opacity=".9" />
    </>
  );
}

function Mouth({ expr }){
  switch (expr) {
    case 'excited':
    case 'celebrating':
      return (
        <>
          <path d="M76,150 Q100,176 124,150 Q100,168 76,150 Z" fill="#20303B" />
          <path d="M84,156 Q100,166 116,156" fill="#F97364" opacity=".8" />
        </>
      );
    case 'concerned':
      return <path d="M80,160 Q100,148 120,160" stroke="#20303B" strokeWidth="5" strokeLinecap="round" fill="none" />;
    case 'sleepy':
      return <ellipse cx="100" cy="152" rx="7" ry="5" fill="#20303B" />;
    case 'thinking':
      return <path d="M84,153 Q104,160 118,150" stroke="#20303B" strokeWidth="5" strokeLinecap="round" fill="none" />;
    case 'loading':
      return <circle cx="100" cy="152" r="6" fill="#20303B" />;
    default: // happy / waving
      return <path d="M78,148 Q100,170 122,148" stroke="#20303B" strokeWidth="6" strokeLinecap="round" fill="none" />;
  }
}

function Arms({ expr, gradId }){
  const grad = `url(#${gradId})`;
  const leftDefault  = <ellipse cx="42" cy="150" rx="11" ry="17" fill={grad} transform="rotate(18 42 150)" />;
  const rightDefault = <ellipse cx="158" cy="150" rx="11" ry="17" fill={grad} transform="rotate(-18 158 150)" />;
  const leftUp  = <ellipse cx="46" cy="112" rx="11" ry="17" fill={grad} transform="rotate(55 46 112)" />;
  const rightUp = <ellipse cx="154" cy="112" rx="11" ry="17" fill={grad} transform="rotate(-55 154 112)" />;

  if (expr === 'waving') return <>{leftDefault}{rightUp}</>;
  if (expr === 'celebrating' || expr === 'excited') return <>{leftUp}{rightUp}</>;
  return <>{leftDefault}{rightDefault}</>;
}

/**
 * <SaloMascot expression="happy" size={96} className="salo-bob" />
 */
export default function SaloMascot({ expression = 'happy', size = 96, className = '' }){
  const expr = EXPRESSIONS.includes(expression) ? expression : 'happy';
  const rawId = useId();
  const uid = rawId.replace(/[:]/g, '');
  const bodyGradId = `saloBodyGrad-${uid}`;
  const leafGradId = `saloLeafGrad-${uid}`;

  return (
    <div className={`salo ${className}`}>
      <svg
        width={size}
        height={Math.round(size * 1.1)}
        viewBox="0 0 200 220"
        role="img"
        aria-label="Salo the carrot mascot"
      >
        <defs>
          <linearGradient id={bodyGradId} x1="30%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#FFC15C" />
            <stop offset="55%" stopColor="#FF9F3D" />
            <stop offset="100%" stopColor="#F2762E" />
          </linearGradient>
          <linearGradient id={leafGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8DE28A" />
            <stop offset="100%" stopColor="#4CAF50" />
          </linearGradient>
        </defs>

        <Arms expr={expr} gradId={bodyGradId} />

        {/* legs */}
        <ellipse cx="82" cy="206" rx="10" ry="9" fill={`url(#${bodyGradId})`} />
        <ellipse cx="118" cy="206" rx="10" ry="9" fill={`url(#${bodyGradId})`} />

        {/* leaves */}
        <g>
          <path d="M100,58 C94,38 96,18 100,4 C104,18 106,38 100,58 Z" fill={`url(#${leafGradId})`} />
          <path d="M100,58 C82,44 66,32 52,22 C64,32 82,42 100,58 Z" fill={`url(#${leafGradId})`} />
          <path d="M100,58 C118,44 134,32 148,22 C136,32 118,42 100,58 Z" fill={`url(#${leafGradId})`} />
        </g>

        {/* body */}
        <path
          d="M100,56 C140,56 158,86 154,122 C150,160 132,192 110,206 C104,210 96,210 90,206
             C68,192 50,160 46,122 C42,86 60,56 100,56 Z"
          fill={`url(#${bodyGradId})`}
        />

        {/* glossy highlight */}
        <ellipse cx="76" cy="92" rx="20" ry="30" fill="#FFFFFF" opacity=".28" transform="rotate(-18 76 92)" />

        <Eyes expr={expr} />
        <Mouth expr={expr} />
      </svg>
    </div>
  );
}
