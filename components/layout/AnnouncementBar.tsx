type Props = {
  text: string;
  url?: string | null;
};

const TRACK_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  width: 'max-content',
  animation: 'announcement-scroll 35s linear infinite',
  willChange: 'transform',
};

const SPAN_STYLE: React.CSSProperties = {
  whiteSpace: 'nowrap',
  fontSize: '10px',
  fontWeight: 300,
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  color: 'rgba(255,255,255,0.40)',
  padding: '0 5rem',
};

function MarqueeTrack({ text }: { text: string }) {
  return (
    <div style={TRACK_STYLE} aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} style={SPAN_STYLE}>{text}</span>
      ))}
    </div>
  );
}

const BAR_STYLE: React.CSSProperties = {
  position: 'fixed',
  left: 0,
  right: 0,
  top: 'calc(var(--nav-height-mobile) + 6px)',
  height: '20px',
  zIndex: 40,
  overflow: 'hidden',
  background: 'rgba(0,0,0,0.40)',
};

export default function AnnouncementBar({ text, url }: Props) {
  if (url) {
    return (
      <a
        href={url}
        target={url.startsWith('/') ? undefined : '_blank'}
        rel="noopener noreferrer"
        style={{ ...BAR_STYLE, display: 'block' }}
        aria-label={text}
      >
        <MarqueeTrack text={text} />
      </a>
    );
  }

  return (
    <div style={BAR_STYLE} role="marquee" aria-label={text}>
      <MarqueeTrack text={text} />
    </div>
  );
}
