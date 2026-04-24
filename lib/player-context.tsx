'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { playerStore } from './player-store';

export type { SCTrack } from './player-store';

export type PlayerCtx = ReturnType<typeof playerStore.getState> & {
  loadPlaylist: (embedUrl: string, playlistUrl: string) => void;
  togglePlay: () => void;
  skipTo: (index: number) => void;
  skipPrev: () => void;
  skipNext: () => void;
  seekTo: (ratio: number) => void;
  minimize: () => void;
  expand: () => void;
  dismiss: () => void;
};

// Stable bound methods — never recreated
const actions = {
  loadPlaylist: playerStore.loadPlaylist.bind(playerStore),
  togglePlay:   playerStore.togglePlay.bind(playerStore),
  skipTo:       playerStore.skipTo.bind(playerStore),
  skipPrev:     playerStore.skipPrev.bind(playerStore),
  skipNext:     playerStore.skipNext.bind(playerStore),
  seekTo:       playerStore.seekTo.bind(playerStore),
  minimize:     playerStore.minimize.bind(playerStore),
  expand:       playerStore.expand.bind(playerStore),
  dismiss:      playerStore.dismiss.bind(playerStore),
};

export function usePlayer(): PlayerCtx {
  const state = useSyncExternalStore(
    playerStore.subscribe.bind(playerStore),
    playerStore.getState.bind(playerStore),
    playerStore.getState.bind(playerStore),
  );
  return { ...state, ...actions };
}

// PlayerProvider is now a no-op shell — the singleton manages everything
export function PlayerProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
