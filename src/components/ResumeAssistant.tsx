/**
 * React Wrapper forinterface ContainerWithMethods extends HTMLDivElement {
  askQuestion?: (question: string) => void;
  toggle?: () => void;
  open?: () => void;
  close?: () => void;
}

export default function ResumeAssistant({
  config = {},
  className = '',
  onReady,
  onError
}: ResumeAssistantProps) {
  const containerRef = useRef<ContainerWithMethods>(null);
  const assistantRef = useRef<unknown>(null);Assistant Widget
 * Integrates the browser-based assistant into React applications
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import type { AssistantConfig } from '../assistant/index.js';

interface ResumeAssistantProps {
  config?: AssistantConfig;
  className?: string;
  onReady?: (assistant: unknown) => void;
  onError?: (error: Error) => void;
}

export default function ResumeAssistant({
  config = {},
  className = '',
  onReady,
  onError
}: ResumeAssistantProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const assistantRef = useRef<unknown>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeAssistant = async () => {
      try {
        // Check if the assistant script is loaded
        if (typeof window === 'undefined' || !window.ResumeAssistant) {
          throw new Error('Resume Assistant script not loaded. Make sure to include the assistant bundle.');
        }

        // Initialize the assistant
        const assistant = await window.ResumeAssistant.init({
          container: 'body',
          ...config
        });

        if (isMounted) {
          assistantRef.current = assistant as unknown;
          setIsLoaded(true);
          onReady?.(assistant as unknown);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize assistant');
        if (isMounted) {
          setError(error);
          onError?.(error);
        }
      }
    };

    initializeAssistant();

    return () => {
      isMounted = false;
      if (assistantRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (assistantRef.current as any).destroy?.();
      }
    };
  }, [config, onReady, onError]);

  // Public API methods
  const askQuestion = (question: string) => {
    if (assistantRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (assistantRef.current as any).askQuestion?.(question);
    } else {
      console.warn('Assistant not initialized yet');
    }
  };

  const toggle = () => {
    if (assistantRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (assistantRef.current as any).toggle?.();
    }
  };

  const open = () => {
    if (assistantRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (assistantRef.current as any).open?.();
    }
  };

  const close = () => {
    if (assistantRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (assistantRef.current as any).close?.();
    }
  };

  // Expose methods via ref for parent components
  useEffect(() => {
    if (containerRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (containerRef.current as any).askQuestion = askQuestion;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (containerRef.current as any).toggle = toggle;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (containerRef.current as any).open = open;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (containerRef.current as any).close = close;
    }
  }, [isLoaded]);

  if (error) {
    return (
      <div className={`resume-assistant-error ${className}`}>
        <div style={{
          padding: '16px',
          background: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626',
          fontSize: '14px'
        }}>
          <strong>Resume Assistant Error:</strong> {error.message}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`resume-assistant-wrapper ${className}`}
      style={{ position: 'relative' }}
    >
      {!isLoaded && (
        <div style={{
          position: 'fixed',
          bottom: config.position?.bottom || 24,
          right: config.position?.right || 24,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          animation: 'pulse 2s infinite'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Hook for using the assistant programmatically
export function useResumeAssistant(config?: AssistantConfig) {
  const [assistant, setAssistant] = useState<unknown>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const assistantRef = useRef<unknown>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        if (typeof window !== 'undefined' && window.ResumeAssistant) {
          const instance = await window.ResumeAssistant.init(config);
          if (mounted) {
            assistantRef.current = instance;
            setAssistant(instance);
            setIsReady(true);
            console.log('Resume Assistant React wrapper initialized successfully');
          }
        } else {
          throw new Error('ResumeAssistant not found on window object');
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize assistant');
        console.error('Resume Assistant initialization error:', error);
        if (mounted) {
          setError(error);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      if (assistantRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (assistantRef.current as any).destroy?.();
      }
    };
  }, [config]);

  const askQuestion = (question: string) => {
    if (assistant) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (assistant as any).askQuestion?.(question);
    }
  };

  const toggle = () => {
    if (assistant) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (assistant as any).toggle?.();
    }
  };

  return {
    assistant,
    isReady,
    error,
    askQuestion,
    toggle
  };
}

// Type declarations for the global ResumeAssistant are in the main index.ts file
