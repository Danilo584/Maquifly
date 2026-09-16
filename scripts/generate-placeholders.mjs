/**
 * Genera las ilustraciones de marcador de posición de cada categoría.
 *
 * Por qué existen: MaquiFly no usa fotografías de stock que parezcan fotos
 * reales de una máquina disponible. Mientras un propietario no suba sus
 * propias fotos, la publicación muestra una ilustración vectorial explícita,
 * marcada como referencial. Son SVG: pesan poco y escalan sin perder nitidez.
 *
 *   node scripts/generate-placeholders.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "placeholders");

const INK = "#071628";
const INK_SOFT = "#0c1f38";
const INK_DEEP = "#040e1b";
const VOLT = "#c8f83c";
const LINE = "#7ba0cd";
const WHITE = "#eef3fa";

/** Silueta simplificada por tipo de equipo. viewBox lógico: 200 × 150. */
const shapes = {
  "skid-steer": () => `
    <g>
      <path d="M68 74 L44 92 L26 92 L26 106 L48 106 L72 88 Z" fill="${VOLT}" opacity="0.9"/>
      <rect x="70" y="70" width="60" height="34" rx="5" fill="${LINE}" opacity="0.35"/>
      <rect x="70" y="70" width="60" height="34" rx="5" fill="none" stroke="${WHITE}" stroke-width="2.5"/>
      <path d="M86 70 L86 50 L120 50 L124 70 Z" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="84" cy="108" r="14" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
      <circle cx="122" cy="108" r="14" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
      <circle cx="84" cy="108" r="5" fill="${VOLT}"/>
      <circle cx="122" cy="108" r="5" fill="${VOLT}"/>
    </g>`,
  excavator: () => `
    <g>
      <path d="M126 84 L158 52" stroke="${WHITE}" stroke-width="7" stroke-linecap="round"/>
      <path d="M158 52 L170 88" stroke="${WHITE}" stroke-width="6" stroke-linecap="round"/>
      <path d="M164 88 L182 86 L180 104 L162 100 Z" fill="${VOLT}"/>
      <rect x="72" y="72" width="58" height="32" rx="5" fill="${LINE}" opacity="0.35"/>
      <rect x="72" y="72" width="58" height="32" rx="5" fill="none" stroke="${WHITE}" stroke-width="2.5"/>
      <path d="M76 72 L76 52 L104 52 L106 72 Z" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="56" y="106" width="92" height="20" rx="10" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
      <circle cx="70" cy="116" r="4" fill="${VOLT}"/><circle cx="90" cy="116" r="4" fill="${LINE}"/>
      <circle cx="110" cy="116" r="4" fill="${LINE}"/><circle cx="132" cy="116" r="4" fill="${VOLT}"/>
    </g>`,
  backhoe: () => `
    <g>
      <path d="M132 76 L158 56 L172 84" stroke="${WHITE}" stroke-width="6" stroke-linecap="round" fill="none"/>
      <path d="M166 84 L184 82 L182 100 L164 96 Z" fill="${VOLT}"/>
      <rect x="74" y="72" width="58" height="26" rx="4" fill="${LINE}" opacity="0.35" stroke="${WHITE}" stroke-width="2.5"/>
      <path d="M80 72 L82 50 L116 50 L118 72 Z" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M74 80 L46 94 L28 94 L28 108 L50 108 L76 94 Z" fill="${VOLT}" opacity="0.9"/>
      <circle cx="62" cy="106" r="12" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
      <circle cx="122" cy="102" r="20" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
      <circle cx="122" cy="102" r="7" fill="${VOLT}"/>
    </g>`,
  loader: () => `
    <g>
      <path d="M62 78 L34 96 L16 96 L16 112 L40 112 L66 96 Z" fill="${VOLT}" opacity="0.9"/>
      <rect x="64" y="66" width="76" height="36" rx="6" fill="${LINE}" opacity="0.35" stroke="${WHITE}" stroke-width="2.5"/>
      <path d="M96 66 L98 44 L132 44 L136 66 Z" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="82" cy="106" r="18" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
      <circle cx="128" cy="106" r="18" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
      <circle cx="82" cy="106" r="6" fill="${VOLT}"/><circle cx="128" cy="106" r="6" fill="${VOLT}"/>
    </g>`,
  "dump-truck": () => `
    <g>
      <path d="M92 76 L176 62 L180 96 L92 96 Z" fill="${LINE}" opacity="0.35" stroke="${WHITE}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M100 82 L168 72" stroke="${VOLT}" stroke-width="3"/>
      <path d="M40 96 L40 66 L72 66 L86 84 L86 96 Z" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="48" y="72" width="22" height="14" rx="2" fill="${VOLT}" opacity="0.85"/>
      <rect x="38" y="96" width="144" height="8" rx="4" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2"/>
      <circle cx="58" cy="110" r="12" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
      <circle cx="132" cy="110" r="12" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
      <circle cx="158" cy="110" r="12" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
    </g>`,
  roller: () => `
    <g>
      <rect x="74" y="60" width="62" height="30" rx="5" fill="${LINE}" opacity="0.35" stroke="${WHITE}" stroke-width="2.5"/>
      <path d="M90 60 L92 40 L124 40 L126 60 Z" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="26" y="84" width="52" height="38" rx="19" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
      <path d="M38 88 L38 118 M52 86 L52 120 M66 88 L66 118" stroke="${VOLT}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="126" cy="106" r="16" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
      <circle cx="126" cy="106" r="5" fill="${VOLT}"/>
      <path d="M78 90 L100 90 L100 102 L78 102 Z" fill="${LINE}" opacity="0.35" stroke="${WHITE}" stroke-width="2"/>
    </g>`,
  grader: () => `
    <g>
      <path d="M28 96 L172 96" stroke="${WHITE}" stroke-width="4" stroke-linecap="round"/>
      <rect x="112" y="60" width="52" height="30" rx="5" fill="${LINE}" opacity="0.35" stroke="${WHITE}" stroke-width="2.5"/>
      <path d="M122 60 L124 40 L152 40 L154 60 Z" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M58 92 L104 100" stroke="${VOLT}" stroke-width="7" stroke-linecap="round"/>
      <circle cx="36" cy="106" r="12" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
      <circle cx="128" cy="108" r="14" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
      <circle cx="160" cy="108" r="14" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
    </g>`,
  tractor: () => `
    <g>
      <path d="M46 84 L46 118 L146 118 L152 84 Z" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="66" cy="108" r="8" fill="none" stroke="${LINE}" stroke-width="2.5"/>
      <circle cx="128" cy="108" r="8" fill="none" stroke="${LINE}" stroke-width="2.5"/>
      <rect x="72" y="58" width="60" height="28" rx="5" fill="${LINE}" opacity="0.35" stroke="${WHITE}" stroke-width="2.5"/>
      <path d="M84 58 L86 40 L118 40 L120 58 Z" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M36 76 L36 120 L26 120 L26 76 Z" fill="${VOLT}"/>
      <path d="M46 96 L36 96" stroke="${WHITE}" stroke-width="3"/>
    </g>`,
  crane: () => `
    <g>
      <path d="M62 84 L164 30" stroke="${WHITE}" stroke-width="8" stroke-linecap="round"/>
      <path d="M72 78 L150 36" stroke="${VOLT}" stroke-width="3"/>
      <path d="M164 30 L164 58" stroke="${LINE}" stroke-width="2.5"/>
      <rect x="156" y="58" width="16" height="12" rx="2" fill="${VOLT}"/>
      <rect x="40" y="80" width="76" height="22" rx="4" fill="${LINE}" opacity="0.35" stroke="${WHITE}" stroke-width="2.5"/>
      <path d="M28 102 L28 76 L54 76 L62 90 L62 102 Z" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="46" cy="110" r="10" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
      <circle cx="78" cy="110" r="10" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
      <circle cx="104" cy="110" r="10" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
    </g>`,
  lift: () => `
    <g>
      <rect x="60" y="30" width="84" height="10" rx="3" fill="${VOLT}"/>
      <path d="M62 30 L62 16 M142 30 L142 16 M62 16 L142 16" stroke="${WHITE}" stroke-width="2.5" fill="none"/>
      <path d="M72 40 L132 76 M132 40 L72 76 M72 76 L132 106 M132 76 L72 106" stroke="${LINE}" stroke-width="5" stroke-linecap="round"/>
      <rect x="56" y="106" width="92" height="18" rx="4" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
      <circle cx="74" cy="124" r="8" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
      <circle cx="130" cy="124" r="8" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
    </g>`,
  telehandler: () => `
    <g>
      <path d="M58 70 L168 44" stroke="${WHITE}" stroke-width="10" stroke-linecap="round"/>
      <path d="M70 68 L150 49" stroke="${LINE}" stroke-width="3"/>
      <path d="M168 44 L172 66 M160 66 L184 62" stroke="${VOLT}" stroke-width="5" stroke-linecap="round"/>
      <rect x="46" y="72" width="70" height="28" rx="5" fill="${LINE}" opacity="0.35" stroke="${WHITE}" stroke-width="2.5"/>
      <path d="M50 72 L52 50 L80 50 L82 72 Z" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="62" cy="106" r="15" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
      <circle cx="112" cy="106" r="15" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
    </g>`,
  generator: () => `
    <g>
      <rect x="44" y="52" width="112" height="60" rx="8" fill="${LINE}" opacity="0.3" stroke="${WHITE}" stroke-width="2.5"/>
      <path d="M56 68 L92 68 M56 78 L92 78 M56 88 L92 88 M56 98 L92 98" stroke="${WHITE}" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
      <rect x="106" y="66" width="38" height="34" rx="4" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
      <path d="M125 72 L118 85 L127 85 L120 96" stroke="${VOLT}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="40" y="112" width="120" height="8" rx="4" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2"/>
      <rect x="130" y="38" width="10" height="16" rx="3" fill="${WHITE}" opacity="0.6"/>
    </g>`,
  mixer: () => `
    <g>
      <path d="M78 44 L132 58 L124 100 L74 88 Z" fill="${LINE}" opacity="0.35" stroke="${WHITE}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M86 56 L124 66 M82 72 L120 82" stroke="${VOLT}" stroke-width="3"/>
      <path d="M62 112 L146 112" stroke="${WHITE}" stroke-width="4" stroke-linecap="round"/>
      <path d="M74 88 L70 112 M124 100 L134 112" stroke="${WHITE}" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="66" cy="116" r="8" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
      <circle cx="140" cy="116" r="8" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
    </g>`,
  compactor: () => `
    <g>
      <path d="M118 36 L150 28" stroke="${WHITE}" stroke-width="5" stroke-linecap="round"/>
      <path d="M100 76 L122 38" stroke="${WHITE}" stroke-width="6" stroke-linecap="round"/>
      <rect x="72" y="58" width="52" height="34" rx="6" fill="${LINE}" opacity="0.35" stroke="${WHITE}" stroke-width="2.5"/>
      <rect x="84" y="66" width="28" height="18" rx="3" fill="${VOLT}" opacity="0.85"/>
      <rect x="56" y="94" width="86" height="16" rx="5" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
      <path d="M56 114 L142 114" stroke="${VOLT}" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
    </g>`,
  tools: () => `
    <g>
      <rect x="86" y="24" width="28" height="42" rx="6" fill="${LINE}" opacity="0.35" stroke="${WHITE}" stroke-width="2.5"/>
      <path d="M72 34 L86 34 M114 34 L128 34" stroke="${WHITE}" stroke-width="5" stroke-linecap="round"/>
      <rect x="92" y="66" width="16" height="34" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
      <path d="M100 100 L100 122" stroke="${VOLT}" stroke-width="8" stroke-linecap="round"/>
      <path d="M78 126 L122 126" stroke="${WHITE}" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
      <path d="M86 44 L114 44 M86 54 L114 54" stroke="${VOLT}" stroke-width="2.5"/>
    </g>`,
  agri: () => `
    <g>
      <rect x="70" y="70" width="56" height="26" rx="4" fill="${LINE}" opacity="0.35" stroke="${WHITE}" stroke-width="2.5"/>
      <path d="M78 70 L80 44 L112 44 L114 70 Z" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="86" y="30" width="8" height="16" rx="3" fill="${WHITE}" opacity="0.6"/>
      <circle cx="52" cy="98" r="14" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
      <circle cx="52" cy="98" r="5" fill="${VOLT}"/>
      <circle cx="126" cy="94" r="26" fill="${INK_DEEP}" stroke="${WHITE}" stroke-width="2.5"/>
      <circle cx="126" cy="94" r="9" fill="${VOLT}"/>
      <path d="M126 68 L126 120 M100 94 L152 94 M108 76 L144 112 M108 112 L144 76" stroke="${LINE}" stroke-width="2"/>
    </g>`,
  other: () => `
    <g>
      <rect x="58" y="54" width="84" height="56" rx="8" fill="${LINE}" opacity="0.3" stroke="${WHITE}" stroke-width="2.5"/>
      <circle cx="100" cy="82" r="18" fill="none" stroke="${VOLT}" stroke-width="4"/>
      <circle cx="100" cy="82" r="6" fill="${WHITE}"/>
      <path d="M100 56 L100 64 M100 100 L100 108 M74 82 L82 82 M118 82 L126 82" stroke="${WHITE}" stroke-width="3" stroke-linecap="round"/>
    </g>`,
};

const variants = [
  { key: "a", bg: INK, scale: 1, tx: 0, ty: 0 },
  { key: "b", bg: INK_SOFT, scale: 1.18, tx: -16, ty: -10 },
  { key: "c", bg: INK_DEEP, scale: 0.9, tx: 10, ty: 6 },
];

function svg(name, variant) {
  const shape = shapes[name] ?? shapes.other;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150" width="800" height="600" role="img" aria-label="Ilustración referencial de equipo">
  <defs>
    <pattern id="g" width="12.5" height="12.5" patternUnits="userSpaceOnUse">
      <path d="M12.5 0 L0 0 L0 12.5" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="0.6"/>
    </pattern>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.05"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="200" height="150" fill="${variant.bg}"/>
  <rect width="200" height="150" fill="url(#g)"/>
  <rect width="200" height="150" fill="url(#fade)"/>
  <path d="M0 126 L200 126" stroke="${VOLT}" stroke-width="0.8" stroke-opacity="0.55"/>
  <g transform="translate(${variant.tx} ${variant.ty}) scale(${variant.scale}) translate(${(1 - variant.scale) * 0} 0)" transform-origin="100 85">${shape()}</g>
  <g opacity="0.75">
    <rect x="8" y="132" width="86" height="11" rx="2.5" fill="#040e1b" fill-opacity="0.75"/>
    <text x="13" y="140" font-family="Verdana, DejaVu Sans, sans-serif" font-size="5.6" fill="${WHITE}" letter-spacing="0.5">ILUSTRACIÓN REFERENCIAL</text>
  </g>
</svg>`;
}

mkdirSync(OUT_DIR, { recursive: true });
let count = 0;
for (const name of Object.keys(shapes)) {
  for (const variant of variants) {
    writeFileSync(join(OUT_DIR, `${name}-${variant.key}.svg`), svg(name, variant), "utf8");
    count++;
  }
}
console.log(`Generadas ${count} ilustraciones en public/placeholders/`);
