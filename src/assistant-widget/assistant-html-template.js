/**
 * HTML templates for the assistant widget
 */

export const templates = {
  floatingButton: (avatarUrl, agentName, launcherHint) => `
    <div class="assistant-widget__launcher-shell">
      <button
        class="assistant-widget__button"
        aria-label="Open ${agentName} assistant"
        type="button"
      >
        <img
          src="${avatarUrl}"
          alt="${agentName} avatar"
          class="assistant-widget__avatar"
          onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2MzY2RjEiLz4KPHBhdGggZD0iTTIwIDIwQzIyLjc2MTQgMjAgMjUgMTcuNzYxNCAyNSAxNUMyNSAxMi4yMzg2IDIyLjc2MTQgMTAgMjAgMTBDMTcuMjM4NiAxMCAxNSAxMi4yMzg2IDE1IDE1QzE1IDE3Ljc2MTQgMTcgMjAgMjBaIiBmaWxsPSIjZmZmZmZmIi8+Cjwvc3ZnPgo='"
        />
      </button>
      <div class="assistant-widget__launcher-hint" role="presentation">
        ${launcherHint ?? 'Ask Vardhan anything'}
      </div>
    </div>
  `,

  chatPanel: (agentName, avatarUrl) => `
    <div class="assistant-widget__panel" role="dialog" aria-labelledby="assistant-title" aria-modal="true">
      <div class="assistant-widget__header">
        <img
          src="${avatarUrl}"
          alt="${agentName} avatar"
          class="assistant-widget__header-avatar"
          onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2MzY2RjEiLz4KPHBhdGggZD0iTTE2IDE2QzE3Ljc2MTQgMTYgMTkgMTQuNzYxNCAxOSAxM0MxOSAxMS4yMzg2IDE3Ljc2MTQgMTAgMTYgMTBDMTQuMjM4NiAxMCAxMiAxMS4yMzg2IDEyIDEzQzEyIDE0Ljc2MTQgMTMgMTYgMTZaIiBmaWxsPSIjZmZmZmZmIi8+Cjwvc3ZnPgo='"
        />
        <div class="assistant-widget__header-info">
          <h3 id="assistant-title" class="assistant-widget__header-name">${agentName}</h3>
          <span class="assistant-widget__header-status">● Online</span>
        </div>
        <button
          class="assistant-widget__close"
          aria-label="Close assistant"
          type="button"
        >
          ×
        </button>
      </div>

      <div class="assistant-widget__messages" role="log" aria-live="polite" aria-label="Chat messages">
      </div>

  <div class="assistant-widget__input-area">
        <div class="assistant-widget__quick-chips">
          <button class="assistant-widget__chip" data-question="About me">About me</button>
          <button class="assistant-widget__chip" data-question="What are your top skills?">Skills</button>
          <button class="assistant-widget__chip" data-question="Tell me about your experience">Experience</button>
          <button class="assistant-widget__chip" data-question="What projects have you worked on?">Projects</button>
          <button class="assistant-widget__chip" data-question="How can I contact you?">Contact</button>
        </div>

    <form class="assistant-widget__input-container" novalidate aria-label="Message input">
          <input
            type="text"
            class="assistant-widget__input"
            placeholder="Ask me anything..."
            aria-label="Type your question"
      autocomplete="off"
          />
          <button
            class="assistant-widget__send"
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

  message: (content, isUser = false, timestamp = null) => `
    <div class="assistant-widget__message ${isUser ? 'assistant-widget__message--user' : 'assistant-widget__message--assistant'}">
      <div class="assistant-widget__message-bubble">
        ${content}
      </div>
      ${timestamp ? `<time class="assistant-widget__message-time">${timestamp}</time>` : ''}
    </div>
  `,

  voiceControls: () => `
    <div class="assistant-widget__voice-controls">
      <button
        class="assistant-widget__voice-toggle"
        aria-label="Toggle voice responses"
        type="button"
      >
        🔊
      </button>
      <button
        class="assistant-widget__mic"
        aria-label="Voice input"
        type="button"
      >
        🎤
      </button>
    </div>
  `
};
