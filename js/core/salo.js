// =========================================================
// MODULE: SALO — the CaloriePro mascot
// =========================================================
// Salo is a cute smiling carrot: orange gradient body with a glossy
// highlight, small rounded green leaves, two large friendly oval eyes,
// a warm smile, tiny rounded arms and legs. No clothes, no accessories,
// no nose, no eyebrows unless an expression needs them.
//
// This is the ONE place Salo's shape is defined. Every expression reuses
// the same body/leaf/limb geometry and only swaps eyes/mouth/arms, so Salo
// stays visually identical everywhere in the app. Never redraw Salo by
// hand elsewhere — call saloSVG()/saloEl().
//
// Usage:
//   saloSVG('happy', {size:96})                       -> SVG markup string
//   saloEl('celebrating', {size:64,className:'salo-bob'}) -> DOM node
//   saloSpeech('encouraging', 'You got this!')         -> mascot + bubble
//   saloCelebrate('Achievement unlocked!')             -> full-screen burst
//
// Animation classes (apply via opts.className, combine freely):
//   salo-bob        gentle floating loop
//   salo-breathe    slow subtle scale "breathing"
//   salo-bounce     one-shot spring-in (e.g. on unlock)
//   salo-pulse      loading pulse
//   salo-wave-arm   animates the raised arm in 'waving' back and forth
//   Eyes idle-blink automatically via CSS (.salo-eye), except where an
//   expression's eyes are already closed/special (sleepy, sleeping, loading).
// =========================================================

const SALO_EXPRESSIONS = [
  'happy','excited','celebrating','thinking','sleepy','sleeping','concerned',
  'gentlesad','waving','running','encouraging','surprised','thumbsup','heart','loading'
];

let _saloIdSeq = 0;

function _saloEyes(expr){
  const L={cx:78,cy:118}, R={cx:122,cy:118};
  const ry=20, rx=16;
  const eyeCls='salo-eye';

  if(expr==='sleepy'||expr==='sleeping'){
    return `
      <path class="${eyeCls}" d="M64,118 Q78,128 92,118" stroke="#20303B" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path class="${eyeCls}" d="M108,118 Q122,128 136,118" stroke="#20303B" stroke-width="5" stroke-linecap="round" fill="none"/>
      ${expr==='sleeping'?'<text x="140" y="70" font-size="22" font-weight="700" fill="#8891A6" font-family="sans-serif">z</text><text x="152" y="52" font-size="16" font-weight="700" fill="#8891A6" font-family="sans-serif">z</text>':''}`;
  }
  if(expr==='loading'){
    return `
      <path class="${eyeCls}" d="M64,118 Q78,122 92,118" stroke="#20303B" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path class="${eyeCls}" d="M108,118 Q122,122 136,118" stroke="#20303B" stroke-width="5" stroke-linecap="round" fill="none"/>`;
  }

  let pupilOffX=0, pupilOffY=0, pupilR=7, eyeRx=rx, eyeRy=ry;
  if(expr==='excited'||expr==='celebrating'||expr==='surprised'){ pupilR=8; pupilOffY=-1; }
  if(expr==='surprised'){ eyeRx=18; eyeRy=23; pupilR=7.5; }
  if(expr==='concerned'||expr==='gentlesad'){ pupilOffY=2; pupilR=6.5; }
  if(expr==='thinking'){ pupilOffX=3; pupilOffY=-2; }
  if(expr==='running'){ pupilOffX=4; pupilR=7; }

  const brows = (expr==='concerned')
    ? `<path d="M66,98 Q78,92 90,98" stroke="#20303B" stroke-width="4" stroke-linecap="round" fill="none"/>
       <path d="M110,98 Q122,92 134,98" stroke="#20303B" stroke-width="4" stroke-linecap="round" fill="none"/>`
    : (expr==='gentlesad')
    ? `<path d="M66,100 Q78,95 90,100" stroke="#20303B" stroke-width="4" stroke-linecap="round" fill="none" opacity=".8"/>
       <path d="M110,100 Q122,95 134,100" stroke="#20303B" stroke-width="4" stroke-linecap="round" fill="none" opacity=".8"/>`
    : (expr==='thinking')
    ? `<path d="M66,96 Q78,92 90,96" stroke="#20303B" stroke-width="4" stroke-linecap="round" fill="none"/>`
    : (expr==='surprised')
    ? `<path d="M64,92 Q78,84 92,92" stroke="#20303B" stroke-width="4" stroke-linecap="round" fill="none"/>
       <path d="M108,92 Q122,84 136,92" stroke="#20303B" stroke-width="4" stroke-linecap="round" fill="none"/>`
    : '';

  const tearDrop = expr==='gentlesad'
    ? `<path d="M64,132 Q60,142 64,148 Q68,142 64,132 Z" fill="#8FCBFF" opacity=".85"/>`
    : '';

  return `
    ${brows}
    <ellipse class="${eyeCls}" cx="${L.cx}" cy="${L.cy}" rx="${eyeRx}" ry="${eyeRy}" fill="#20303B"/>
    <ellipse class="${eyeCls}" cx="${R.cx}" cy="${R.cy}" rx="${eyeRx}" ry="${eyeRy}" fill="#20303B"/>
    <circle cx="${L.cx+pupilOffX}" cy="${L.cy+pupilOffY}" r="${pupilR}" fill="#0B1015"/>
    <circle cx="${R.cx+pupilOffX}" cy="${R.cy+pupilOffY}" r="${pupilR}" fill="#0B1015"/>
    <circle cx="${L.cx+pupilOffX-3}" cy="${L.cy+pupilOffY-4}" r="2.4" fill="#fff" opacity=".9"/>
    <circle cx="${R.cx+pupilOffX-3}" cy="${R.cy+pupilOffY-4}" r="2.4" fill="#fff" opacity=".9"/>
    ${tearDrop}`;
}

function _saloMouth(expr){
  const cls='salo-mouth';
  switch(expr){
    case 'excited':
    case 'celebrating':
    case 'thumbsup':
    case 'heart':
      return `<path class="${cls}" d="M76,150 Q100,176 124,150 Q100,168 76,150 Z" fill="#20303B"/>
              <path d="M84,156 Q100,166 116,156" fill="#F97364" opacity=".8"/>`;
    case 'concerned':
      return `<path class="${cls}" d="M80,160 Q100,148 120,160" stroke="#20303B" stroke-width="5" stroke-linecap="round" fill="none"/>`;
    case 'gentlesad':
      return `<path class="${cls}" d="M78,158 Q100,146 122,158" stroke="#20303B" stroke-width="5" stroke-linecap="round" fill="none"/>`;
    case 'sleepy':
    case 'sleeping':
      return `<ellipse class="${cls}" cx="100" cy="152" rx="7" ry="5" fill="#20303B"/>`;
    case 'thinking':
      return `<path class="${cls}" d="M84,153 Q104,160 118,150" stroke="#20303B" stroke-width="5" stroke-linecap="round" fill="none"/>`;
    case 'surprised':
      return `<ellipse class="${cls}" cx="100" cy="153" rx="10" ry="12" fill="#20303B"/>`;
    case 'loading':
      return `<circle class="${cls}" cx="100" cy="152" r="6" fill="#20303B"/>`;
    case 'running':
    case 'encouraging':
    case 'waving':
    case 'happy':
    default:
      return `<path class="${cls}" d="M78,148 Q100,170 122,148" stroke="#20303B" stroke-width="6" stroke-linecap="round" fill="none"/>`;
  }
}

function _saloArms(expr, uid){
  const grad = `url(#saloBodyGrad-${uid})`;
  const leftDefault  = `<ellipse cx="42" cy="150" rx="11" ry="17" fill="${grad}" transform="rotate(18 42 150)"/>`;
  const rightDefault = `<ellipse cx="158" cy="150" rx="11" ry="17" fill="${grad}" transform="rotate(-18 158 150)"/>`;
  const leftUp  = `<ellipse cx="46" cy="112" rx="11" ry="17" fill="${grad}" transform="rotate(55 46 112)"/>`;
  const rightUp = `<ellipse class="salo-wave-arm" cx="154" cy="112" rx="11" ry="17" fill="${grad}" transform="rotate(-55 154 112)"/>`;
  // Bent arm curled toward the body, used for thumbs-up/heart gestures.
  const rightBent = `<ellipse cx="150" cy="130" rx="11" ry="16" fill="${grad}" transform="rotate(-35 150 130)"/>`;
  const leftBent  = `<ellipse cx="50" cy="130" rx="11" ry="16" fill="${grad}" transform="rotate(35 50 130)"/>`;

  if(expr==='waving') return leftDefault + rightUp;
  if(expr==='celebrating'||expr==='excited') return leftUp + rightUp;
  if(expr==='running') return leftBent + rightUp.replace('salo-wave-arm ','');
  if(expr==='thumbsup') return leftDefault +
    `<ellipse cx="150" cy="122" rx="11" ry="16" fill="${grad}" transform="rotate(-25 150 122)"/>
     <circle cx="163" cy="104" r="9" fill="${grad}"/>`;
  if(expr==='heart') return leftBent + rightBent;
  return leftDefault + rightDefault;
}

/**
 * Returns raw SVG markup for Salo with the given expression.
 * @param {string} expression one of SALO_EXPRESSIONS (defaults to 'happy')
 * @param {object} opts {size:number}
 */
function saloSVG(expression, opts){
  opts = opts || {};
  const expr = SALO_EXPRESSIONS.includes(expression) ? expression : 'happy';
  const size = opts.size || 96;
  const uid = 'u' + (_saloIdSeq++);

  const heartDeco = expr==='heart'
    ? `<path d="M100,26 C96,16 82,16 82,30 C82,40 100,52 100,52 C100,52 118,40 118,30 C118,16 104,16 100,26 Z" fill="#FF5C7A" opacity=".95"/>`
    : '';
  const sparkles = expr==='celebrating'
    ? `<g class="salo-sparkle" opacity=".9">
         <path d="M28,60 l3,8 8,3 -8,3 -3,8 -3,-8 -8,-3 8,-3 Z" fill="#F4C15C"/>
         <path d="M170,90 l2.5,7 7,2.5 -7,2.5 -2.5,7 -2.5,-7 -7,-2.5 7,-2.5 Z" fill="#FF7C3A"/>
         <path d="M162,40 l2,5.5 5.5,2 -5.5,2 -2,5.5 -2,-5.5 -5.5,-2 5.5,-2 Z" fill="#5FE0A0"/>
       </g>`
    : '';

  return `
<svg width="${size}" height="${Math.round(size*1.1)}" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Salo the carrot mascot">
  <defs>
    <linearGradient id="saloBodyGrad-${uid}" x1="30%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#FFC15C"/>
      <stop offset="55%" stop-color="#FF9F3D"/>
      <stop offset="100%" stop-color="#F2762E"/>
    </linearGradient>
    <linearGradient id="saloLeafGrad-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8DE28A"/>
      <stop offset="100%" stop-color="#4CAF50"/>
    </linearGradient>
  </defs>

  ${sparkles}
  ${_saloArms(expr, uid)}

  <!-- legs -->
  <ellipse cx="82" cy="206" rx="10" ry="9" fill="url(#saloBodyGrad-${uid})"/>
  <ellipse cx="118" cy="206" rx="10" ry="9" fill="url(#saloBodyGrad-${uid})"/>

  <!-- leaves -->
  <g>
    <path d="M100,58 C94,38 96,18 100,4 C104,18 106,38 100,58 Z" fill="url(#saloLeafGrad-${uid})"/>
    <path d="M100,58 C82,44 66,32 52,22 C64,32 82,42 100,58 Z" fill="url(#saloLeafGrad-${uid})"/>
    <path d="M100,58 C118,44 134,32 148,22 C136,32 118,42 100,58 Z" fill="url(#saloLeafGrad-${uid})"/>
  </g>

  <!-- body -->
  <path d="M100,56 C140,56 158,86 154,122 C150,160 132,192 110,206 C104,210 96,210 90,206
           C68,192 50,160 46,122 C42,86 60,56 100,56 Z" fill="url(#saloBodyGrad-${uid})"/>

  <!-- glossy highlight -->
  <ellipse cx="76" cy="92" rx="20" ry="30" fill="#FFFFFF" opacity=".28" transform="rotate(-18 76 92)"/>

  ${_saloEyes(expr)}
  ${_saloMouth(expr)}
  ${heartDeco}
</svg>`;
}

/**
 * Returns a DOM element wrapping Salo's SVG (safe: no interpolated user
 * data ever reaches innerHTML here — only the fixed markup above).
 * @param {string} expression
 * @param {object} opts {size:number, className:string}
 */
function saloEl(expression, opts){
  opts = opts || {};
  const wrap = document.createElement('div');
  wrap.className = 'salo' + (opts.className ? ' '+opts.className : '');
  wrap.innerHTML = saloSVG(expression, opts);
  return wrap;
}

/**
 * Brief, non-blocking full-screen Salo celebration burst — used when an
 * achievement unlocks. Auto-removes itself; safe to call rapidly.
 */
function saloCelebrate(title){
  const overlay=el('div',{class:'salo-celebrate',role:'status','aria-live':'polite'},
    saloEl('celebrating',{size:120,className:'salo-bounce'}),
    title?el('div',{class:'salo-celebrate-t'},title):null
  );
  document.body.appendChild(overlay);
  setTimeout(()=>{ overlay.classList.add('out'); }, 1400);
  setTimeout(()=>{ overlay.remove(); }, 1750);
}

/** Small helper: Salo + a speech-bubble line, for empty states / tips. */
function saloSpeech(expression, text, opts){
  opts = opts || {};
  const row = el('div',{class:'salo-speech'},
    saloEl(expression, {size:opts.size||64, className:'salo-bob'}),
    el('div',{class:'salo-bubble'}, text)
  );
  return row;
}
