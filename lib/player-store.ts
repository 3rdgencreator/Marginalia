// Module-level singleton — lives for the entire browser session.
// The SC iframe is appended directly to document.body (outside React),
// so it is never destroyed by React re-mounts or page navigations.

declare global {
  interface Window {
    SC: {
      Widget: ((iframe: HTMLIFrameElement) => SCWidget) & {
        Events: Record<string, string>;
      };
    };
    __mrgnlPlayer?: PlayerStore;
  }
}

export interface SCTrack {
  title: string;
  artwork_url: string | null;
  duration: number;
  username?: string;
}

interface SCWidget {
  bind(event: string, cb: (...args: unknown[]) => void): void;
  play(): void;
  pause(): void;
  skip(index: number): void;
  seekTo(ms: number): void;
  setVolume(volume: number): void;
  isPaused(cb: (v: boolean) => void): void;
  getCurrentSoundIndex(cb: (index: number) => void): void;
  getDuration(cb: (v: number) => void): void;
}

export interface PlayerState {
  tracks: SCTrack[];
  currentIndex: number;
  isPlaying: boolean;
  hasPlayed: boolean;
  minimized: boolean;
  dismissed: boolean;
  progress: number;
  currentMs: number;
  duration: number;
  isLoaded: boolean;
  embedUrl: string;
  playlistUrl: string;
  volume: number;
}

type Listener = () => void;

class PlayerStore {
  private state: PlayerState = {
    tracks: [],
    currentIndex: 0,
    isPlaying: false,
    hasPlayed: false,
    minimized: false,
    dismissed: false,
    progress: 0,
    currentMs: 0,
    duration: 0,
    isLoaded: false,
    embedUrl: '',
    playlistUrl: '',
    volume: 80,
  };

  private listeners = new Set<Listener>();
  private iframe: HTMLIFrameElement | null = null;
  private widget: SCWidget | null = null;
  private currentIndexRef = 0;
  private initInterval: ReturnType<typeof setInterval> | null = null;
  private pendingPlay = false;
  private autoPlayRetries = 0;

  constructor() {}

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  getState(): PlayerState {
    return this.state;
  }

  private setState(patch: Partial<PlayerState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach(l => l());
  }

  private ensureScript() {
    if (!document.querySelector('script[src*="soundcloud.com/player/api"]')) {
      const s = document.createElement('script');
      s.src = 'https://w.soundcloud.com/player/api.js';
      s.async = true;
      document.head.appendChild(s);
    }
  }

  private createIframe(embedUrl: string) {
    if (this.iframe) { this.iframe.remove(); this.iframe = null; }
    this.widget = null;

    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.title = 'SoundCloud playlist';
    iframe.allow = 'autoplay';
    Object.assign(iframe.style, {
      position: 'fixed',
      left: '-9999px',
      top: '0',
      width: '300px',
      height: '300px',
      border: 'none',
      pointerEvents: 'none',
      zIndex: '-1',
    });
    document.body.appendChild(iframe);
    this.iframe = iframe;
  }

  private initWidget() {
    if (this.widget || !this.iframe || !window.SC?.Widget?.Events) return;

    const widget = window.SC.Widget(this.iframe);
    this.widget = widget;
    const E = window.SC.Widget.Events;

    widget.bind(E.PLAY, () => {
      this.setState({ isPlaying: true, hasPlayed: true, dismissed: false });
      widget.getCurrentSoundIndex((idx) => {
        this.currentIndexRef = idx;
        this.setState({ currentIndex: idx });
      });
      widget.getDuration((d) => this.setState({ duration: d }));
    });
    widget.bind(E.PAUSE, () => this.setState({ isPlaying: false }));
    widget.bind(E.FINISH, () => this.setState({ isPlaying: false, progress: 1 }));

    if (this.pendingPlay) {
      this.pendingPlay = false;
      setTimeout(() => widget.play(), 800);
    }
    widget.bind(E.PLAY_PROGRESS, (e: unknown) => {
      const ev = e as { relativePosition: number; currentPosition: number };
      this.setState({ progress: ev.relativePosition, currentMs: ev.currentPosition });
    });
  }

  private startInitPolling() {
    if (this.initInterval) clearInterval(this.initInterval);
    let attempts = 0;
    this.initInterval = setInterval(() => {
      attempts++;
      if (this.iframe && window.SC?.Widget?.Events) {
        clearInterval(this.initInterval!);
        this.initInterval = null;
        this.initWidget();
      }
      if (attempts >= 40) { clearInterval(this.initInterval!); this.initInterval = null; }
    }, 500);
  }

  loadPlaylist(embedUrl: string, playlistUrl: string) {
    if (embedUrl === this.state.embedUrl) return;

    this.ensureScript();
    this.setState({
      embedUrl, playlistUrl,
      tracks: [], currentIndex: 0, isPlaying: false,
      progress: 0, currentMs: 0, duration: 0, isLoaded: false,
    });
    this.createIframe(embedUrl);
    this.startInitPolling();

    fetch(`/api/soundcloud-playlist?url=${encodeURIComponent(playlistUrl)}`, { cache: 'no-store' })
      .then(r => r.json())
      .then((data: SCTrack[]) => {
        if (Array.isArray(data)) this.setState({ tracks: data, isLoaded: true });
      })
      .catch(() => this.setState({ isLoaded: true }));
  }

  togglePlay() {
    this.autoPlayRetries = 0;
    if (!this.widget) return;
    if (this.state.isPlaying) {
      this.widget.pause();
    } else {
      this.widget.play();
    }
  }

  skipTo(index: number) {
    if (!this.widget) return;
    this.widget.skip(index);
    this.currentIndexRef = index;
    this.setState({ currentIndex: index, progress: 0, currentMs: 0 });
    setTimeout(() => this.widget?.play(), 300);
  }

  skipPrev() { this.skipTo(Math.max(0, this.currentIndexRef - 1)); }
  skipNext() { this.skipTo(this.currentIndexRef + 1); }
  minimize() { this.setState({ minimized: true }); }
  expand()   { this.setState({ minimized: false }); }
  dismiss()  { this.setState({ dismissed: true }); }
  playOnReady() {
    if (this.widget) {
      this.autoPlayRetries = 5;
      setTimeout(() => { if (!this.state.isPlaying) this.widget?.play(); }, 300);
    } else {
      this.pendingPlay = true;
    }
  }

  setVolume(volume: number) {
    this.setState({ volume });
    this.widget?.setVolume(volume);
  }

  seekTo(ratio: number) {
    if (!this.widget || this.state.duration === 0) return;
    const ms = Math.round(ratio * this.state.duration);
    this.widget.seekTo(ms);
    this.setState({ progress: ratio, currentMs: ms });
  }
}

// HMR-safe singleton: reuse existing instance across hot reloads
function getStore(): PlayerStore {
  if (typeof window === 'undefined') return new PlayerStore();
  if (!window.__mrgnlPlayer) window.__mrgnlPlayer = new PlayerStore();
  return window.__mrgnlPlayer;
}

export const playerStore = getStore();
