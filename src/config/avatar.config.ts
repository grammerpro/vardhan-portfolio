import type { AvatarAssistantOptions } from "../avatar";

// Default configuration for the Avatar Assistant
export const defaultAvatarConfig: AvatarAssistantOptions = {
  container: 'body',
  position: { right: 24, bottom: 24 },
  theme: 'auto',
  avatarUrl: '/assets/avatar-standing.svg',
  bubbleHints: true,
  patrol: true,
  voice: false,
};

export default defaultAvatarConfig;
