'use client';

import { useState } from 'react';

const flow = [
  { title: 'Documents', text: 'The ingestion pipeline loads prepared text and metadata and adds documents to the vector store.' },
  { title: 'Retrieve', text: 'A question queries PostgreSQL with pgvector. The service requests the four most similar documents.' },
  { title: 'Generate', text: 'Retrieved text becomes context for a Spring AI chat request to OpenAI. This is remote model processing.' },
  { title: 'Sources', text: 'The response carries the answer and distinct source names from document metadata. Relevance still needs evaluation.' },
];

export function RetrievalPreview() {
  const [step, setStep] = useState(1);
  return <div className="retrieval-preview preview-panel">
    <div className="preview-topline"><span className="eyebrow">A question → grounded context</span><span className="mini-signal" aria-hidden="true" /></div>
    <div className="retrieval-diagram" aria-label="Documents are embedded in pgvector, retrieved as context, then sent to OpenAI through Spring AI.">
      <div className={`document-cluster ${step === 0 ? 'is-selected' : ''}`} aria-hidden="true"><div className="document-sheet sheet-back" /><div className="document-sheet sheet-mid" /><div className="document-sheet sheet-front"><span className="doc-fold" /><span className="doc-type">DOC</span><i /><i /><i /><i /></div><span className="diagram-label">Documents</span></div>
      <div className={`flow-connector ${step > 0 ? 'is-selected' : ''}`} aria-hidden="true"><span>→</span></div>
      <div className={`vector-store ${step === 1 ? 'is-selected' : ''}`} aria-hidden="true"><div className="vector-volume"><div className="vector-dots">{Array.from({ length: 16 }, (_, i) => <i key={i} />)}</div></div><span className="diagram-label">pgvector</span></div>
      <div className={`flow-connector ${step > 1 ? 'is-selected' : ''}`} aria-hidden="true"><span>→</span></div>
      <div className={`model-unit ${step > 1 ? 'is-selected' : ''}`} aria-hidden="true"><div className="model-symbol">✳</div><span className="diagram-label">Spring AI<br /><small>+ OpenAI</small></span></div>
    </div>
    <div className="flow-controls" aria-label="Inspect retrieval flow">{flow.map((item, index) => <button key={item.title} type="button" aria-pressed={step === index} onClick={() => setStep(index)}><span>0{index + 1}</span>{item.title}</button>)}</div>
    <p className="flow-explanation" aria-live="polite">{flow[step].text}</p><p className="preview-caption">Source-based architecture illustration · not a live query</p>
  </div>;
}

export function ChromaPreview() {
  const [rotation, setRotation] = useState(24);
  const [colour, setColour] = useState(0);
  const colours = ['#ffbd76', '#b29bff', '#8de1cc'];
  const names = ['Apricot', 'Lilac', 'Mint'];
  return <div className="chroma-preview preview-panel">
    <div className="preview-topline"><span className="eyebrow">Colour. Timing. A little play.</span><span className="chroma-label">Interaction study</span></div>
    <div className="chroma-art"><svg viewBox="0 0 600 440" role="img" aria-label={`Ring rotated ${rotation} degrees with ${names[colour].toLowerCase()} orb selected`}>
      <defs><radialGradient id="chroma-glow"><stop stopColor="#8758c4" stopOpacity=".23" /><stop offset="1" stopColor="#281d38" stopOpacity="0" /></radialGradient><filter id="orb-glow"><feGaussianBlur stdDeviation="9" /></filter></defs>
      <ellipse cx="300" cy="225" rx="265" ry="205" fill="url(#chroma-glow)" /><g fill="none" stroke="#b7a5c4" opacity=".13"><circle cx="300" cy="223" r="173" /><circle cx="300" cy="223" r="196" /><path d="M300 13v35m0 350v30M83 223h32m370 0h32" /></g>
      <g transform={`rotate(${rotation} 300 223)`}>{colours.map((value, index) => <circle key={value} cx="300" cy="223" r="151" fill="none" stroke={value} strokeWidth="18" strokeDasharray="278 671" strokeLinecap="round" transform={`rotate(${index * 120 - 90} 300 223)`} />)}<circle cx="300" cy="69" r="11" fill="#f4f1ea" /><circle cx="300" cy="69" r="23" fill="#fff" opacity=".13" /></g>
      <text x="300" y="216" textAnchor="middle" fill="#f4f1ea" className="chroma-word">CHROMA</text><text x="300" y="265" textAnchor="middle" fill="#f4f1ea" className="chroma-word">LOOP</text><circle cx="372" cy="140" r="16" fill={colours[colour]} filter="url(#orb-glow)" opacity=".8" /><circle cx="372" cy="140" r="7" fill={colours[colour]} /><circle cx="201" cy="341" r="5" fill={colours[(colour + 1) % 3]} />
    </svg></div>
    <div className="chroma-controls"><label htmlFor="ring-rotation">Rotate the ring <input id="ring-rotation" type="range" min="0" max="360" value={rotation} onChange={event => setRotation(Number(event.target.value))} /></label><div className="colour-controls" aria-label="Orb colour">{colours.map((value, index) => <button key={value} type="button" aria-label={`${names[index]} orb`} aria-pressed={colour === index} onClick={() => setColour(index)} style={{ '--swatch': value } as React.CSSProperties}><span /></button>)}</div></div>
    <p className="preview-caption">An interactive composition inspired by the browser arcade game.</p>
  </div>;
}

export function StoragePreview() {
  const [remote, setRemote] = useState(false);
  return <div className="storage-preview preview-panel"><div className="preview-topline"><span className="eyebrow">A file’s path through the browser</span><span className="storage-mark">ANON /</span></div>
    <div className="storage-art"><div className="storage-orbit" aria-hidden="true" /><div className="storage-file" aria-hidden="true"><span>YOUR FILE</span><div className="file-lines"><i /><i /><i /></div><span className="file-corner">↗</span></div><div className="encryption-block" aria-hidden="true"><svg viewBox="0 0 48 48"><rect x="11" y="20" width="26" height="21" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M17 20v-7a7 7 0 0 1 14 0v7" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="24" cy="30" r="2" fill="currentColor" /><path d="M24 31v4" stroke="currentColor" /></svg><span>AES-GCM</span></div><div className="storage-destination"><span className="destination-icon" aria-hidden="true">{remote ? '↗' : '⊞'}</span><strong>{remote ? 'Pinata' : 'IndexedDB'}</strong><span>{remote ? 'Optional upload' : 'Browser storage'}</span></div></div>
    <div className="storage-controls" aria-label="Inspect storage option"><button type="button" aria-pressed={!remote} onClick={() => setRemote(false)}>Local sandbox</button><button type="button" aria-pressed={remote} onClick={() => setRemote(true)}>Optional Pinata</button></div>
    <p className="flow-explanation" aria-live="polite">{remote ? 'With a configured Pinata token, encrypted bytes can be uploaded. The share URL carries the decryption key in its fragment.' : 'The sandbox keeps encrypted bytes and their exported key in IndexedDB. This is a prototype, not a security guarantee.'}</p><p className="preview-caption">Source-based illustration · no files are uploaded by this preview</p>
  </div>;
}
