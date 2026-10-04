import { mkdirSync, writeFileSync } from 'node:fs';

// Original code-native artwork. Labels describe inspected source, not runtime data.
const directory = 'public/images/evidence';
mkdirSync(directory, { recursive: true });
const esc = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
const label = (x, y, text, size = 16, color = '#bec6cb', extra = '') => `<text x="${x}" y="${y}" ${extra.includes('font-family') ? '' : 'font-family="Arial, sans-serif"'} font-size="${size}" fill="${color}" ${extra}>${esc(text)}</text>`;
const line = (x1, y1, x2, y2, color = '#76838b') => `<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="2"/>`;
const box = (x, y, w, title, subtitle, accent) => `<rect x="${x}" y="${y}" width="${w}" height="116" rx="4" fill="#20262b" stroke="#53616b"/><rect x="${x}" y="${y}" width="3" height="116" fill="${accent}"/>${label(x + 24, y + 43, title, 23, '#f4f1ea')}${label(x + 24, y + 77, subtitle, 14)}`;
const frame = (title, subtitle, accent, body, note) => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" role="img"><title>${esc(title)}</title><desc>${esc(note)}</desc><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#30383d" stroke-width=".5"/></pattern></defs><rect width="1200" height="720" fill="#111619"/><rect x="40" y="40" width="1120" height="640" fill="url(#grid)" opacity=".55"/>${label(66, 89, 'VARDHAN / INSIDE THE SYSTEM', 13, accent, 'letter-spacing="2"')}${label(66, 159, title, 47, '#f4f1ea')}${label(68, 201, subtitle, 17)}${body}${line(66, 631, 1134, 631, '#414c53')}${label(66, 665, note, 13, '#b7c0c6')}</svg>`;

const diagrams = [
  ['java-native-rag', 'Java Native RAG', 'Reference material → retrieval → an answer with source labels.', '#92bccb',
    `${box(70, 293, 250, 'MedQuAD JSON', 'Text + source metadata', '#92bccb')}${line(320, 350, 375, 350, '#92bccb')}${box(375, 293, 350, 'PostgreSQL / pgvector', 'OpenAI embeddings · similarity search', '#92bccb')}${line(725, 350, 790, 350, '#92bccb')}${box(790, 293, 340, 'Spring AI → OpenAI', 'Retrieved context → generated answer', '#92bccb')}${line(550, 409, 550, 484)}${line(550, 484, 956, 484)}${line(956, 409, 956, 484)}${label(380, 534, 'React + TypeScript', 24, '#f4f1ea')}${label(380, 565, 'Question in. Answer and source labels out.', 17)}`,
    'SOURCE-BASED DIAGRAM / Hosted model calls. Research prototype. No benchmark results shown.'],
  ['chroma-loop', 'Chroma Loop', 'A small input loop. A repeatable game system.', '#c5a0ec',
    `<g transform="translate(345 423)"><circle r="136" fill="none" stroke="#343c43" stroke-width="60"/><circle r="136" fill="none" stroke="#a899df" stroke-width="59" stroke-dasharray="209 646" transform="rotate(-87)"/><circle r="136" fill="none" stroke="#eab178" stroke-width="59" stroke-dasharray="209 646" transform="rotate(3)"/><circle r="136" fill="none" stroke="#8ebfc5" stroke-width="59" stroke-dasharray="209 646" transform="rotate(93)"/><circle r="136" fill="none" stroke="#b8cda5" stroke-width="59" stroke-dasharray="209 646" transform="rotate(183)"/><circle r="78" fill="none" stroke="#68717a"/>${label(-38, 7, 'ROTATE', 15, '#f4f1ea')}<circle cx="0" cy="-84" r="12" fill="#8ebfc5"/><path d="M0 -175V-120" stroke="#8ebfc5" stroke-dasharray="4 6"/></g>${box(650, 275, 440, 'Keyboard / pointer', 'Intent becomes ring rotation', '#c5a0ec')}${box(650, 440, 440, 'Game state → Canvas 2D', 'Catch · score · reset · repeat', '#c5a0ec')}${line(872, 391, 872, 440, '#c5a0ec')}`,
    'SOURCE-BASED GAMEPLAY ILLUSTRATION / TypeScript + Canvas 2D. No simulated score or frame-rate claim.'],
  ['anon-dapp', 'ANON Dapp', 'Follow the file across browser boundaries.', '#a7c7b5',
    `${box(70, 291, 250, 'File → Web Crypto', 'AES-GCM encrypted bytes', '#a7c7b5')}${line(320, 349, 400, 349, '#a7c7b5')}${box(400, 261, 335, 'Local IndexedDB', 'Ciphertext + exported key stored', '#a7c7b5')}${box(400, 422, 335, 'Optional Pinata', 'Remote upload with configured token', '#a7c7b5')}${line(358, 349, 358, 480, '#a7c7b5')}${line(358, 480, 400, 480, '#a7c7b5')}${line(735, 319, 790, 319)}${line(790, 319, 790, 400)}${line(735, 480, 790, 480)}${line(790, 480, 790, 400)}${line(790, 400, 830, 400)}${box(830, 342, 300, 'Share → decrypt', 'Credentials in URL fragment', '#a7c7b5')}`,
    'SOURCE-BASED DIAGRAM / Experimental vault. Local ledger and shard animation are simulations.'],
  ['aura-landing', 'Aura Landing', 'A single page for an imagined eyewear product.', '#b1b6ed',
    `<rect x="130" y="267" width="940" height="310" rx="4" fill="#e9e6df"/>${label(161, 306, 'AURA', 17, '#30334a')}${line(161, 325, 1035, 325, '#b6b7c0')}${label(163, 374, 'Product introduction', 30, '#222735')}${label(163, 408, 'Hero and calls to action', 17, '#565d70')}<rect x="774" y="349" width="260" height="91" fill="#b9bdd6"/>${[163, 456, 749].map((x) => `<rect x="${x}" y="466" width="268" height="71" fill="#d8d9df"/>${label(x + 20, 508, 'Concept feature', 17, '#454b60')}`).join('')}`,
    'SOURCE-BASED STRUCTURE ILLUSTRATION / HTML + CDN Tailwind. Newsletter delivery is not implemented.'],
  ['pdf-editor-tool', 'PDF Editor Tool', 'The command interface exists. PDF operations remain placeholders.', '#d7bd91',
    `<rect x="105" y="273" width="990" height="300" fill="#1b2328" stroke="#4d585f"/>${label(141, 323, 'edit_pdf.py', 20, '#d7bd91')}${line(141, 345, 1056, 345, '#414c53')}${label(141, 389, '$ python edit_pdf.py merge a.pdf b.pdf -o merged.pdf', 21, '#f4f1ea', 'font-family="monospace"')}${label(141, 437, '[PLACEHOLDER] Merging PDFs: ...', 21, '#d7bd91')}${label(141, 501, 'argparse → dispatch → print', 23, '#f4f1ea')}${label(141, 540, 'No PDF file is created or modified by the current source.', 17)}`,
    'SOURCE-BEHAVIOR ILLUSTRATION / Early Python CLI scaffold. No signature validation or PDF editing.'],
  ['blockchain-storage', 'Blockchain Storage', 'File handling and proof of work, made inspectable.', '#b5c2bd',
    `${box(70, 301, 280, 'Flask upload', 'File saved to local directory', '#b5c2bd')}${line(350, 359, 405, 359, '#b5c2bd')}${box(405, 301, 330, 'Pending transaction', 'Metadata sent to local peer', '#b5c2bd')}${line(735, 359, 790, 359, '#b5c2bd')}${box(790, 301, 340, 'Python chain', 'SHA-256 + nonce search', '#b5c2bd')}${label(405, 495, 'Previous hash → block → next hash', 27, '#f4f1ea')}${label(405, 537, 'A custom chain experiment, with local file storage.', 17)}`,
    'SOURCE-BASED DIAGRAM / Flask + Python. Network replication and confidentiality are not established.'],
];

for (const [slug, title, subtitle, accent, body, note] of diagrams) {
  writeFileSync(`${directory}/${slug}.svg`, frame(title, subtitle, accent, body, note));
}
console.log(`Wrote ${diagrams.length} original source-based SVG illustrations.`);
