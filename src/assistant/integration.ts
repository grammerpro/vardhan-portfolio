// Integration bridge between AvatarAssistant and existing chat assistant

export function openExistingChat() {
  try {
    if (window.assistantWidgetInstance) {
      // Open the chat widget and focus input
      window.assistantWidgetInstance.open?.();
      // Attempt to focus input if exposed
      setTimeout(() => {
        const input = document.querySelector('.assistant-widget__input');
        (input as HTMLInputElement | null)?.focus?.();
      }, 200);
      return true;
    }
  } catch (e) {
    console.warn('[AvatarAssistant] Could not open existing chat:', e);
  }
  return false;
}

type AssistantInstance = {
  open?: () => void;
};

declare global {
  interface Window { assistantWidgetInstance?: AssistantInstance }
}
