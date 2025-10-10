/**
 * Assistant Widget - Main Implementation
 * A production-ready chat assistant widget with local knowledge base
 */

import { templates } from './assistant-html-template.js';

class AssistantWidget {
  constructor(options = {}) {
    this.options = {
      container: 'body',
      position: { bottom: 20, right: 20 },
      avatarUrl: '/assets/avatar.png',
      agentName: 'Vardhan',
      theme: 'auto',
      kbUrl: '/src/assistant-widget/kb-user.json',
      enableVoice: false,
      showButton: true,
      launcherHint: 'Chat about Vardhan',
      ...options
    };

    this.knowledgeBase = null;
    this.isOpen = false;
    this.messages = [];
    this.isInitialized = false;
    this.voiceEnabled = this.options.enableVoice && this.checkVoiceSupport();
    this.currentSpeech = null;

    this.init();
  }

  async init() {
    try {
      // Load knowledge base
      await this.loadKnowledgeBase();

      // Inject styles
      this.injectStyles();

      // Create elements
      this.createElements();

      // Setup event listeners
      this.setupEventListeners();

      // Load saved state
      this.loadSavedState();

      // Mark as initialized
      this.isInitialized = true;

      // Show greeting if no messages
      if (this.messages.length === 0) {
        this.showGreeting();
      }
    } catch (error) {
      console.error('Failed to initialize Assistant Widget:', error);
    }
  }

  async loadKnowledgeBase() {
    try {
      console.log('Loading knowledge base from:', this.options.kbUrl);
      const response = await fetch(this.options.kbUrl);
      console.log('Knowledge base response status:', response.status);
      this.knowledgeBase = await response.json();
      console.log('Knowledge base loaded:', Object.keys(this.knowledgeBase));
    } catch (error) {
      console.error('Failed to load knowledge base:', error);
      // Fallback knowledge base
      this.knowledgeBase = {
        profile: { fullName: this.options.agentName },
        faqs: []
      };
    }
  }

  injectStyles() {
    if (document.getElementById('assistant-widget-styles')) return;

    const style = document.createElement('style');
    style.id = 'assistant-widget-styles';
    style.textContent = `
      .assistant-widget {
        --assistant-accent: #0ea5e9;
        --assistant-radius: 12px;
        --assistant-spacing: 16px;
        --assistant-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        --assistant-font-size: 14px;
        --assistant-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @media (prefers-color-scheme: dark) {
        .assistant-widget {
          --assistant-accent: #38bdf8;
        }
      }

      .assistant-widget__launcher {
        position: fixed;
        bottom: ${this.options.position.bottom}px;
        right: ${this.options.position.right}px;
        display: flex;
        align-items: center;
        flex-direction: row-reverse;
        gap: 14px;
        z-index: 10000;
      }

      .assistant-widget__button {
        position: relative;
        bottom: 0;
        right: 0;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        border: none;
        background: white;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        isolation: isolate;
      }

      .assistant-widget__button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
      }

      .assistant-widget__launcher-hint {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.95);
        color: #312e81;
        font-size: 13px;
        font-weight: 500;
        line-height: 1.3;
        box-shadow: 0 10px 32px rgba(76, 29, 149, 0.15);
        pointer-events: none;
        transition: opacity 0.3s ease, transform 0.3s ease;
        white-space: nowrap;
      }

      .assistant-widget__launcher-hint::after {
        content: '';
        position: absolute;
        right: -6px;
        top: 50%;
        width: 12px;
        height: 12px;
        background: rgba(255, 255, 255, 0.95);
        transform: translateY(-50%) rotate(45deg);
        box-shadow: 0 10px 32px rgba(76, 29, 149, 0.1);
      }

      .assistant-widget--dark .assistant-widget__launcher-hint {
        background: rgba(15, 23, 42, 0.9);
        color: #e0e7ff;
        box-shadow: 0 10px 32px rgba(14, 165, 233, 0.18);
      }

      .assistant-widget--dark .assistant-widget__launcher-hint::after {
        background: rgba(15, 23, 42, 0.9);
        box-shadow: 0 10px 32px rgba(14, 165, 233, 0.12);
      }

      .assistant-widget--open .assistant-widget__launcher-hint {
        opacity: 0;
        transform: translateX(8px);
      }

      .assistant-widget__button:focus {
        outline: 2px solid var(--assistant-accent);
        outline-offset: 2px;
      }

      .assistant-widget__avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
      }

      .assistant-widget__panel {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 350px;
        max-width: calc(100vw - 40px);
        height: 500px;
        max-height: calc(100vh - 120px);
        background: #ffffff;
        border: 1px solid rgba(0, 0, 0, 0.06);
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        display: flex;
        flex-direction: column;
        opacity: 0;
        transform: translateY(20px) scale(0.95);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        z-index: 10001;
      }

      @media (prefers-color-scheme: dark) {
        .assistant-widget__panel {
          background: #111827;
          border-color: rgba(255, 255, 255, 0.08);
        }
      }

      .assistant-widget__panel--open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      .assistant-widget__header {
        display: flex;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        background: linear-gradient(135deg, var(--assistant-accent), #3b82f6);
        color: #ffffff;
        border-radius: 16px 16px 0 0;
      }

      .assistant-widget__header-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        margin-right: 12px;
      }

      .assistant-widget__header-name {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .assistant-widget__header-status {
        font-size: 12px;
        opacity: 0.8;
      }

      .assistant-widget__close {
        background: none;
        border: none;
        color: #ffffff;
        font-size: 24px;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        margin-left: auto;
      }

      .assistant-widget__close:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .assistant-widget__messages {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .assistant-widget__message {
        display: flex;
        flex-direction: column;
        max-width: 80%;
      }

      .assistant-widget__message--user {
        align-self: flex-end;
        align-items: flex-start;
      }

      .assistant-widget__message--assistant {
        align-self: flex-start;
        align-items: flex-start;
      }

      .assistant-widget__message-bubble {
        padding: 12px 16px;
        border-radius: 12px;
        word-wrap: break-word;
        white-space: pre-wrap;
      }

      .assistant-widget__message--user .assistant-widget__message-bubble {
        background: var(--assistant-accent);
        color: white;
      }

      .assistant-widget__message--assistant .assistant-widget__message-bubble {
        background: #ffffff;
        border: 1px solid rgba(0, 0, 0, 0.06);
        color: #374151;
      }

      @media (prefers-color-scheme: dark) {
        .assistant-widget__message--assistant .assistant-widget__message-bubble {
          background: rgba(55, 65, 81, 1);
          color: #e5e7eb;
          border-color: rgba(255, 255, 255, 0.1);
        }
      }

      .assistant-widget__input-area {
        border-top: 1px solid rgba(0, 0, 0, 0.06);
        background: #f8fafc;
        border-radius: 0 0 16px 16px;
      }

      @media (prefers-color-scheme: dark) {
        .assistant-widget__input-area {
          background: rgba(17, 24, 39, 1);
          border-top-color: rgba(255, 255, 255, 0.08);
        }
      }

      .assistant-widget__quick-chips {
        display: flex;
        gap: 8px;
        padding: 12px 16px;
        flex-wrap: wrap;
      }

      .assistant-widget__chip {
        background: white;
        border: 1px solid #d1d5db;
        border-radius: 20px;
        padding: 6px 12px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .assistant-widget__chip:hover {
        background: var(--assistant-accent);
        color: white;
        border-color: var(--assistant-accent);
      }

      .assistant-widget__input-container {
        display: flex;
        padding: 12px 16px;
        gap: 8px;
      }

      .assistant-widget__input {
        flex: 1;
        padding: 10px 16px;
        border: 1px solid #d1d5db;
        border-radius: 24px;
        outline: none;
        font-size: 14px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .assistant-widget__input:focus {
        border-color: var(--assistant-accent);
        box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
      }

      .assistant-widget__send {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        background: var(--assistant-accent);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-size: 16px;
      }

      .assistant-widget__send:hover:not(:disabled) {
        background: #0284c7;
        transform: scale(1.05);
      }

      .assistant-widget__send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      @media (max-width: 480px) {
        .assistant-widget__panel {
          width: calc(100vw - 32px);
          height: 70vh;
          bottom: 80px;
          right: 16px;
        }

        .assistant-widget__launcher {
          bottom: 16px;
          right: 16px;
        }

        .assistant-widget__launcher-hint {
          display: none;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .assistant-widget__button,
        .assistant-widget__panel,
        .assistant-widget__close,
        .assistant-widget__chip,
        .assistant-widget__send {
          transition: none;
        }

        .assistant-widget__button:hover {
          transform: none;
        }

        .assistant-widget__send:hover:not(:disabled) {
          transform: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  createElements() {
    const container = document.querySelector(this.options.container);

    // Create wrapper
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'assistant-widget';
    if (this.options.theme === 'dark' || (this.options.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.wrapper.classList.add('assistant-widget--dark');
    }

    // Create button (optional)
    if (this.options.showButton) {
      this.button = document.createElement('div');
      this.button.innerHTML = templates.floatingButton(
        this.options.avatarUrl,
        this.options.agentName,
        this.options.launcherHint
      );
      this.buttonElement = this.button.querySelector('.assistant-widget__button');
      this.launcherHintElement = this.button.querySelector('.assistant-widget__launcher-hint');
    }

    // Create panel
  this.panel = document.createElement('div');
  this.panel.innerHTML = templates.chatPanel(this.options.agentName, this.options.avatarUrl);
  this.panelElement = this.panel.querySelector('.assistant-widget__panel');
  this.messagesContainer = this.panelElement?.querySelector('.assistant-widget__messages');
  this.input = this.panelElement?.querySelector('.assistant-widget__input');
  this.sendButton = this.panelElement?.querySelector('.assistant-widget__send');

  // Add to DOM
    if (this.buttonElement) {
      const launcherContainer = document.createElement('div');
      launcherContainer.className = 'assistant-widget__launcher';
      launcherContainer.appendChild(this.buttonElement);

      if (!this.launcherHintElement) {
        this.launcherHintElement = document.createElement('div');
        this.launcherHintElement.className = 'assistant-widget__launcher-hint';
        this.launcherHintElement.textContent = this.options.launcherHint;
      }

      const hintId = `assistant-widget-hint-${Math.random().toString(36).slice(2, 9)}`;
      this.launcherHintElement.id = hintId;
      this.buttonElement.setAttribute('aria-describedby', hintId);

      this.buttonElement.style.pointerEvents = 'auto';
      this.launcherHintElement.style.pointerEvents = 'none';

      launcherContainer.appendChild(this.launcherHintElement);
      this.wrapper.appendChild(launcherContainer);
      this.launcherContainer = launcherContainer;
    }
    if (this.panelElement) this.wrapper.appendChild(this.panelElement);
    container.appendChild(this.wrapper);
  }

  setupEventListeners() {
    if (!this.buttonElement || !this.panelElement || !this.input || !this.sendButton) {
      console.warn('AssistantWidget: missing key elements; event listeners not attached');
      return;
    }

  // Button click
  if (this.buttonElement) this.buttonElement.addEventListener('click', () => this.toggle());

    // Close button
    const closeButton = this.panelElement.querySelector('.assistant-widget__close');
    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Close button clicked'); // Debug
        this.close();
      });
      closeButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Close button touched'); // Debug
        this.close();
      });
    } else {
      console.warn('Close button not found');
    }

    // Input handling
    this.input.addEventListener('input', () => {
      const hasText = this.input.value.trim().length > 0;
      this.sendButton.setAttribute('aria-disabled', hasText ? 'false' : 'true');
      this.sendButton.title = hasText ? 'Send message' : 'Type a message to enable sending';
    });

    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    this.sendButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.sendButton.getAttribute('aria-disabled') !== 'true') this.sendMessage();
    });

    // Form submit
    const form = this.panelElement.querySelector('.assistant-widget__input-container');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (this.sendButton.getAttribute('aria-disabled') !== 'true') this.sendMessage();
      });
    }

    // Quick chips
  const chips = this.panelElement.querySelectorAll('.assistant-widget__chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const question = chip.dataset.question;
        this.askQuestion(question);
      });
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!this.wrapper.contains(e.target) && this.isOpen) {
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

  setupVoiceControls() {
  if (!this.panelElement) return;
  const voiceControls = document.createElement('div');
  voiceControls.innerHTML = templates.voiceControls();
  const inputContainer = this.panelElement.querySelector('.assistant-widget__input-container');
  if (!inputContainer) return;
  inputContainer.appendChild(voiceControls);

    const voiceToggle = voiceControls.querySelector('.assistant-widget__voice-toggle');
    const micButton = voiceControls.querySelector('.assistant-widget__mic');

    if (voiceToggle) voiceToggle.addEventListener('click', () => {
      this.voiceEnabled = !this.voiceEnabled;
      voiceToggle.textContent = this.voiceEnabled ? '🔊' : '🔇';
    });

    if (micButton) micButton.addEventListener('click', () => {
      this.startVoiceRecognition();
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    if (this.panelElement) this.panelElement.classList.add('assistant-widget__panel--open');
    if (this.wrapper) this.wrapper.classList.add('assistant-widget--open');
    this.saveState();
    this.input.focus();

    // Focus trap
    this.setupFocusTrap();

    // Dispatch lifecycle event
    try {
      window.dispatchEvent(new CustomEvent('assistant:open'));
    } catch { /* no-op */ }

    // Show greeting if no messages yet
    if (this.messages.length === 0) {
      this.showGreeting();
    }
  }

  close() {
    this.isOpen = false;
    if (this.panelElement) this.panelElement.classList.remove('assistant-widget__panel--open');
    if (this.wrapper) this.wrapper.classList.remove('assistant-widget--open');
    this.saveState();
  try { this.buttonElement?.focus?.(); } catch {}

    // Remove focus trap
    this.removeFocusTrap();

    // Dispatch lifecycle event
    try {
      window.dispatchEvent(new CustomEvent('assistant:close'));
    } catch { /* no-op */ }
  }

  setupFocusTrap() {
    const focusableElements = this.panelElement?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements && focusableElements.length) {
      this.firstFocusableElement = focusableElements[0];
      this.lastFocusableElement = focusableElements[focusableElements.length - 1];
      this.panelElement.addEventListener('keydown', this.handleFocusTrap);
    }
  }

  removeFocusTrap() {
  if (this.panelElement) this.panelElement.removeEventListener('keydown', this.handleFocusTrap);
  }

  handleFocusTrap = (e) => {
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

  sendMessage() {
    const message = this.input.value.trim();
  if (!message) return;

    this.addMessage(message, true);
    this.input.value = '';
  this.sendButton.setAttribute('aria-disabled', 'true');
  this.sendButton.title = 'Type a message to enable sending';

    // Process the question
    this.processQuestion(message);
  }

  askQuestion(question) {
    this.addMessage(question, true);
    this.processQuestion(question);
  }

  addMessage(content, isUser = false) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const messageHTML = templates.message(content, isUser, timestamp);

    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = messageHTML;
    this.messagesContainer.appendChild(messageDiv);

    // Scroll to bottom
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

    this.messages.push({ content, isUser, timestamp });

    // Emit event for new assistant answers (not for user messages)
    if (!isUser) {
      try {
        window.dispatchEvent(new CustomEvent('assistant:new-answer', { detail: { content, timestamp } }));
      } catch { /* no-op */ }
    }
  }

  async processQuestion(question) {
    console.log('Processing question:', question); // Debug
    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.innerHTML = templates.message('Typing...', false);
    this.messagesContainer.appendChild(typingDiv);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

    try {
      // Process the question
      const answer = await this.findAnswer(question);
      console.log('Answer found:', answer); // Debug

      // Remove typing indicator
      this.messagesContainer.removeChild(typingDiv);

      // Add answer
      this.addMessage(answer);

      // Speak if voice is enabled
      if (this.voiceEnabled && window.speechSynthesis) {
        this.speak(answer);
      }
    } catch (error) {
      console.error('Error processing question:', error);
      // Remove typing indicator
      if (typingDiv.parentNode) {
        this.messagesContainer.removeChild(typingDiv);
      }
      this.addMessage("I'm sorry, I encountered an error while processing your question.");
    }
  }

  async findAnswer(question) {
    console.log('Finding answer for:', question, 'KB:', this.knowledgeBase); // Debug
    if (!this.knowledgeBase) {
      return "I'm sorry, I'm having trouble accessing my knowledge base right now.";
    }

    const normalizedQuestion = this.normalizeText(question);
    console.log('Normalized question:', normalizedQuestion); // Debug

    // Exact match on FAQs
    for (const faq of this.knowledgeBase.faqs) {
      if (this.normalizeText(faq.q) === normalizedQuestion) {
        return faq.a;
      }
    }

    // Fuzzy matching on FAQs (moved up before keyword matching)
    const bestMatch = this.findBestMatch(normalizedQuestion, this.knowledgeBase.faqs);
    if (bestMatch.score > 0.3) {
      return bestMatch.faq.a;
    }

    // Keyword matching (moved down after FAQ matching)
    const keywords = normalizedQuestion.split(' ').filter(word => word.length > 1);

    // Helper: exact keyword presence (no substring to avoid collisions like age vs advantage)
    const hasAny = (words, terms) => words.some(w => terms.includes(w));

    // Check skills
    if (hasAny(keywords, ['skill', 'skills', 'technology', 'technologies', 'tech', 'stack', 'expertise'])) {
      const skillsList = Array.isArray(this.knowledgeBase.skills)
        ? this.knowledgeBase.skills
        : (Array.isArray(this.knowledgeBase.technicalSkills) ? this.knowledgeBase.technicalSkills : []);
      if (skillsList.length > 0) {
        return `My key skills include: ${skillsList.join(', ')}`;
      }
    }

    // Check experience
    if (hasAny(keywords, ['experience', 'work', 'job', 'career', 'background'])) {
      return `My professional experience includes: ${this.knowledgeBase.experience.join('. ')}`;
    }

    // Check education
    if (hasAny(keywords, ['education', 'degree', 'degrees', 'university', 'college', 'study', 'studies'])) {
      return `My educational background: ${this.knowledgeBase.education.join('. ')}`;
    }

    // Check projects
    if (hasAny(keywords, ['project', 'projects', 'portfolio', 'built', 'created'])) {
      return `Some of my key projects: ${this.knowledgeBase.projects.join('. ')}`;
    }

    // Check strengths
    if (hasAny(keywords, ['strength', 'strengths', 'good', 'best', 'advantages', 'strong'])) {
      return `My strengths are: ${this.knowledgeBase.strengths.join(', ')}`;
    }

    // Check weaknesses
    if (hasAny(keywords, ['weakness', 'weaknesses', 'bad', 'improvement', 'improvements', 'challenge', 'challenges', 'weak'])) {
      return `Areas I'm working on: ${this.knowledgeBase.weaknesses.join(', ')}`;
    }

    // Check contact info
    if (hasAny(keywords, ['contact', 'email', 'phone', 'reach', 'connect'])) {
      return `You can contact me at ${this.knowledgeBase.contact.email} or call ${this.knowledgeBase.contact.phone}. I'm located in ${this.knowledgeBase.contact.location}.`;
    }

    // Resume / CV
    if (hasAny(keywords, ['resume', 'cv'])) {
      const resumeUrl = this.knowledgeBase.resumeUrl || '/resume.pdf';
      return `You can view or download my resume here: <a href="${resumeUrl}" target="_blank" rel="noopener noreferrer">resume.pdf</a>.`;
    }

    // Personal details (answer concisely using provided profile when asked directly)
  if (hasAny(keywords, ['gender', 'sex'])) {
      const g = this.knowledgeBase.personal?.gender || 'Prefer not to say';
      return `Gender: ${g}.`;
    }
    if (hasAny(keywords, ['orientation', 'sexual', 'sexuality'])) {
      const o = this.knowledgeBase.personal?.sexualOrientation || 'Prefer not to say';
      return `Orientation: ${o}.`;
    }
    if (hasAny(keywords, ['ethnicity', 'race'])) {
      const e = this.knowledgeBase.personal?.ethnicity || 'Prefer not to say';
      return `Ethnicity: ${e}.`;
    }
    if (hasAny(keywords, ['hispanic', 'latino', 'latina', 'latinx'])) {
      const h = this.knowledgeBase.personal?.hispanicOrLatino;
      return `Hispanic or Latino: ${h === true ? 'Yes' : h === false ? 'No' : 'Prefer not to say'}.`;
    }

    // Work preferences
    if (hasAny(keywords, ['relocate', 'relocation'])) {
      const r = this.knowledgeBase.workPreferences?.willingToRelocate;
      return `Willing to relocate: ${r === true ? 'Yes' : r === false ? 'No' : 'Depends'}.`;
    }
    if (hasAny(keywords, ['sponsorship', 'visa'])) {
      const s = this.knowledgeBase.workPreferences?.needsSponsorship;
      return `Needs sponsorship: ${s === true ? 'Yes' : 'No'}.`;
    }
    if (hasAny(keywords, ['salary', 'compensation', 'pay', 'rate', 'market'])) {
      const sal = this.knowledgeBase.workPreferences?.salaryExpectation || 'Competitive / market rate';
      return `Salary expectation: ${sal}.`;
    }
    if (hasAny(keywords, ['disability', 'disabled'])) {
      const d = this.knowledgeBase.workPreferences?.disabilityStatus;
      return `Disability status: ${d || 'Prefer not to say'}.`;
    }
    if (hasAny(keywords, ['veteran', 'military'])) {
      const v = this.knowledgeBase.workPreferences?.veteranStatus;
      return `Veteran: ${v === true ? 'Yes' : 'No'}.`;
    }

    // Check profile info
    if (hasAny(keywords, ['age', 'old'])) {
      return `I am ${this.knowledgeBase.profile.age} years old.`;
    }

    if (hasAny(keywords, ['location', 'live', 'based', 'from', 'where'])) {
      return `I am located in ${this.knowledgeBase.profile.location}.`;
    }

    if (hasAny(keywords, ['name', 'who', 'call', 'about'])) {
      return `My name is ${this.knowledgeBase.profile.fullName}. I am a ${this.knowledgeBase.profile.roles.join(' and ')} based in ${this.knowledgeBase.profile.location}.`;
    }

    // Check for "about me" type questions
    if (keywords.some(k => ['about', 'introduce', 'tell', 'who'].includes(k))) {
      return `Hi! I'm ${this.knowledgeBase.profile.fullName}, a ${this.knowledgeBase.profile.roles.join(' and ')} based in ${this.knowledgeBase.profile.location}. I specialize in creating high-performing digital experiences with modern technologies.`;
    }

    // Default response with contact details fallback
    const c = this.knowledgeBase.contact || {};
    const contactStr = (c.email || c.phone)
      ? ` If you'd like to reach me, email ${c.email || ''}${c.email && c.phone ? ' or call ' : ''}${c.phone || ''}.`
      : '';
    return `I may not have that answer yet.${contactStr} Try: skills, projects, experience, contact.`;
  }

  normalizeText(text) {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  findBestMatch(question, faqs) {
    let bestMatch = { faq: null, score: 0 };

    for (const faq of faqs) {
      const faqWords = this.normalizeText(faq.q).split(' ').filter(word => word.length > 2);
      const questionWords = this.normalizeText(question).split(' ').filter(word => word.length > 2);

      if (faqWords.length === 0 || questionWords.length === 0) continue;

      // Calculate Jaccard similarity
      const intersection = faqWords.filter(word => questionWords.includes(word));
      const union = [...new Set([...faqWords, ...questionWords])];
      const jaccardScore = intersection.length / union.length;

      // Also check for partial matches
      let partialMatches = 0;
      for (const qWord of questionWords) {
        for (const fWord of faqWords) {
          if (fWord.includes(qWord) || qWord.includes(fWord)) {
            partialMatches++;
            break;
          }
        }
      }
      const partialScore = partialMatches / questionWords.length;

      // Combine scores
      const combinedScore = (jaccardScore * 0.7) + (partialScore * 0.3);

      if (combinedScore > bestMatch.score) {
        bestMatch = { faq, score: combinedScore };
      }
    }

    return bestMatch;
  }

  showGreeting() {
  const hint = `Try: skills, projects, experience, resume, contact, relocation, sponsorship, salary.`;
  const greeting = `Hi! I'm ${this.knowledgeBase?.profile?.fullName || this.options.agentName}, a Full Stack Developer and AEM Specialist. I can tell you about my skills, experience, projects, and more. ${hint}`;
    setTimeout(() => {
      this.addMessage(greeting);
    }, 1000);
  }

  checkVoiceSupport() {
    return !!(window.speechSynthesis || window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  speak(text) {
    if (!window.speechSynthesis) return;

    // Stop current speech
    if (this.currentSpeech) {
      window.speechSynthesis.cancel();
    }

    this.currentSpeech = new SpeechSynthesisUtterance(text);
    this.currentSpeech.rate = 0.9;
    this.currentSpeech.pitch = 1;

    window.speechSynthesis.speak(this.currentSpeech);
  }

  startVoiceRecognition() {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      this.input.value = transcript;
      this.sendButton.disabled = false;
      this.input.focus();
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.start();
  }

  saveState() {
    localStorage.setItem('assistant-widget-open', this.isOpen.toString());
  }

  loadSavedState() {
    const wasOpen = localStorage.getItem('assistant-widget-open') === 'true';
    if (wasOpen) {
      this.open();
    }
  }

  // Public API
  ask(question) {
    if (!this.isInitialized) {
      console.warn('Assistant Widget not yet initialized');
      return;
    }

    this.askQuestion(question);
    if (!this.isOpen) {
      this.open();
    }
  }

  destroy() {
    if (this.currentSpeech) {
      window.speechSynthesis.cancel();
    }

    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper);
    }

    document.removeEventListener('click', this.handleClickOutside);
    document.removeEventListener('keydown', this.handleEscape);
  }
}

// Global initialization function
window.AssistantWidget = {
  init: (options = {}) => {
    if (window.assistantWidgetInstance) {
      window.assistantWidgetInstance.destroy();
    }

    window.assistantWidgetInstance = new AssistantWidget(options);
    return window.assistantWidgetInstance;
  },

  ask: (question) => {
    if (window.assistantWidgetInstance) {
      window.assistantWidgetInstance.ask(question);
    }
  },

  open: () => {
    if (window.assistantWidgetInstance && window.assistantWidgetInstance.open) {
      window.assistantWidgetInstance.open();
    }
  },

  close: () => {
    if (window.assistantWidgetInstance && window.assistantWidgetInstance.close) {
      window.assistantWidgetInstance.close();
    }
  },

  get isOpen() {
    return window.assistantWidgetInstance ? window.assistantWidgetInstance.isOpen : false;
  }
};

export default AssistantWidget;
