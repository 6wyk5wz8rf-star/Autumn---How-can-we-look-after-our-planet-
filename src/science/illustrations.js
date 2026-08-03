import { escapeAttr, escapeHTML } from '../utils/dom.js';

const palette = {
  mammal: ['#766b5e', '#d8c8ae'], bird: ['#5c7180', '#c7d3d7'], fish: ['#4f7b86', '#b9d4d5'],
  reptile: ['#68785d', '#cbd0ae'], amphibian: ['#6e8064', '#cad5b7'], invertebrate: ['#806b59', '#d6c1a5'], plant: ['#5e765e', '#c6d1b7'],
};

function colours(organism) {
  return palette[organism.broadGroup] || palette[organism.kingdom] || palette.invertebrate;
}

const legs = (count, x = 50, y = 70, spread = 40) => Array.from({ length: Math.min(count, 14) }, (_, index) => {
  const side = index % 2 ? 1 : -1;
  const row = Math.floor(index / 2);
  const originX = x + side * (8 + row * (spread / Math.max(1, Math.ceil(count / 2))));
  return `<path d="M${originX} ${y - row * 2} l${side * 12} 16 l${side * 7} 1"/>`;
}).join('');

const insect = (kind, fill, pale) => {
  const wings = ['bee', 'ladybird', 'butterfly', 'dragonfly', 'grasshopper'].includes(kind)
    ? kind === 'butterfly'
      ? `<ellipse cx="38" cy="43" rx="24" ry="18" fill="${pale}"/><ellipse cx="82" cy="43" rx="24" ry="18" fill="${pale}"/>`
      : `<ellipse cx="47" cy="39" rx="18" ry="9" fill="${pale}" transform="rotate(-28 47 39)"/><ellipse cx="73" cy="39" rx="18" ry="9" fill="${pale}" transform="rotate(28 73 39)"/>`
    : '';
  const body = kind === 'stick-insect'
    ? `<path d="M60 22v68" stroke-width="8"/>${legs(6, 60, 72, 34)}`
    : `${wings}<ellipse cx="60" cy="61" rx="22" ry="13" fill="${fill}"/><circle cx="34" cy="61" r="10" fill="${fill}"/>${legs(6, 60, 66, 34)}<path d="M28 54q-12-15-18-4M30 54q-4-18 6-19"/>`;
  return body;
};

const arthropodMany = (kind, fill) => {
  if (kind === 'crab') return `<ellipse cx="60" cy="59" rx="29" ry="19" fill="${fill}"/>${legs(8, 60, 67, 43)}<path d="M35 48Q18 28 11 43M85 48q17-20 24-5"/><circle cx="50" cy="47" r="2"/><circle cx="70" cy="47" r="2"/>`;
  if (kind === 'prawn') return `<path d="M25 64q20-35 64-12q-8 25-43 29q-17-2-21-17z" fill="${fill}"/><path d="M86 52l24-17M86 54l27-5M42 77l-5 15M52 78l-2 16M63 75l4 15"/>`;
  if (kind === 'woodlouse') return `<ellipse cx="60" cy="59" rx="35" ry="22" fill="${fill}"/>${Array.from({length:7},(_,i)=>`<path d="M${36+i*8} 41v37" opacity=".55"/>`).join('')}${legs(14,60,73,42)}`;
  const pairs = kind === 'centipede' ? 10 : 12;
  return `<path d="M18 62q28-31 84 0q-28 31-84 0z" fill="${fill}"/>${Array.from({length:pairs},(_,i)=>`<path d="M${26+i*6} ${55+(i%2)*4}v${kind==='centipede'?25:19}"/><circle cx="${26+i*6}" cy="${61+(i%2)*3}" r="4" fill="none"/>`).join('')}`;
};

function drawing(key, fill, pale) {
  if (['fox', 'hedgehog'].includes(key)) return `<ellipse cx="60" cy="61" rx="35" ry="20" fill="${fill}"/><circle cx="92" cy="50" r="13" fill="${fill}"/><path d="M92 37l6-13l7 17M83 39l-2-14l10 11M29 59q-24-13-22 12q12 3 24-2"/>${legs(4,58,72,30)}${key==='hedgehog'?'<path d="M25 55l9-18l6 15l10-21l7 20l10-17l7 21"/>':''}`;
  if (key === 'bat') return `<path d="M60 48q-14-26-40-11q12 7 7 25q14-7 27 8l6 22l6-22q13-15 27-8q-5-18 7-25q-26-15-40 11z" fill="${fill}"/><circle cx="60" cy="43" r="9" fill="${fill}"/><path d="M55 35l-5-11l9 6M65 35l5-11l-9 6"/>`;
  if (key === 'elephant') return `<ellipse cx="56" cy="58" rx="37" ry="23" fill="${fill}"/><circle cx="89" cy="52" r="20" fill="${fill}"/><ellipse cx="80" cy="48" rx="16" ry="21" fill="${pale}"/><path d="M102 54q8 23-4 38" stroke-width="8"/>${legs(4,55,73,34)}<path d="M94 66q8 12 16 2"/>`;
  if (['dolphin', 'manatee'].includes(key)) return `<path d="M15 59q27-27 70-8l20-15l-5 18l12 9l-23 2q-43 25-74-6z" fill="${fill}"/><path d="M52 51l18-20l7 22M58 68l14 14"/><circle cx="79" cy="52" r="2.5" fill="#fff"/>`;
  if (['bird', 'duck', 'raptor', 'vulture'].includes(key)) return `<ellipse cx="57" cy="58" rx="30" ry="21" fill="${fill}"/><circle cx="85" cy="42" r="14" fill="${fill}"/><path d="M98 40l18 6l-18 4z" fill="${pale}"/><path d="M49 56q20-25 31 4q-18 14-31-4z" fill="${pale}"/><path d="M45 77l-5 18M65 78l4 17M35 95h13M64 95h14"/>`;
  if (key === 'penguin') return `<ellipse cx="60" cy="60" rx="25" ry="39" fill="${fill}"/><ellipse cx="60" cy="68" rx="15" ry="26" fill="${pale}"/><path d="M37 52L17 78M83 52l20 26M52 96l-12 8M68 96l12 8M61 27l19 7l-18 6z"/>`;
  if (key === 'ostrich') return `<ellipse cx="47" cy="68" rx="29" ry="20" fill="${fill}"/><path d="M69 60q12-37 5-52" stroke-width="8"/><circle cx="76" cy="10" r="9" fill="${fill}"/><path d="M75 83l-7 31M54 84l4 30M67 114h-13M58 114h14"/>`;
  if (['fish', 'clownfish', 'shark'].includes(key)) return `<path d="M15 59q28-31 69-10l25-18l-4 28l4 28l-25-18q-42 21-69-10z" fill="${fill}"/>${key==='shark'?'<path d="M58 44l12-24l10 29"/>':'<path d="M47 43q8 16 0 31M65 43q8 16 0 31" opacity=".55"/>'}<circle cx="32" cy="54" r="3" fill="#fff"/>`;
  if (key === 'eel') return `<path d="M8 66q28-46 58-9q26 31 47-4" stroke="${fill}" stroke-width="14" fill="none"/><circle cx="10" cy="64" r="3" fill="#fff"/>`;
  if (key === 'seahorse') return `<path d="M72 26q-29-10-30 16q1 15 17 14v24q-1 16-18 8q-12-8 1-17" stroke="${fill}" stroke-width="15" fill="none"/><path d="M67 21l18-7l-7 17M49 58l-24 9l24 8"/><circle cx="68" cy="31" r="2.5" fill="#fff"/>`;
  if (['turtle', 'tortoise'].includes(key)) return `<ellipse cx="59" cy="59" rx="35" ry="27" fill="${fill}"/><ellipse cx="59" cy="59" rx="27" ry="20" fill="${pale}"/><circle cx="101" cy="57" r="10" fill="${fill}"/><path d="M31 42l-18-12M31 76l-18 12M83 42l17-12M83 76l17 12"/>`;
  if (key === 'snake') return `<path d="M15 72q14-35 39-8q17 20 30-3q12-19 26-5" stroke="${fill}" stroke-width="16" fill="none"/><circle cx="108" cy="54" r="3" fill="#fff"/><path d="M114 58l10 3l-8 5"/>`;
  if (key === 'crocodile') return `<path d="M8 67l22-24h60l25 17l-28 12H31z" fill="${fill}"/><path d="M25 45l8-11l8 10l9-12l9 12l9-11l9 11M30 72l-10 20M50 72l-4 22M78 72l5 20M94 70l14 16"/><circle cx="95" cy="54" r="2.5" fill="#fff"/>`;
  if (key === 'lizard') return `<ellipse cx="60" cy="59" rx="25" ry="12" fill="${fill}"/><circle cx="88" cy="55" r="10" fill="${fill}"/><path d="M35 61Q11 71 8 86M48 68L30 90M73 68l14 22M77 50l17-20"/>`;
  if (['frog', 'toad', 'clawed-frog'].includes(key)) return `<ellipse cx="60" cy="62" rx="27" ry="21" fill="${fill}"/><circle cx="47" cy="43" r="10" fill="${fill}"/><circle cx="73" cy="43" r="10" fill="${fill}"/><circle cx="48" cy="41" r="2" fill="#fff"/><circle cx="72" cy="41" r="2" fill="#fff"/><path d="M42 72L18 92l25-6M78 72l24 20l-25-6M44 59q16 11 32 0"/>`;
  if (key === 'newt') return `<ellipse cx="58" cy="61" rx="25" ry="10" fill="${fill}"/><circle cx="86" cy="58" r="9" fill="${fill}"/><path d="M34 62Q9 49 7 73M48 53L31 37M48 70L31 85M70 52l14-17M70 70l17 14"/>`;
  if (['bee','ladybird','butterfly','dragonfly','grasshopper','ant','stick-insect'].includes(key)) return insect(key, fill, pale);
  if (key === 'spider') return `<ellipse cx="63" cy="61" rx="22" ry="18" fill="${fill}"/><circle cx="37" cy="61" r="12" fill="${fill}"/>${legs(8,60,67,42)}`;
  if (key === 'scorpion') return `<ellipse cx="54" cy="63" rx="24" ry="15" fill="${fill}"/>${legs(8,55,70,36)}<path d="M74 60q34-36 28-1q-2 15 10 12M33 57L16 40M35 67L16 82"/>`;
  if (key === 'harvestman') return `<circle cx="60" cy="59" r="12" fill="${fill}"/>${legs(8,60,63,70)}`;
  if (key === 'tick') return `<ellipse cx="60" cy="59" rx="18" ry="23" fill="${fill}"/>${legs(8,60,66,34)}`;
  if (key === 'snail') return `<path d="M15 75q22-6 35-3q10-34 42-20q17 8 5 29H38q-18 0-23-6z" fill="${fill}"/><circle cx="72" cy="61" r="18" fill="${pale}"/><path d="M72 61q0-10 10-5q8 8-4 14"/><path d="M25 69l-8-22M31 68l5-23"/>`;
  if (key === 'slug') return `<path d="M12 75q24-13 59-7q13-18 33-3q9 8-2 16H25q-10 0-13-6z" fill="${fill}"/><path d="M91 62l-5-20M98 62l7-18"/>`;
  if (key === 'octopus') return `<ellipse cx="60" cy="43" rx="24" ry="28" fill="${fill}"/>${Array.from({length:8},(_,i)=>`<path d="M${43+i*5} 62q${(i-3.5)*4} 23 ${((i%2)*2-1)*12} 33"/>`).join('')}<circle cx="52" cy="40" r="3" fill="#fff"/><circle cx="68" cy="40" r="3" fill="#fff"/>`;
  if (key === 'mussel') return `<path d="M60 20q47 33 22 76H38Q13 53 60 20z" fill="${fill}"/><path d="M60 25v67M45 37q-14 25-4 51M75 37q14 25 4 51"/>`;
  if (['earthworm','leech'].includes(key)) return `<path d="M12 68q24-40 51-7q23 29 45-8" stroke="${fill}" stroke-width="${key==='leech'?15:11}" fill="none"/>${Array.from({length:9},(_,i)=>`<path d="M${25+i*8} ${52+(i%2)*4}l3 15" opacity=".5"/>`).join('')}`;
  if (['crab','prawn','woodlouse','centipede','millipede'].includes(key)) return arthropodMany(key, fill);
  if (key === 'starfish') return `<path d="M60 13l12 31l34-4l-26 23l12 34l-32-20l-32 20l12-34l-26-23l34 4z" fill="${fill}"/>`;
  if (key === 'urchin') return `<circle cx="60" cy="60" r="27" fill="${fill}"/>${Array.from({length:18},(_,i)=>{const a=i*Math.PI/9;return `<path d="M${60+Math.cos(a)*25} ${60+Math.sin(a)*25}L${60+Math.cos(a)*47} ${60+Math.sin(a)*47}"/>`;}).join('')}`;
  if (key === 'oak') return `<path d="M55 48v58h15V48" fill="${fill}"/><path d="M62 58Q22 66 25 35Q33 8 58 27Q77 2 94 27Q111 59 72 64z" fill="${pale}"/>`;
  if (key === 'dandelion') return `<path d="M60 100V48M60 79L35 62M60 83l25-22"/><circle cx="60" cy="35" r="19" fill="${pale}"/>${Array.from({length:14},(_,i)=>{const a=i*Math.PI/7;return `<path d="M60 35l${Math.cos(a)*27} ${Math.sin(a)*27}"/>`;}).join('')}`;
  if (key === 'fern') return `<path d="M60 105Q52 62 69 14"/><path d="M59 84L29 62M61 77l33-23M59 64L34 43M63 54l28-26M61 44L46 25"/>`;
  if (key === 'moss') return Array.from({length:11},(_,i)=>`<path d="M${18+i*9} 98q${i%2?-6:6}-35 ${i%3?0:8}-60"/><circle cx="${18+i*9+(i%2?-6:6)}" cy="${38+(i%3?0:8)}" r="4" fill="${fill}"/>`).join('');
  if (key === 'mangrove') return `<path d="M58 48v29M70 47v31M58 72L35 108M61 73L53 108M70 73l9 35M72 72l24 36"/><path d="M62 58Q27 65 28 36Q38 10 59 29Q77 8 94 31Q102 60 68 62z" fill="${pale}"/>`;
  if (key === 'seagrass') return Array.from({length:12},(_,i)=>`<path d="M${18+i*8} 106q${i%2?-8:8}-43 ${i%3?-3:5}-82"/>`).join('');
  return `<circle cx="60" cy="60" r="34" fill="${fill}"/><path d="M38 60h44M60 38v44"/>`;
}

export function renderOrganismIllustration(organism, { hideName = false, compact = false } = {}) {
  if (!organism) return '';
  const [fill, pale] = colours(organism);
  const title = hideName ? 'Hidden organism diagram' : `${organism.commonName} diagram`;
  return `<figure class="organism-illustration ${compact ? 'organism-illustration--compact' : ''}" data-organism-illustration="${escapeAttr(organism.id)}">
    <svg viewBox="0 0 120 120" role="img" aria-labelledby="illustration-${escapeAttr(organism.id)}-title illustration-${escapeAttr(organism.id)}-desc">
      <title id="illustration-${escapeAttr(organism.id)}-title">${escapeHTML(title)}</title>
      <desc id="illustration-${escapeAttr(organism.id)}-desc">${escapeHTML(organism.imageRights.caution)}</desc>
      <circle cx="60" cy="60" r="56" fill="${pale}" opacity=".25"/>
      <g fill="none" stroke="#27353a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${drawing(organism.illustrationKey, fill, pale)}</g>
    </svg>
    ${compact ? '' : `<figcaption>${hideName ? '<span class="hidden-name">Name hidden</span>' : `<strong>${escapeHTML(organism.commonName)}</strong><em>${escapeHTML(organism.scientificName)}</em>`}<small>Original diagram · not to scale</small></figcaption>`}
  </figure>`;
}

export default renderOrganismIllustration;
