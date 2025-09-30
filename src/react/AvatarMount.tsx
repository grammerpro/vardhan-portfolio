"use client";

import { useEffect } from "react";

type AvatarInstance = { destroy?: () => void } | null;

/**
 * Mounts the AvatarAssistant DOM widget globally at runtime.
 * Keeps it lightweight and client-only.
 */
export default function AvatarMount() {
  useEffect(() => {
  let instance: AvatarInstance = null;
    const init = () => {
      try {
        // Lazy import to avoid SSR issues and only run on client
        import("@/avatar/index").then((mod) => {
          const Avatar = mod.default;
          instance = new Avatar({
            container: "body",
            position: { right: 20, bottom: 20 },
            theme: "auto",
            avatarUrl: "/assets/avatar-standing.svg",
            patrol: true,
            bubbleHints: true,
            hotkey: "Alt+A",
            draggable: false,
          });
        });
      } catch {}
    };

    // Defer a tick to ensure AssistantWidget (if any) can attach globals first
    const t = window.setTimeout(init, 0);

    return () => {
      window.clearTimeout(t);
  try { instance?.destroy?.(); } catch {}
    };
  }, []);

  return null;
}
