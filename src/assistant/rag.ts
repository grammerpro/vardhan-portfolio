/**
 * Resume-Aware RAG System
 * Handles resume parsing, chunking, embeddings, and answer generation
 */

interface Chunk {
  id: string;
  text: string;
  section: string;
  metadata: {
    section: string;
    start: number;
    end: number;
    totalWords: number;
  };
}

interface SearchResult {
  chunk: Chunk;
  score: number;
  bm25Score: number;
}

interface Answer {
  answer: string;
  citations: string[];
  confidence: number;
}

interface PipelineResult {
  data: number[];
}

interface EmbeddingPipeline {
  (text: string, options: { pooling: string; normalize: boolean }): Promise<PipelineResult>;
}

declare global {
  interface Window {
    transformers: unknown;
    pipeline: (task: string, model: string) => Promise<EmbeddingPipeline>;
  }
}

class ResumeRAG {
  private resumeText: string;
  private resumeData: ResumeJSON | null;
  private chunks: Chunk[];
  private embeddings: number[][];
  private contentHash: string;
  private isInitialized: boolean;
  private pipeline: EmbeddingPipeline | null;

  constructor() {
    this.resumeText = '';
  this.resumeData = null;
    this.chunks = [];
    this.embeddings = [];
    this.contentHash = '';
    this.isInitialized = false;
    this.pipeline = null;
  }

  /**
   * Initialize the RAG system with resume data
   */
  async initialize(resumeUrl: string): Promise<void> {
    try {
      console.log('Initializing RAG system with URL:', resumeUrl);

      // Load resume (JSON preferred, markdown fallback)
      const response = await fetch(resumeUrl);
      console.log('Fetch response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch resume: ${response.status} ${response.statusText}`);
      }

      const ct = response.headers.get('content-type') || '';
      console.log('Content type:', ct);

      if (resumeUrl.endsWith('.json') || ct.includes('application/json')) {
        this.resumeData = await response.json();
        this.resumeText = JSON.stringify(this.resumeData);
        console.log('Loaded JSON resume data:', this.resumeData ? Object.keys(this.resumeData) : 'null');
      } else {
        this.resumeText = await response.text();
        console.log('Loaded text resume, length:', this.resumeText.length);
      }

      // Generate content hash for caching
      this.contentHash = await this.generateHash(this.resumeText);

      // Check if embeddings are cached
      const cached = this.loadCachedEmbeddings();
      if (cached) {
        this.chunks = cached.chunks;
        this.embeddings = cached.embeddings;
        this.isInitialized = true;
        console.log('Loaded cached embeddings, chunks:', this.chunks.length);
        return;
      }

      // Parse and chunk resume
      await this.parseAndChunkResume();
      console.log('Parsed and chunked resume, chunks:', this.chunks.length);

      // Generate embeddings
      await this.generateEmbeddings();
      console.log('Generated embeddings for', this.embeddings.length, 'chunks');

      // Cache embeddings
      this.cacheEmbeddings();

      this.isInitialized = true;
      console.log('RAG system initialized successfully');
    } catch (error) {
      console.error('Failed to initialize RAG system:', error);
      throw error;
    }
  }

  /**
   * Parse markdown resume and create chunks
   */
  async parseAndChunkResume() {
    this.chunks = [];

    // If JSON resume is available, chunk by semantic sections
    if (this.resumeData) {
      const data = this.resumeData;
      const pushChunks = (section: string, text: string) => {
        const clean = text.replace(/\s+/g, ' ').trim();
        if (!clean) return;
        const chunkChars = 600;
        const overlap = 120;
        let start = 0;
        while (start < clean.length) {
          const end = Math.min(start + chunkChars, clean.length);
          const slice = clean.slice(start, end);
          const id = `${section}_${this.chunks.length}`;
          this.chunks.push({
            id,
            text: slice,
            section,
            metadata: { section, start, end, totalWords: clean.split(' ').length }
          });
          if (end === clean.length) break;
          start = end - overlap;
        }
      };

      // Career Goals
      if (data.career_goals) pushChunks('Career Goals', data.career_goals);

      // Education
      if (Array.isArray(data.education)) {
        const eduText = data.education
          .map(e => `${e.degree} at ${e.institution}${e.gpa ? ` (GPA ${e.gpa})` : ''}${e.completion ? `, completed ${e.completion}` : ''}`)
          .join('. ');
        pushChunks('Education', eduText);
      }

      // Leadership (derive from experience highlights)
      if (Array.isArray(data.experience)) {
        const terms = /(lead|led|mentor|mentored|managed|coordinat|authored|drove|guided|ownership|owner|architect)/i;
        const leadPoints: string[] = [];
        data.experience.forEach(exp => {
          exp.highlights?.forEach(h => { if (terms.test(h)) leadPoints.push(`${h} (${exp.company})`); });
        });
        if (leadPoints.length) pushChunks('Leadership', leadPoints.join('. '));
      }

      // Projects
      const projRecent = Array.isArray(data.projects_recent) ? data.projects_recent.join('. ') : '';
      const projPortfolio = Array.isArray(data.projects_portfolio)
        ? data.projects_portfolio.map(p => `${p.name}: ${p.summary}`).join('. ')
        : '';
      if (projRecent) pushChunks('Projects', projRecent);
      if (projPortfolio) pushChunks('Projects', projPortfolio);

      // Skills
      if (data.skills) {
        const sections: string[] = [];
        for (const [k, v] of Object.entries(data.skills)) {
          sections.push(`${k.replace(/_/g, ' ')}: ${(v as string[]).join(', ')}`);
        }
        pushChunks('Skills', sections.join('. '));
      }

      // Strengths & Weaknesses
      if (Array.isArray(data.strengths)) pushChunks('Strengths', data.strengths.join('. '));
      if (Array.isArray(data.weaknesses)) pushChunks('Weaknesses', data.weaknesses.join('. '));

      // Profile / Contact for factuals
      if (data.profile?.summary) pushChunks('Profile', `${data.profile.title ?? ''}. ${data.profile.summary}`);
      if (data.contact) pushChunks('Contact', `Email: ${data.contact.email}. Phone: ${data.contact.phone}. Location: ${data.contact.location}.`);

      return;
    }

    // Fallback: markdown parsing (legacy)
    const sections = this.parseMarkdownSections(this.resumeText);
    const chunkSize = 700;
    const overlap = 150;
    for (const section of sections) {
      const words = section.content.split(' ');
      let start = 0;
      while (start < words.length) {
        const end = Math.min(start + Math.floor(chunkSize / 6), words.length);
        const chunkText = words.slice(start, end).join(' ');
        this.chunks.push({
          id: `${section.title}_${this.chunks.length}`,
          text: chunkText,
          section: section.title,
          metadata: { section: section.title, start, end, totalWords: words.length }
        });
        start = end - Math.floor(overlap / 6);
      }
    }
  }

  /**
   * Parse markdown into sections
   */
  parseMarkdownSections(markdown: string) {
    const lines = markdown.split('\n');
    const sections = [];
    let currentSection = null;
    let currentContent = [];

    for (const line of lines) {
      // Check for headers
      const headerMatch = line.match(/^#{1,3}\s+(.+)$/);
      if (headerMatch) {
        // Save previous section
        if (currentSection) {
          currentSection.content = currentContent.join('\n').trim();
          sections.push(currentSection);
        }

        // Start new section
        currentSection = {
          id: headerMatch[1].toLowerCase().replace(/\s+/g, '_'),
          title: headerMatch[1],
          content: '',
          level: headerMatch[0].match(/^#+/)?.[0].length || 1
        };
        currentContent = [];
      } else if (currentSection && line.trim()) {
        currentContent.push(line);
      }
    }

    // Add last section
    if (currentSection) {
      currentSection.content = currentContent.join('\n').trim();
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Generate embeddings for all chunks
   */
  async generateEmbeddings() {
    // Load Transformers.js from CDN
    if (!window.transformers) {
      await this.loadTransformers();
    }

    // Initialize pipeline
    this.pipeline = await window.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    // Generate embeddings for all chunks
    this.embeddings = [];
    for (const chunk of this.chunks) {
      if (!this.pipeline) throw new Error('Pipeline not initialized');
      const embedding = await this.pipeline(chunk.text, { pooling: 'mean', normalize: true });
      this.embeddings.push(Array.from(embedding.data) as number[]);
    }
  }

  /**
   * Load Transformers.js from CDN
   */
  async loadTransformers(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1/dist/transformers.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Transformers.js'));
      document.head.appendChild(script);
    });
  }

  /**
   * Search for relevant chunks using BM25 + embeddings
   */
  async search(query: string, topK: number = 4): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      throw new Error('RAG system not initialized');
    }

    console.log('Searching for query:', query);

    // Normalize query
    const normalizedQuery = this.normalizeText(query);
    console.log('Normalized query:', normalizedQuery);

    // BM25 search
    const bm25Scores = this.chunks.map((chunk, index) => ({
      index,
      score: this.bm25Score(normalizedQuery, chunk.text)
    }));

    console.log('BM25 scores for top 5:', bm25Scores.slice(0, 5).map(s => ({ index: s.index, score: s.score, text: this.chunks[s.index].text.substring(0, 50) + '...' })));

    // Sort by BM25 score and take top 12
    bm25Scores.sort((a, b) => b.score - a.score);
    const topCandidates = bm25Scores.slice(0, 12);

    console.log('Top BM25 candidates:', topCandidates.length);

    // Generate query embedding
    if (!this.pipeline) throw new Error('Pipeline not initialized');
    const queryEmbedding = await this.pipeline(normalizedQuery, { pooling: 'mean', normalize: true });
    const queryVector = Array.from(queryEmbedding.data) as number[];

    // Rerank with cosine similarity
    const reranked = topCandidates.map(candidate => {
      const chunkEmbedding = this.embeddings[candidate.index];
      const similarity = this.cosineSimilarity(queryVector, chunkEmbedding);
      return {
        chunk: this.chunks[candidate.index],
        score: similarity,
        bm25Score: candidate.score
      };
    });

    // Sort by similarity and return top K
    reranked.sort((a, b) => b.score - a.score);
    const results = reranked.slice(0, topK);

    console.log('Final search results:', results.map(r => ({
      score: r.score,
      section: r.chunk.section,
      text: r.chunk.text.substring(0, 100) + '...'
    })));

    return results;
  }

  /**
   * Generate answer from retrieved chunks
   */
  generateAnswer(query: string, chunks: SearchResult[]): Answer {
    const q = this.normalizeText(query).toLowerCase();
    const topScore = chunks[0]?.score ?? 0;

    // Low-confidence fallback
    if (topScore < 0.48) {
      return {
        answer: "I didn’t find that in my resume, but you can ask me about my career goals, projects, education, or skills.",
        citations: [],
        confidence: topScore
      };
    }

    // Section-specific answers using JSON data when available
    if (this.resumeData) {
      const d = this.resumeData;

      // Career goals
      if (q.includes('career') && q.includes('goal')) {
        const goal = d.career_goals ?? '';
        const sentences = this.toSentences(goal).slice(0, 3);
        return { answer: this.ensureTwoToThree(sentences), citations: ['Career Goals_0'], confidence: topScore };
      }

      // Education
      if (q.includes('education') || q.includes('educational') || q.includes('degree')) {
        const edu = Array.isArray(d.education) ? d.education : [];
        const parts = edu.map(e => `${e.degree} at ${e.institution}${e.gpa ? ` (GPA ${e.gpa})` : ''}${e.completion ? `, completed ${e.completion}` : ''}`);
        const text = parts.join('. ');
        const sentences = this.toSentences(text).slice(0, 3);
        return { answer: this.ensureTwoToThree(sentences), citations: ['Education_0'], confidence: topScore };
      }

      // Leadership
      if (q.includes('leader') || q.includes('leadership')) {
        const lead = chunks.map(c => c.chunk).filter(ch => ch.section === 'Leadership').map(ch => ch.text).join(' ');
        const sentences = this.toSentences(lead || '').slice(0, 3);
        if (sentences.length) return { answer: this.ensureTwoToThree(sentences), citations: ['Leadership_0'], confidence: topScore };
      }

      // Projects
      if (q.includes('project')) {
        const projects = [
          ...(Array.isArray(d.projects_recent) ? d.projects_recent : []),
          ...(Array.isArray(d.projects_portfolio) ? d.projects_portfolio.map(p => `${p.name}: ${p.summary}`) : [])
        ];
        const text = projects.join('. ');
        const sentences = this.toSentences(text).slice(0, 3);
        return { answer: this.ensureTwoToThree(sentences), citations: ['Projects_0'], confidence: topScore };
      }

      // Skills
      if (q.includes('skill') || q.includes('technology') || q.includes('tech stack')) {
        const groups: string[] = [];
        if (d.skills) {
          for (const [k, v] of Object.entries(d.skills)) {
            groups.push(`${k.replace(/_/g, ' ')}: ${(v as string[]).slice(0, 8).join(', ')}`);
          }
        }
        const text = groups.join('. ');
        const sentences = this.toSentences(text).slice(0, 3);
        return { answer: this.ensureTwoToThree(sentences), citations: ['Skills_0'], confidence: topScore };
      }
    }

    // Heuristic fallbacks using chunks
    if (this.isFactualQuestion(q)) return this.generateFactualAnswer(query, chunks);
    if (this.isListQuestion(q)) return this.generateListAnswer(query, chunks);
    if (this.isExperienceQuestion(q)) return this.generateExperienceAnswer(query, chunks);
    return this.generateGeneralAnswer(query, chunks);
  }

  /**
   * Check if question is factual (name, age, contact, etc.)
   */
  isFactualQuestion(query: string): boolean {
    const factualKeywords = ['name', 'age', 'email', 'contact', 'location', 'phone', 'address'];
    return factualKeywords.some(keyword => query.includes(keyword));
  }

  /**
   * Check if question asks for a list
   */
  isListQuestion(query: string): boolean {
    const listKeywords = ['skills', 'technologies', 'tools', 'projects', 'experience', 'education'];
    return listKeywords.some(keyword => query.includes(keyword));
  }

  /**
   * Check if question is about experience
   */
  isExperienceQuestion(query: string): boolean {
    const expKeywords = ['experience', 'work', 'job', 'role', 'company', 'project'];
    return expKeywords.some(keyword => query.includes(keyword));
  }

  /**
   * Generate factual answer
   */
  generateFactualAnswer(query: string, chunks: SearchResult[]): Answer {
    // Extract factual information from chunks
    const facts = this.extractFacts(chunks);

    if (facts.length === 0) {
      return {
        answer: "I couldn't find that information in my resume.",
        citations: [],
        confidence: 0.3
      };
    }

    return {
      answer: facts[0],
      citations: chunks.slice(0, 2).map(c => c.chunk.id),
      confidence: 0.9
    };
  }

  /**
   * Generate list answer
   */
  generateListAnswer(query: string, chunks: SearchResult[]): Answer {
    const items = this.extractListItems(chunks);

    if (items.length === 0) {
      return {
        answer: "I couldn't find relevant information for that query.",
        citations: [],
        confidence: 0.3
      };
    }

  const answer = `Here are my ${this.getListType(query)}: ${items.slice(0, 10).join(', ')}.`;

    return {
      answer,
      citations: chunks.slice(0, 2).map(c => c.chunk.id),
      confidence: 0.8
    };
  }

  /**
   * Generate experience/project answer
   */
  generateExperienceAnswer(query: string, chunks: SearchResult[]): Answer {
    const experiences = this.extractExperiences(chunks);

    if (experiences.length === 0) {
      return {
        answer: "I couldn't find relevant experience information.",
        citations: [],
        confidence: 0.3
      };
    }

  const answer = this.toSentences(experiences.join('. ')).slice(0, 3).join(' ');

    return {
      answer,
      citations: chunks.slice(0, 2).map(c => c.chunk.id),
      confidence: 0.8
    };
  }

  /**
   * Generate general answer
   */
  generateGeneralAnswer(query: string, chunks: SearchResult[]): Answer {
    const context = chunks.map(c => c.chunk.text).join(' ');
    const sentences = this.toSentences(context).slice(0, 3).join(' ');
    return {
      answer: sentences,
      citations: chunks.slice(0, 2).map(c => c.chunk.id),
      confidence: 0.7
    };
  }

  /**
   * Extract factual information
   */
  extractFacts(chunks: SearchResult[]): string[] {
    const facts = [];
    const text = chunks.map(c => c.chunk.text).join(' ');

    // Extract email
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) facts.push(`My email is ${emailMatch[0]}`);

    // Extract age
    const ageMatch = text.match(/(\d{1,2})\s*(?:years?\s*old|age)/i);
    if (ageMatch) facts.push(`I am ${ageMatch[1]} years old`);

    // Extract location
    const locationMatch = text.match(/(?:location|based in|from)\s*([^,.]+)/i);
    if (locationMatch) facts.push(`I am located in ${locationMatch[1].trim()}`);

    return facts;
  }

  /**
   * Extract list items
   */
  extractListItems(chunks: SearchResult[]): string[] {
    const items = [];
    const text = chunks.map(c => c.chunk.text).join(' ');

    // Extract skills
    const skillMatches = text.match(/(?:skills?|technologies?|tools?):\s*([^.]+)/gi);
    if (skillMatches) {
      skillMatches.forEach(match => {
        const skills = match.split(':')[1].split(',').map(s => s.trim());
        items.push(...skills);
      });
    }

    // Extract from bullet points
    const bulletMatches = text.match(/[•\-*]\s*([^•\-*\n]+)/g);
    if (bulletMatches) {
      items.push(...bulletMatches.map(match => match.replace(/^[•\-*]\s*/, '').trim()));
    }

    return [...new Set(items)]; // Remove duplicates
  }

  /**
   * Extract experiences
   */
  extractExperiences(chunks: SearchResult[]): string[] {
    const experiences: string[] = [];
    const text = chunks.map(c => c.chunk.text).join(' ');

    // Look for job titles and companies
    const jobMatches = text.match(/([A-Z][^•\n]*?)\s*\|\s*([A-Z][^•\n]*?)\s*\|\s*([^•\n]*)/g);
    if (jobMatches) {
      jobMatches.forEach(match => {
        const parts = match.split('|').map(p => p.trim());
        if (parts.length >= 2) {
          experiences.push(`${parts[0]} at ${parts[1]}`);
        }
      });
    }

    return experiences;
  }

  /**
   * Get list type from query
   */
  getListType(query: string): string {
    if (query.includes('skill')) return 'key skills';
    if (query.includes('technolog')) return 'technologies';
    if (query.includes('tool')) return 'tools';
    if (query.includes('project')) return 'projects';
    if (query.includes('experience')) return 'experiences';
    return 'relevant information';
  }

  /**
   * BM25 scoring
   */
  bm25Score(query: string, document: string): number {
    const queryTerms = this.normalizeText(query).split(' ').filter(term => term.length > 2);
    const docTerms = this.normalizeText(document).split(' ');

    let score = 0;
    const k1 = 1.5;
    const b = 0.75;
    const avgDocLen = 100; // Approximate average document length

    for (const term of queryTerms) {
      const tf = docTerms.filter(t => t === term).length;
      const df = 1; // Simplified - in real BM25 this would be document frequency
      const idf = Math.log((this.chunks.length - df + 0.5) / (df + 0.5));

      const numerator = tf * (k1 + 1);
      const denominator = tf + k1 * (1 - b + b * (docTerms.length / avgDocLen));

      score += idf * (numerator / denominator);
    }

    return score;
  }

  /**
   * Cosine similarity
   */
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Normalize text
   */
  normalizeText(text: string): string {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Generate content hash
   */
  async generateHash(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Cache embeddings
   */
  cacheEmbeddings() {
    const cacheData = {
      hash: this.contentHash,
      chunks: this.chunks,
      embeddings: this.embeddings,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem('resume-assistant-cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache embeddings:', error);
    }
  }

  /**
   * Load cached embeddings
   */
  loadCachedEmbeddings() {
    try {
      const cached = localStorage.getItem('resume-assistant-cache');
      if (!cached) return null;

      const cacheData = JSON.parse(cached);

      // Check if cache is valid
      if (cacheData.hash !== this.contentHash) {
        return null;
      }

      // Check if cache is not too old (30 days)
      const cacheAge = Date.now() - cacheData.timestamp;
      if (cacheAge > 30 * 24 * 60 * 60 * 1000) {
        return null;
      }

      return {
        chunks: cacheData.chunks,
        embeddings: cacheData.embeddings
      };
    } catch (error) {
      console.warn('Failed to load cached embeddings:', error);
      return null;
    }
  }

  // Utilities
  private toSentences(text: string): string[] {
    return text
      .replace(/\s+/g, ' ')
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(Boolean);
  }

  private ensureTwoToThree(sentences: string[]): string {
    if (sentences.length >= 2) return sentences.slice(0, 3).join(' ');
    // If we only have one sentence, repeat key phrase safely
    return sentences.join(' ');
  }

  /**
   * Optional server-side enhancement for phrasing (no-op unless used)
   */
  async enhanceWithServer(serverUrl: string, question: string, answer: string, context: string): Promise<string> {
    if (!serverUrl) return answer;
    try {
      const res = await fetch(serverUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer, context })
      });
      if (!res.ok) return answer;
      const data = await res.json();
      return (data?.answer as string) || answer;
    } catch {
      return answer;
    }
  }
}

export default ResumeRAG;

// Types for JSON resume structure
interface ResumeJSON {
  profile?: { fullName?: string; age?: string; title?: string; summary?: string };
  contact?: { phone?: string; email?: string; location?: string };
  career_goals?: string;
  skills?: Record<string, string[]>;
  strengths?: string[];
  weaknesses?: string[];
  experience?: Array<{ company?: string; role?: string; period?: string; highlights?: string[] }>;
  projects_recent?: string[];
  projects_portfolio?: Array<{ name: string; summary: string }>;
  education?: Array<{ degree: string; institution: string; gpa?: string; completion?: string }>;
}
