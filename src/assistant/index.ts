/**
 * Resume Assistant Widget
 * A browser-based AI assistant that answers questions about a resume
 */

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start(): void;
  stop(): void;
  abort(): void;
}

declare const SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

import { templates } from './template.js';
import ResumeRAG from './rag.js';

interface AssistantConfig {
  container?: string;
  position?: { bottom: number; right: number };
  avatarUrl?: string;
  displayName?: string;
  theme?: 'light' | 'dark' | 'auto';
  resumeUrl?: string;
  enableVoice?: boolean;
  useServer?: boolean;
  serverUrl?: string;
}

export type { AssistantConfig };

interface Message {
  content: string;
  isUser: boolean;
  timestamp: string;
  citations?: string[];
}

class ResumeAssistant {
  private config: Required<AssistantConfig>;
  private rag: ResumeRAG;
  private isOpen: boolean;
  private messages: Message[];
  private wrapper: HTMLElement | null;
  private button: HTMLElement | null;
  private panel: HTMLElement | null;
  private messagesContainer: HTMLElement | null;
  private input: HTMLInputElement | null;
  private sendButton: HTMLButtonElement | null;
  private voiceEnabled: boolean;
  private currentSpeech: SpeechSynthesisUtterance | null;
  private isInitialized: boolean;

  constructor(config: AssistantConfig = {}) {
    this.config = {
      container: 'body',
      position: { bottom: 24, right: 24 },
      avatarUrl: '/assets/avatar.png',
  displayName: 'Vardhan',
      theme: 'auto',
  resumeUrl: '/data/resume.json',
      enableVoice: false,
      useServer: false,
      serverUrl: '',
      ...config
    };

    this.rag = new ResumeRAG();
    this.isOpen = false;
    this.messages = [];
    this.wrapper = null;
    this.button = null;
    this.panel = null;
    this.messagesContainer = null;
    this.input = null;
    this.sendButton = null;
    this.voiceEnabled = this.config.enableVoice;
    this.currentSpeech = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the assistant
   */
  async initialize(): Promise<void> {
    try {
      // Inject styles
      this.injectStyles();

      // Create UI elements
      this.createElements();

      // Setup event listeners
      this.setupEventListeners();

      // Load saved state
      this.loadSavedState();

      // Initialize RAG system
      await this.rag.initialize(this.config.resumeUrl);

      this.isInitialized = true;

      console.log('Resume Assistant initialized successfully');
      console.log('Send button element:', this.sendButton);
      console.log('Input element:', this.input);
    } catch (error) {
      console.error('Failed to initialize Resume Assistant:', error);
      throw error;
    }
  }

  /**
   * Inject CSS styles
   */
  private injectStyles(): void {
    if (document.getElementById('resume-assistant-styles')) return;

    const style = document.createElement('style');
    style.id = 'resume-assistant-styles';
    style.textContent = `
      .resume-assistant {
        --assistant-primary: #0ea5e9;
        --assistant-secondary: #6366f1;
        --assistant-accent: #f59e0b;
        --assistant-radius: 16px;
        --assistant-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        --assistant-shadow-hover: 0 12px 40px rgba(0, 0, 0, 0.15);
        --assistant-font-size: 14px;
        --assistant-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        --assistant-glass-bg: rgba(255, 255, 255, 0.95);
        --assistant-glass-border: rgba(255, 255, 255, 0.2);
      }

      @media (prefers-color-scheme: dark) {
        .resume-assistant {
          --assistant-glass-bg: rgba(17, 24, 39, 0.95);
          --assistant-glass-border: rgba(55, 65, 81, 0.3);
        }
      }

      .resume-assistant__button {
        position: fixed;
        bottom: ${this.config.position.bottom}px;
        right: ${this.config.position.right}px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: none;
        background: var(--assistant-glass-bg);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        box-shadow: var(--assistant-shadow);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--assistant-transition);
        z-index: 10000;
        border: 1px solid var(--assistant-glass-border);
      }

      .resume-assistant__button:hover {
        transform: scale(1.05) translateY(-2px);
        box-shadow: var(--assistant-shadow-hover);
      }

      .resume-assistant__button:focus {
        outline: 2px solid var(--assistant-primary);
        outline-offset: 3px;
      }

      .resume-assistant__avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid rgba(255, 255, 255, 0.8);
      }

      .resume-assistant__panel {
        position: fixed;
        bottom: ${this.config.position.bottom + 76}px;
        right: ${this.config.position.right}px;
        width: 380px;
        max-width: calc(100vw - 48px);
        height: 550px;
        max-height: calc(100vh - 140px);
        background: var(--assistant-glass-bg);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-radius: 16px;
        box-shadow: var(--assistant-shadow);
        display: flex;
        flex-direction: column;
        opacity: 0;
        transform: translateY(20px) scale(0.95);
        transition: var(--assistant-transition);
        pointer-events: none;
        border: 1px solid var(--assistant-glass-border);
      }

      .resume-assistant__panel--open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      .resume-assistant__header {
        display: flex;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        background: linear-gradient(135deg, var(--assistant-primary), var(--assistant-secondary));
        color: white;
        border-radius: 16px 16px 0 0;
      }

      .resume-assistant__header-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 16px;
        border: 3px solid rgba(255, 255, 255, 0.8);
      }

      .resume-assistant__header-name {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .resume-assistant__header-status {
        font-size: 12px;
        opacity: 0.9;
      }

      .resume-assistant__close {
        background: none;
        border: none;
        color: white;
        font-size: 28px;
        cursor: pointer;
        padding: 8px;
        border-radius: 8px;
        transition: var(--assistant-transition);
        margin-left: auto;
      }

      .resume-assistant__close:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .resume-assistant__messages {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .resume-assistant__message {
        display: flex;
        flex-direction: column;
        max-width: 85%;
      }

      .resume-assistant__message--user {
        align-self: flex-end;
        align-items: flex-start;
      }

      .resume-assistant__message--assistant {
        align-self: flex-start;
        align-items: flex-start;
      }

      .resume-assistant__message-bubble {
        padding: 14px 18px;
        border-radius: 16px;
        word-wrap: break-word;
        white-space: pre-wrap;
      }

      .resume-assistant__message--user .resume-assistant__message-bubble {
        background: linear-gradient(135deg, var(--assistant-primary), var(--assistant-secondary));
        color: white;
      }

      .resume-assistant__message--assistant .resume-assistant__message-bubble {
        background: rgba(255, 255, 255, 0.9);
        color: #374151;
      }

      .resume-assistant__message-time {
        font-size: 11px;
        color: rgba(107, 114, 128, 0.8);
        margin-top: 6px;
      }

      .resume-assistant__citation {
        background: none;
        border: 1px solid var(--assistant-primary);
        color: var(--assistant-primary);
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        cursor: pointer;
        transition: var(--assistant-transition);
        margin: 0 2px;
      }

      .resume-assistant__citation:hover {
        background: var(--assistant-primary);
        color: white;
      }

      .resume-assistant__input-area {
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        background: rgba(255, 255, 255, 0.8);
        border-radius: 0 0 16px 16px;
      }

      .resume-assistant__quick-chips {
        display: flex;
        gap: 8px;
        padding: 16px 20px;
        flex-wrap: wrap;
      }

      .resume-assistant__chip {
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 20px;
        padding: 8px 16px;
        font-size: 13px;
        cursor: pointer;
        transition: var(--assistant-transition);
      }

      .resume-assistant__chip:hover {
        background: var(--assistant-primary);
        color: white;
      }

      .resume-assistant__input-container {
        display: flex;
        padding: 16px 20px;
        gap: 12px;
      }

      .resume-assistant__input {
        flex: 1;
        padding: 12px 16px;
        border: 2px solid rgba(0, 0, 0, 0.1);
        border-radius: 24px;
        outline: none;
        transition: var(--assistant-transition);
      }

      .resume-assistant__input:focus {
        border-color: var(--assistant-primary);
      }

      .resume-assistant__send {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: none;
        background: var(--assistant-primary);
        color: white;
        cursor: pointer;
        transition: var(--assistant-transition);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        line-height: 1;
      }

  .resume-assistant__send:hover:not([aria-disabled="true"]) {
        transform: scale(1.05);
        background: var(--assistant-secondary);
      }

  .resume-assistant__send[aria-disabled="true"] {
        opacity: 0.5;
        cursor: not-allowed;
        background: var(--assistant-primary);
      }

  .resume-assistant__send[aria-disabled="true"]:hover {
        transform: none;
        background: var(--assistant-primary);
      }

      .resume-assistant__send::before,
      .resume-assistant__send::after {
        display: none !important;
      }

      .resume-assistant__send::-webkit-validation-bubble,
      .resume-assistant__send::-webkit-validation-bubble-message {
        display: none;
      }

      /* Suppress potential validation bubbles on input as well */
      .resume-assistant__input::-webkit-validation-bubble,
      .resume-assistant__input::-webkit-validation-bubble-message {
        display: none;
      }

      @media (max-width: 480px) {
        .resume-assistant__panel {
          width: calc(100vw - 32px);
          height: 75vh;
          bottom: 90px;
          right: 16px;
        }

        .resume-assistant__button {
          bottom: 20px;
          right: 20px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .resume-assistant__button,
        .resume-assistant__panel,
        .resume-assistant__close,
        .resume-assistant__chip,
        .resume-assistant__send,
        .resume-assistant__citation {
          transition: none;
        }

        .resume-assistant__button:hover {
          transform: none;
        }

  .resume-assistant__send:hover:not([aria-disabled="true"]) {
          transform: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Create UI elements
   */
  private createElements(): void {
    const container = document.querySelector(this.config.container);
    if (!container) {
      throw new Error(`Container element "${this.config.container}" not found`);
    }

    // Create wrapper
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'resume-assistant';

    // Create button
    this.button = document.createElement('div');
    this.button.innerHTML = templates.floatingButton(this.config.avatarUrl, this.config.displayName);
    this.button = this.button.firstElementChild as HTMLElement;

    // Create panel
    const panelDiv = document.createElement('div');
    panelDiv.innerHTML = templates.chatPanel(this.config.displayName, this.config.avatarUrl);
    this.panel = panelDiv.firstElementChild as HTMLElement;

    // Get references to interactive elements
    this.messagesContainer = this.panel.querySelector('.resume-assistant__messages') as HTMLElement;
    this.input = this.panel.querySelector('.resume-assistant__input') as HTMLInputElement;
    this.sendButton = this.panel.querySelector('.resume-assistant__send') as HTMLButtonElement;

    // Ensure initial disabled state is consistent
    if (this.sendButton) {
      this.sendButton.setAttribute('aria-disabled', this.input && this.input.value.trim() ? 'false' : 'true');
    }

    // Add to DOM
    this.wrapper.appendChild(this.button);
    this.wrapper.appendChild(this.panel);
    container.appendChild(this.wrapper);
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.button || !this.panel || !this.input || !this.sendButton) return;

    // Button click
    this.button.addEventListener('click', () => this.toggle());

    // Close button
    const closeButton = this.panel.querySelector('.resume-assistant__close') as HTMLElement;
    closeButton.addEventListener('click', () => this.close());

  // Input handling
    this.input.addEventListener('input', () => {
      if (this.sendButton && this.input) {
        const hasText = this.input.value.trim().length > 0;
    this.sendButton.setAttribute('aria-disabled', hasText ? 'false' : 'true');
    this.sendButton.title = hasText ? 'Send message' : 'Type a message to enable sending';
      }
    });

    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    this.sendButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.sendButton?.getAttribute('aria-disabled') !== 'true') {
        this.sendMessage();
      }
    });

    // Form submit (prevents native validation bubbles)
    const form = this.panel.querySelector('.resume-assistant__input-container') as HTMLFormElement | null;
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (this.sendButton?.getAttribute('aria-disabled') !== 'true') {
          this.sendMessage();
        }
      });
    }

    // Quick chips
    const chips = this.panel.querySelectorAll('.resume-assistant__chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const question = chip.getAttribute('data-question');
        if (question) {
          this.askQuestion(question);
        }
      });
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (this.wrapper && !this.wrapper.contains(e.target as Node) && this.isOpen) {
        this.close();
      }
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Voice controls (if enabled)
    if (this.voiceEnabled) {
      this.setupVoiceControls();
    }
  }

  /**
   * Setup voice controls
   */
  private setupVoiceControls(): void {
    if (!this.panel) return;

    const inputContainer = this.panel.querySelector('.resume-assistant__input-container');
    if (!inputContainer) return;

    const voiceControls = document.createElement('div');
    voiceControls.innerHTML = templates.voiceControls();
    inputContainer.appendChild(voiceControls);

    const voiceToggle = voiceControls.querySelector('.resume-assistant__voice-toggle') as HTMLButtonElement;
    const micButton = voiceControls.querySelector('.resume-assistant__mic') as HTMLButtonElement;

    if (voiceToggle) {
      voiceToggle.addEventListener('click', () => {
        this.voiceEnabled = !this.voiceEnabled;
        voiceToggle.textContent = this.voiceEnabled ? '🔊' : '🔇';
      });
    }

    if (micButton) {
      micButton.addEventListener('click', () => {
        this.startVoiceRecognition();
      });
    }
  }

  /**
   * Toggle panel visibility
   */
  private toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Open the panel
   */
  private open(): void {
    if (!this.panel) return;

    this.isOpen = true;
    this.panel.classList.add('resume-assistant__panel--open');
    this.saveState();

    if (this.input) {
      this.input.focus();
    }

    // Setup focus trap
    this.setupFocusTrap();
  }

  /**
   * Close the panel
   */
  private close(): void {
    if (!this.panel || !this.button) return;

    this.isOpen = false;
    this.panel.classList.remove('resume-assistant__panel--open');
    this.saveState();

    this.button.focus();

    // Remove focus trap
    this.removeFocusTrap();
  }

  /**
   * Setup focus trap for accessibility
   */
  private setupFocusTrap(): void {
    if (!this.panel) return;

    const focusableElements = this.panel.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      this.firstFocusableElement = focusableElements[0] as HTMLElement;
      this.lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      this.panel.addEventListener('keydown', this.handleFocusTrap);
    }
  }

  /**
   * Remove focus trap
   */
  private removeFocusTrap(): void {
    if (!this.panel) return;
    this.panel.removeEventListener('keydown', this.handleFocusTrap);
  }

  /**
   * Handle focus trap navigation
   */
  private handleFocusTrap = (e: KeyboardEvent): void => {
    if (!this.firstFocusableElement || !this.lastFocusableElement) return;

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === this.firstFocusableElement) {
          e.preventDefault();
          this.lastFocusableElement.focus();
        }
      } else {
        if (document.activeElement === this.lastFocusableElement) {
          e.preventDefault();
          this.firstFocusableElement.focus();
        }
      }
    }
  };

  private firstFocusableElement: HTMLElement | null = null;
  private lastFocusableElement: HTMLElement | null = null;

  /**
   * Send a message
   */
  private async sendMessage(): Promise<void> {
    if (!this.input || !this.input.value.trim() || !this.isInitialized) return;

    const message = this.input.value.trim();
    this.input.value = '';
    if (this.sendButton) {
  this.sendButton.setAttribute('aria-disabled', 'true');
  this.sendButton.title = 'Type a message to enable sending';
    }

    await this.processQuestion(message);
  }

  /**
   * Ask a question programmatically
   */
  async askQuestion(question: string): Promise<void> {
    if (!this.isInitialized) {
      console.warn('Resume Assistant not yet initialized');
      return;
    }

    await this.processQuestion(question);

    if (!this.isOpen) {
      this.open();
    }
  }

  /**
   * Process a question and generate response
   */
  private async processQuestion(question: string): Promise<void> {
    // Add user message
    this.addMessage(question, true);

    // Show loading indicator
    this.showLoadingIndicator();

    try {
      // Search for relevant chunks
      const searchResults = await this.rag.search(question);

      if (searchResults.length === 0) {
        this.hideLoadingIndicator();
        this.addMessage("I'm sorry, I couldn't find relevant information about that in the resume. Could you try rephrasing your question?", false);
        this.showSuggestions();
        return;
      }

      // Generate answer
      const answer = this.rag.generateAnswer(question, searchResults);

      this.hideLoadingIndicator();

      // Add assistant message with citations
      this.addMessageWithCitations(answer.answer, false, answer.citations);

      // Speak if voice is enabled
      if (this.voiceEnabled && 'speechSynthesis' in window) {
        this.speak(answer.answer);
      }

      // Show suggestions if confidence is low
      if (answer.confidence < 0.7) {
        this.showSuggestions();
      }

    } catch (error) {
      console.error('Error processing question:', error);
      this.hideLoadingIndicator();
      this.addMessage("I encountered an error while processing your question. Please try again.", false);
    }
  }

  /**
   * Add a message to the chat
   */
  private addMessage(content: string, isUser: boolean): void {
    if (!this.messagesContainer) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const messageHTML = templates.message(content, isUser, timestamp);

    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = messageHTML;
    this.messagesContainer.appendChild(messageDiv);

    // Scroll to bottom
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

    this.messages.push({ content, isUser, timestamp });
  }

  /**
   * Add a message with citations
   */
  private addMessageWithCitations(content: string, isUser: boolean, citations: string[] = []): void {
    if (!this.messagesContainer) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add citations to content
    let contentWithCitations = content;
    if (citations.length > 0) {
      const citationHTML = citations.map(citation => {
        const section = citation.split('_')[0];
        return templates.citation(citation, section);
      }).join(' ');
      contentWithCitations += `\n\n${citationHTML}`;
    }

    const messageHTML = templates.message(contentWithCitations, isUser, timestamp);

    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = messageHTML;
    this.messagesContainer.appendChild(messageDiv);

    // Add citation click handlers
    const citationButtons = messageDiv.querySelectorAll('.resume-assistant__citation');
    citationButtons.forEach(button => {
      button.addEventListener('click', () => {
        const citationId = button.getAttribute('data-citation');
        if (citationId) {
          this.scrollToCitation(citationId);
        }
      });
    });

    // Scroll to bottom
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

    this.messages.push({ content: contentWithCitations, isUser, timestamp, citations });
  }

  /**
   * Scroll to a citation in the messages
   */
  private scrollToCitation(citationId: string): void {
    // This would scroll to the relevant part of the resume
    // For now, just log it
    console.log('Scrolling to citation:', citationId);
  }

  /**
   * Show loading indicator
   */
  private showLoadingIndicator(): void {
    if (!this.messagesContainer) return;

    const loadingDiv = document.createElement('div');
    loadingDiv.innerHTML = templates.loadingIndicator();
    loadingDiv.id = 'loading-indicator';
    this.messagesContainer.appendChild(loadingDiv);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  /**
   * Hide loading indicator
   */
  private hideLoadingIndicator(): void {
    if (!this.messagesContainer) return;

    const loadingIndicator = this.messagesContainer.querySelector('#loading-indicator');
    if (loadingIndicator) {
      this.messagesContainer.removeChild(loadingIndicator);
    }
  }

  /**
   * Show suggestion buttons
   */
  private showSuggestions(): void {
    if (!this.messagesContainer) return;

    const suggestions = [
      "What are your top skills?",
      "Tell me about your experience",
      "What are your latest projects?",
      "How can I contact you?"
    ];

    const suggestionsHTML = templates.suggestions(suggestions);
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.innerHTML = suggestionsHTML;
    this.messagesContainer.appendChild(suggestionsDiv);

    // Add click handlers
    const suggestionButtons = suggestionsDiv.querySelectorAll('.resume-assistant__suggestion');
    suggestionButtons.forEach(button => {
      button.addEventListener('click', () => {
        const question = button.getAttribute('data-question');
        if (question) {
          this.askQuestion(question);
        }
        // Remove suggestions after clicking
        if (suggestionsDiv.parentNode) {
          suggestionsDiv.parentNode.removeChild(suggestionsDiv);
        }
      });
    });

    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  /**
   * Speak text using Web Speech API
   */
  private speak(text: string): void {
    if (!('speechSynthesis' in window)) return;

    // Stop current speech
    if (this.currentSpeech) {
      window.speechSynthesis.cancel();
    }

    this.currentSpeech = new SpeechSynthesisUtterance(text);
    this.currentSpeech.rate = 0.9;
    this.currentSpeech.pitch = 1;

    // Use a more natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice =>
      voice.name.includes('Female') || voice.name.includes('Samantha') || voice.lang.startsWith('en')
    );
    if (preferredVoice) {
      this.currentSpeech.voice = preferredVoice;
    }

    window.speechSynthesis.speak(this.currentSpeech);
  }

  /**
   * Start voice recognition
   */
  private startVoiceRecognition(): void {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      if (this.input) {
        this.input.value = transcript;
        if (this.sendButton) {
          this.sendButton.setAttribute('aria-disabled', 'false');
          this.sendButton.title = 'Send message';
        }
        this.input.focus();
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.start();
  }

  /**
   * Save panel state to localStorage
   */
  private saveState(): void {
    try {
      localStorage.setItem('resume-assistant-open', this.isOpen.toString());
    } catch (error) {
      console.warn('Failed to save assistant state:', error);
    }
  }

  /**
   * Load saved state from localStorage
   */
  private loadSavedState(): void {
    try {
      const wasOpen = localStorage.getItem('resume-assistant-open') === 'true';
      if (wasOpen) {
        this.open();
      }
    } catch (error) {
      console.warn('Failed to load assistant state:', error);
    }
  }

  /**
   * Destroy the assistant and clean up
   */
  destroy(): void {
    if (this.currentSpeech) {
      window.speechSynthesis.cancel();
    }

    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper);
    }

    // Remove event listeners
    document.removeEventListener('click', this.handleClickOutside);
    document.removeEventListener('keydown', this.handleEscape);
  }

  private handleClickOutside = (e: Event): void => {
    if (this.wrapper && !this.wrapper.contains(e.target as Node) && this.isOpen) {
      this.close();
    }
  };

  private handleEscape = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && this.isOpen) {
      this.close();
    }
  };
}

// Global initialization function
declare global {
  interface Window {
    ResumeAssistant: {
      init: (config?: AssistantConfig) => Promise<ResumeAssistant>;
      ask: (question: string) => void;
    };
  }
}

window.ResumeAssistant = {
  init: async (config: AssistantConfig = {}) => {
    const assistant = new ResumeAssistant(config);
    await assistant.initialize();
    return assistant;
  },

  ask: () => {
    // This would need a reference to the current instance
    console.log('Ask method called, but instance not available. Use the returned instance from init().');
  }
};

export default ResumeAssistant;
