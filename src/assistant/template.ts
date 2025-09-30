/**
 * HTML Templates for Resume Assistant Widget
 */

export const templates = {
  floatingButton: (avatarUrl: string, displayName: string) => `
    <button
      class="resume-assistant__button"
      aria-label="Open ${displayName} assistant"
      type="button"
    >
      <img
        src="${avatarUrl}"
        alt="${displayName} avatar"
        class="resume-assistant__avatar"
        onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2MzY2RjEiLz4KPHBhdGggZD0iTTIwIDIwQzIyLjc2MTQgMjAgMjUgMTcuNzYxNCAyNSAxNUMyNSAxMi4yMzg2IDIyLjc2MTQgMTAgMjAgMTBDMTcuMjM4NiAxMCAxNSAxMi4yMzg2IDE1IDE1QzE1IDE3Ljc2MTQgMTcgMjAgMjBaIiBmaWxsPSIjZmZmZmZmIi8+Cjwvc3ZnPgo='"
      />
    </button>
  `,

  chatPanel: (displayName: string, avatarUrl: string) => `
    <div class="resume-assistant__panel" role="dialog" aria-labelledby="assistant-title" aria-modal="true">
      <div class="resume-assistant__header">
        <img
          src="${avatarUrl}"
          alt="${displayName} avatar"
          class="resume-assistant__header-avatar"
          onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2MzY2RjEiLz4KPHBhdGggZD0iTTE2IDE2QzE3Ljc2MTQgMTYgMTkgMTQuNzYxNCAxOSAxM0MxOSAxMS4yMzg2IDE3Ljc2MTQgMTAgMTYgMTBDMTQuMjM4NiAxMCAxMiAxMS4yMzg2IDEyIDEzQzEyIDE0Ljc2MTQgMTMgMTYgMTZaIiBmaWxsPSIjZmZmZmZmIi8+Cjwvc3ZnPgo='"
        />
        <div class="resume-assistant__header-info">
          <h3 id="assistant-title" class="resume-assistant__header-name">${displayName}</h3>
          <span class="resume-assistant__header-status">● Online</span>
        </div>
        <button
          class="resume-assistant__close"
          aria-label="Close assistant"
          type="button"
        >
          ×
        </button>
      </div>

      <div class="resume-assistant__messages" role="log" aria-live="polite" aria-label="Chat messages">
        <div class="resume-assistant__message resume-assistant__message--assistant">
          <div class="resume-assistant__message-bubble">
            Hi! I'm ${displayName}. I can answer questions about my background, skills, experience, and projects. What would you like to know?
          </div>
          <time class="resume-assistant__message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
        </div>
      </div>

  <div class="resume-assistant__input-area">
        <div class="resume-assistant__quick-chips">
          <button class="resume-assistant__chip" data-question="What are your top skills?">Skills</button>
          <button class="resume-assistant__chip" data-question="Tell me about your experience">Experience</button>
          <button class="resume-assistant__chip" data-question="What are your latest projects?">Projects</button>
          <button class="resume-assistant__chip" data-question="How can I contact you?">Contact</button>
        </div>

    <form class="resume-assistant__input-container" novalidate aria-label="Message input">
          <input
            type="text"
            class="resume-assistant__input"
            placeholder="Ask me anything..."
            aria-label="Type your question"
            autocomplete="off"
          />
          <button
            class="resume-assistant__send"
            aria-label="Send message"
      type="submit"
      aria-disabled="true"
            title="Type a message to enable sending"
          >
            ➤
          </button>
    </form>
      </div>
    </div>
  `,

  message: (content: string, isUser: boolean = false, timestamp?: string) => `
    <div class="resume-assistant__message ${isUser ? 'resume-assistant__message--user' : 'resume-assistant__message--assistant'}">
      <div class="resume-assistant__message-bubble">
        ${content}
      </div>
      ${timestamp ? `<time class="resume-assistant__message-time">${timestamp}</time>` : ''}
    </div>
  `,

  citation: (citationId: string, section: string) => `
    <button
      class="resume-assistant__citation"
      data-citation="${citationId}"
      title="View source: ${section}"
    >
      [${section}]
    </button>
  `,

  voiceControls: () => `
    <div class="resume-assistant__voice-controls">
      <button
        class="resume-assistant__voice-toggle"
        aria-label="Toggle voice responses"
        type="button"
      >
        🔊
      </button>
      <button
        class="resume-assistant__mic"
        aria-label="Voice input"
        type="button"
      >
        🎤
      </button>
    </div>
  `,

  loadingIndicator: () => `
    <div class="resume-assistant__message resume-assistant__message--assistant">
      <div class="resume-assistant__message-bubble resume-assistant__loading">
        <div class="resume-assistant__loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  `,

  suggestions: (suggestions: string[]) => `
    <div class="resume-assistant__suggestions">
      <p class="resume-assistant__suggestions-title">Try asking:</p>
      ${suggestions.map(suggestion => `
        <button class="resume-assistant__suggestion" data-question="${suggestion}">
          ${suggestion}
        </button>
      `).join('')}
    </div>
  `
};
