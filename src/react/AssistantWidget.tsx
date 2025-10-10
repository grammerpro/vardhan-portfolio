/**
 * React Wrapper for Assistant Widget
 * Provides a React component interface for the vanilla JS widget
 */

'use client';

import { useEffect, useRef } from 'react';

interface AssistantWidgetProps {
  container?: string;
  position?: { bottom: number; right: number };
  avatarUrl?: string;
  agentName?: string;
  theme?: 'light' | 'dark' | 'auto';
  kbUrl?: string;
  enableVoice?: boolean;
  showButton?: boolean;
  launcherHint?: string;
}

interface AssistantWidgetInstance {
  ask: (question: string) => void;
  destroy: () => void;
  open?: () => void;
  close?: () => void;
  isOpen?: boolean;
}

const AssistantWidget: React.FC<AssistantWidgetProps> = ({
  container = 'body',
  position = { bottom: 20, right: 20 },
  avatarUrl = '/assets/avatar.png',
  agentName = 'Vardhan',
  theme = 'auto',
  kbUrl = '/src/assistant-widget/kb-user.json',
  enableVoice = false,
  showButton = true,
  launcherHint = 'Ask Vardhan anything',
}) => {
  const widgetRef = useRef<AssistantWidgetInstance | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Find the container element
    containerRef.current = document.querySelector(container);

    if (!containerRef.current) {
      console.warn(`Container element "${container}" not found`);
      return;
    }

    // Initialize the widget
    const initWidget = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const { default: AssistantWidgetClass } = await import('../assistant-widget/index.js');

        widgetRef.current = new AssistantWidgetClass({
          container,
          position,
          avatarUrl,
          agentName,
          theme,
          kbUrl,
          enableVoice,
          showButton,
          launcherHint,
        });

        // Expose instance globally so the AvatarAssistant can control it (open/close/isOpen)
        try {
          (window as unknown as { assistantWidgetInstance?: AssistantWidgetInstance }).assistantWidgetInstance = widgetRef.current;
        } catch {}
      } catch (error) {
        console.error('Failed to initialize Assistant Widget:', error);
      }
    };

    initWidget();

    // Cleanup function
    return () => {
      if (widgetRef.current) {
        widgetRef.current.destroy();
        widgetRef.current = null;
      }
      try {
        (window as unknown as { assistantWidgetInstance?: AssistantWidgetInstance }).assistantWidgetInstance = undefined;
      } catch {}
    };
  }, [container, position, avatarUrl, agentName, theme, kbUrl, enableVoice, showButton, launcherHint]);

  // This component doesn't render anything itself - the widget handles its own DOM
  return null;
};

export default AssistantWidget;
