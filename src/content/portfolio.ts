/** Owner-editable portfolio content. Evidence audit: docs/content-audit.md. */
export type ProjectNote = { title: string; body: string };
export type EvidenceLink = { label: string; url: string };
export type PortfolioProject = {
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  status: string;
  role: string;
  tags: string[];
  image: string;
  imageAlt: string;
  imageCaption: string;
  sourceUrl: string;
  demoUrl?: string;
  featured: boolean;
  accent: string;
  problem: string;
  contribution: string;
  architecture: ProjectNote[];
  decisions: ProjectNote[];
  validation: string;
  limitations: string[];
  evidence: EvidenceLink[];
};

export const projects: PortfolioProject[] = [
  {
    slug: 'java-native-rag',
    title: 'Java Native RAG',
    kicker: 'Retrieval / system design',
    summary: 'A Java retrieval pipeline connecting medical reference documents, vector search, and answers with source references.',
    status: 'Independent research prototype',
    role: 'Full stack implementation',
    tags: ['Java', 'Spring AI', 'PostgreSQL', 'React'],
    image: '/images/evidence/java-native-rag.svg',
    imageAlt: 'Source-based diagram: MedQuAD documents enter pgvector; a Spring AI query retrieves context for an OpenAI answer.',
    imageCaption: 'Implementation diagram reconstructed from the public source. No live query or performance data is shown.',
    sourceUrl: 'https://github.com/grammerpro/Java-Native-RAG-System',
    featured: true,
    accent: '#92bccb',
    problem: 'A useful retrieval interface needs more than a generated answer. The project explores how a Java service can bring reference material into a response and return the source metadata alongside it.',
    contribution: 'Vardhan’s public project spans a Spring Boot service, a React and TypeScript search interface, a document ingestion path, container configuration, and a separate Python evaluation script. This is independent work, separate from his enterprise experience.',
    architecture: [
      { title: 'Prepare and ingest', body: 'MedQuAD data is prepared as JSON. DataIngestionService reads text and metadata into Spring AI Documents and adds them to the vector store.' },
      { title: 'Embed and retrieve', body: 'The configuration uses OpenAI embeddings and PostgreSQL with pgvector. RAGService asks for the four nearest documents through Spring AI’s VectorStore.' },
      { title: 'Assemble context', body: 'Retrieved document content is joined into a prompt that asks the model to answer from context. Source metadata is collected separately and deduplicated.' },
      { title: 'Generate and return', body: 'Spring AI calls the configured OpenAI chat model. The API returns the answer and source labels to the React interface.' },
    ],
    decisions: [
      { title: 'Keep orchestration in Java', body: 'Spring AI connects the existing Java service model to embedding, storage, and chat interfaces. It makes the service readable to a Java developer, while introducing dependencies on the selected Spring AI version and provider APIs.' },
      { title: 'Return evidence with the answer', body: 'The response includes distinct source labels from retrieved metadata. These help a reader investigate the material, but they are not sentence-level citations and do not prove that every generated statement is supported.' },
      { title: 'Separate evaluation from serving', body: 'A Python script and benchmark route keep evaluation code outside the query service. The inspected script currently passes source labels as evaluation contexts, so the presence of the dashboard is not evidence of validated retrieval quality.' },
    ],
    validation: 'The ingestion, retrieval, provider configuration, response DTO, and evaluation code were inspected at the linked revision. No paid model requests or end-to-end database run were performed for this portfolio review.',
    limitations: [
      'OpenAI supplies the configured embeddings and chat model; this is not a fully local or offline LLM system.',
      'No benchmark scores or production reliability claims are presented. The evaluation context handling needs further work.',
      'The medical corpus is a research use case. Clinical accuracy and suitability have not been established.',
    ],
    evidence: [
      { label: 'Retrieval service', url: 'https://github.com/grammerpro/Java-Native-RAG-System/blob/0c4a253fcb5a2006f9cbf3b2303e32ad1f036bcd/backend/src/main/java/com/vardhan/rag/service/RAGService.java' },
      { label: 'Document ingestion', url: 'https://github.com/grammerpro/Java-Native-RAG-System/blob/0c4a253fcb5a2006f9cbf3b2303e32ad1f036bcd/backend/src/main/java/com/vardhan/rag/service/DataIngestionService.java' },
      { label: 'Provider and database configuration', url: 'https://github.com/grammerpro/Java-Native-RAG-System/blob/0c4a253fcb5a2006f9cbf3b2303e32ad1f036bcd/backend/src/main/resources/application.properties' },
      { label: 'Evaluation script', url: 'https://github.com/grammerpro/Java-Native-RAG-System/blob/0c4a253fcb5a2006f9cbf3b2303e32ad1f036bcd/research/evaluate.py' },
    ],
  },
  {
    slug: 'chroma-loop',
    title: 'Chroma Loop',
    kicker: 'Interaction / game systems',
    summary: 'A Canvas arcade game built around one gesture: rotate a colored ring to catch the matching orb.',
    status: 'Independent browser game',
    role: 'Game logic and browser interface',
    tags: ['TypeScript', 'Canvas 2D', 'Web Audio', 'Vitest'],
    image: '/images/evidence/chroma-loop-screenshot.png',
    imageAlt: 'The actual Chroma Loop game in a local browser: a colored ring with a falling orb and the game score panel.',
    imageCaption: 'Actual game, captured from the reviewed public source running locally in Chromium. The displayed score belongs to this sample run.',
    sourceUrl: 'https://github.com/grammerpro/Chroma-Loop',
    featured: true,
    accent: '#c5a0ec',
    problem: 'A small arcade game lives or dies on its input loop. Chroma Loop explores a direct ring-rotation mechanic with understandable scoring, a repeatable daily sequence, and input from both keyboards and pointers.',
    contribution: 'The public project includes typed game state, ring geometry and collision logic, falling objects, keyboard and pointer input, a DOM interface, synthesized audio, local scores, and a suite of unit tests.',
    architecture: [
      { title: 'Capture intent', body: 'The input module collects keyboard direction and pointer movement. Ring rotation consumes those values without coupling input listeners to drawing.' },
      { title: 'Advance the game', body: 'A requestAnimationFrame loop advances game state with a bounded elapsed time. Matching drops update scores and streaks; misses update lives.' },
      { title: 'Draw and explain', body: 'Canvas 2D draws the ring and drops. DOM overlays provide menus, score information, and controls; Web Audio synthesizes feedback.' },
      { title: 'Repeat a challenge', body: 'A seeded random generator supports a repeatable daily sequence. Scores and preferences use a storage wrapper with a fallback when local storage is unavailable.' },
    ],
    decisions: [
      { title: 'Use a small rendering surface', body: 'Canvas 2D is enough for a ring and moving orbs. Keeping the renderer close to the geometry avoids adding a game engine, while leaving collision rules and state changes easy to inspect.' },
      { title: 'Make randomness repeatable', body: 'The random generator accepts a seed and can clone its state. This enables repeatable sequences and direct tests. The current date seed uses a fixed UTC−5 boundary, rather than the midnight-UTC wording in the README.' },
      { title: 'Test game rules apart from pixels', body: 'The repository tests ring sectors, seeded randomness, scoring, lives, drops, and storage. These tests target the rules behind the visual result; they do not establish a universal frame rate or full accessibility conformance.' },
    ],
    validation: 'The production build and existing unit tests passed in an isolated clone. The local browser preview rendered without page exceptions and supplied the screenshot above. The test suite uses a Canvas stub for game rules; it does not benchmark rendering.',
    limitations: [
      'This repository is a Canvas 2D game. Earlier portfolio copy describing Three.js shader ribbons did not match the inspected source.',
      'Scores are local. The source does not establish a shared competitive leaderboard.',
      'Real-device performance and accessibility need broader testing before making general claims.',
    ],
    evidence: [
      { label: 'Game loop and state', url: 'https://github.com/grammerpro/Chroma-Loop/blob/90283a900cb7006c86d4957cfeea32f94bc1ff0b/src/game.ts' },
      { label: 'Ring geometry and rotation', url: 'https://github.com/grammerpro/Chroma-Loop/blob/90283a900cb7006c86d4957cfeea32f94bc1ff0b/src/ring.ts' },
      { label: 'Deterministic random generator', url: 'https://github.com/grammerpro/Chroma-Loop/blob/90283a900cb7006c86d4957cfeea32f94bc1ff0b/src/rng.ts' },
      { label: 'Scoring tests', url: 'https://github.com/grammerpro/Chroma-Loop/blob/90283a900cb7006c86d4957cfeea32f94bc1ff0b/tests/game_scoring.test.ts' },
    ],
  },
  {
    slug: 'anon-dapp',
    title: 'ANON Dapp',
    kicker: 'Browser systems / cryptography',
    summary: 'A file-vault prototype that connects browser encryption, local persistence, and an optional IPFS upload path.',
    status: 'Independent experimental prototype',
    role: 'React interface and browser data flow',
    tags: ['React', 'Web Crypto', 'IndexedDB', 'IPFS'],
    image: '/images/evidence/anon-dapp-screenshot.png',
    imageAlt: 'The actual ANON prototype upload view running locally, with a file selector, AES-GCM option, and upload control.',
    imageCaption: 'Actual prototype UI, captured from a local production build. Its network and shard language describes a simulation; this is not evidence of distributed storage.',
    sourceUrl: 'https://github.com/grammerpro/ANON-Dapp',
    featured: true,
    accent: '#a7c7b5',
    problem: 'File sharing crosses several boundaries: reading bytes, creating keys, storing data, passing a link, and recovering a file. ANON makes those stages visible in an experimental browser interface.',
    contribution: 'The public implementation combines React upload and share views with Web Crypto helpers, IndexedDB persistence, a Pinata integration path, and a local proof-of-work ledger demonstration.',
    architecture: [
      { title: 'Read and encrypt', body: 'FileReader produces an ArrayBuffer. The Web Crypto helper generates an extractable AES-GCM key and encrypts the bytes with a fresh random initialization vector.' },
      { title: 'Choose a storage path', body: 'With a configured token, the IPFS helper attempts a Pinata upload. Otherwise it returns a simulated content identifier, and the upload view saves the record to IndexedDB.' },
      { title: 'Create a share link', body: 'The URL fragment carries the content identifier, exported key, initialization vector, and file metadata. The fragment is read by the share view in the browser.' },
      { title: 'Retrieve and decrypt', body: 'The share view retrieves ciphertext, imports the key, decrypts through Web Crypto, and creates a downloadable Blob. A separate local ledger illustrates hashing and proof of work.' },
    ],
    decisions: [
      { title: 'Use the browser’s cryptographic primitives', body: 'Encryption and decryption delegate to Web Crypto rather than a handwritten cipher. That verifies an implementation choice, not the security of the full application: key management, credentials, and the hosting environment still matter.' },
      { title: 'Keep a local path available', body: 'IndexedDB makes the vault demonstrable without a storage account. A locally simulated identifier does not make a file available to another device, and the optional remote path depends on Pinata and gateways.' },
      { title: 'Show the boundary of the experiment', body: 'The animated shard destinations are illustrative and the chain lives locally. They help explain the intended interaction, but are not evidence of a distributed consensus network or zero-knowledge proof system.' },
    ],
    validation: 'The production build passed, and a local Chromium check encrypted a disposable text fixture, persisted it in IndexedDB, and decrypted it back to the same bytes. The check also confirmed that the exported key is stored in the local record. No Pinata account, public upload, or independent security audit was involved.',
    limitations: [
      'The local file record stores the exported key alongside ciphertext. This prototype is not presented as a secure production vault.',
      'The optional Pinata token is stored in browser local storage, and the upload metadata includes file information.',
      'No Solidity contract, Ethereum transaction, zero-knowledge proof framework, or actual distributed sharding was found in the inspected implementation.',
    ],
    evidence: [
      { label: 'Upload and storage orchestration', url: 'https://github.com/grammerpro/ANON-Dapp/blob/afed41e96364cbc5e1299d0576c0b4d828efc253/src/components/UploadPortal.jsx' },
      { label: 'Web Crypto implementation', url: 'https://github.com/grammerpro/ANON-Dapp/blob/afed41e96364cbc5e1299d0576c0b4d828efc253/src/utils/cryptoHelper.js' },
      { label: 'Local and Pinata storage paths', url: 'https://github.com/grammerpro/ANON-Dapp/blob/afed41e96364cbc5e1299d0576c0b4d828efc253/src/utils/ipfsHelper.js' },
      { label: 'Share-link decryption', url: 'https://github.com/grammerpro/ANON-Dapp/blob/afed41e96364cbc5e1299d0576c0b4d828efc253/src/components/SharePortal.jsx' },
    ],
  },
  {
    slug: 'aura-landing',
    title: 'Aura Landing',
    kicker: 'Interface / product concept',
    summary: 'A responsive landing-page concept for smart eyewear, expressed in HTML and Tailwind utilities.',
    status: 'Front-end concept',
    role: 'Page composition and responsive styling',
    tags: ['HTML', 'Tailwind CSS', 'Responsive UI'],
    image: '/images/evidence/aura-landing.svg',
    imageAlt: 'Diagram of Aura’s hero, feature grid, and newsletter form sections.',
    imageCaption: 'Source-based page-structure illustration. Product claims are concept copy, not hardware specifications.',
    sourceUrl: 'https://github.com/grammerpro/aura-landing',
    featured: false,
    accent: '#b1b6ed',
    problem: 'The exercise gives an imagined eyewear product a clear first impression, a short feature story, and an invitation to keep in touch.',
    contribution: 'A single HTML page contains the navigation, hero, responsive feature grid, inline icons, and newsletter form. Styling is provided by Tailwind’s CDN script.',
    architecture: [
      { title: 'Present the concept', body: 'A hero introduces the brand and product idea with two calls to action.' },
      { title: 'Explain the product story', body: 'A responsive grid presents three conceptual benefits with inline SVG icons.' },
      { title: 'Invite interest', body: 'An email field and submit control form the newsletter interface. No subscription delivery integration was found.' },
    ],
    decisions: [
      { title: 'Keep the prototype direct', body: 'The HTML file can be inspected without a framework build. The CDN styling keeps setup small but makes the visual result dependent on an external script.' },
      { title: 'Separate design from product evidence', body: 'The page explores marketing hierarchy. Claims in its concept copy do not establish the existence or performance of a physical eyewear product.' },
    ],
    validation: 'The complete index.html and README were inspected. No newsletter message was submitted. The README’s public demo could not be resolved in the review environment.',
    limitations: ['No Next.js application or AI backend is present in the inspected repository.', 'Newsletter delivery and hardware capabilities are not verified.'],
    evidence: [{ label: 'Complete page source', url: 'https://github.com/grammerpro/aura-landing/blob/e66b9cd06e30fca24bfdf443b3f0c6765ac475a2/index.html' }],
  },
  {
    slug: 'pdf-editor-tool',
    title: 'PDF Editor Tool',
    kicker: 'CLI / early exploration',
    summary: 'An early Python command-line scaffold for planned merge, watermark, and signature-image operations.',
    status: 'Unimplemented operation scaffold',
    role: 'Command interface exploration',
    tags: ['Python', 'argparse', 'CLI scaffold'],
    image: '/images/evidence/pdf-editor-tool.svg',
    imageAlt: 'Diagram showing parsed merge, watermark, and sign commands ending in placeholder output.',
    imageCaption: 'Current source behavior: commands print placeholder messages. They do not create or edit a PDF.',
    sourceUrl: 'https://github.com/grammerpro/pdf-editor-tool',
    featured: false,
    accent: '#d7bd91',
    problem: 'The intended utility brings common document operations behind a small command interface. The published code currently establishes the interface, rather than performing those operations.',
    contribution: 'The script defines argparse subcommands, required options, and separate function entry points for merging, watermarking, and adding a signature image.',
    architecture: [
      { title: 'Parse a command', body: 'argparse accepts merge, watermark, or sign and requires the corresponding input and output arguments.' },
      { title: 'Dispatch to a function', body: 'Each subcommand selects an operation function through a callable attached to the parsed arguments.' },
      { title: 'Print the intended action', body: 'The functions emit a message prefixed with PLACEHOLDER. The inspected source does not read, transform, or write PDF content.' },
    ],
    decisions: [
      { title: 'Define the command contract first', body: 'Subcommands make the intended operations clear before a PDF library is connected. This is a useful scaffold, but it is not a working editor.' },
      { title: 'Name the signature scope precisely', body: 'The planned sign command accepts an image path. An image overlay is distinct from cryptographic signing, certificate validation, or legal validity.' },
    ],
    validation: 'The entire edit_pdf.py source was reviewed. Its placeholder functions were exercised with disposable path arguments; no PDF output was produced.',
    limitations: ['PDF manipulation is not implemented in the inspected revision.', 'No browser interface, WebCrypto integration, certificate validation, or encryption is present.'],
    evidence: [{ label: 'Command parser and placeholder functions', url: 'https://github.com/grammerpro/pdf-editor-tool/blob/0780bc239bdc0570904c80c52b36ab323d7719f1/edit_pdf.py' }],
  },
  {
    slug: 'blockchain-storage',
    title: 'Blockchain Storage',
    kicker: 'Distributed systems / exploration',
    summary: 'A Python and Flask experiment connecting file uploads to a custom proof-of-work transaction chain.',
    status: 'Independent research prototype',
    role: 'File interface and chain implementation',
    tags: ['Python', 'Flask', 'SHA-256', 'Proof of work'],
    image: '/images/evidence/blockchain-storage.svg',
    imageAlt: 'Source-based diagram of a Flask upload interface, local file storage, pending transactions, and a Python proof-of-work chain.',
    imageCaption: 'Implementation diagram. Files use local storage; the source does not implement Ethereum or IPFS.',
    sourceUrl: 'https://github.com/grammerpro/BlockchainFileStorage',
    featured: false,
    accent: '#b5c2bd',
    problem: 'The project explores the mechanics of associating uploaded files with a chain of hashed transactions, exposing pending work, mining, and chain inspection through HTTP endpoints.',
    contribution: 'The public source includes a Flask upload interface, a peer API, Block and Blockchain classes, and alternative nonce-search implementations.',
    architecture: [
      { title: 'Accept a file', body: 'A Flask form handler saves the upload to a local directory and constructs a transaction containing file metadata.' },
      { title: 'Queue a transaction', body: 'The interface posts to a local peer’s new_transaction endpoint. The peer keeps pending transactions in memory.' },
      { title: 'Mine and inspect', body: 'The Blockchain class searches for a hash with the configured zero prefix, links the block to its predecessor, and exposes chain data through Flask.' },
    ],
    decisions: [
      { title: 'Make the chain mechanics visible', body: 'Small Python classes expose hashing, nonce search, and predecessor checks directly. They are useful for studying the mechanism, not evidence of a hardened distributed storage service.' },
      { title: 'Keep file storage distinct from the ledger', body: 'The web application saves actual files locally. Recording transactions in a chain does not, by itself, encrypt files or replicate them across a peer network.' },
    ],
    validation: 'The public Block.py, Blockchain.py, peer.py, app/views.py, requirements, and README were reviewed. A multi-peer deployment and the README’s survey or security claims were not independently verified.',
    limitations: ['The inspected peer list is unused and no complete network consensus or file-replication path was established.', 'The implementation does not provide verified confidentiality, immutability guarantees, or production storage resilience.', 'No Solidity, Ethereum, React, or IPFS implementation was found in the reviewed paths.'],
    evidence: [
      { label: 'Blockchain and mining logic', url: 'https://github.com/grammerpro/BlockchainFileStorage/blob/726f7b47dc1543dd3e77b382a820771b86b197a4/Blockchain.py' },
      { label: 'Peer HTTP endpoints', url: 'https://github.com/grammerpro/BlockchainFileStorage/blob/726f7b47dc1543dd3e77b382a820771b86b197a4/peer.py' },
      { label: 'Upload and local file storage', url: 'https://github.com/grammerpro/BlockchainFileStorage/blob/726f7b47dc1543dd3e77b382a820771b86b197a4/app/views.py' },
    ],
  },
];

export const featuredProjects = projects.filter((project) => project.featured);
export const archiveProjects = projects.filter((project) => !project.featured);
export const getProject = (slug: string) => projects.find((project) => project.slug === slug);
