type Variant = 'bell' | 'mail' | 'none';

type LayloButtonProps = {
  url: string;
  label: string;
  releaseTitle: string;
  variant?: Variant;
};

function Icon({ variant }: { variant: Variant }) {
  if (variant === 'none') return null;
  if (variant === 'mail') {
    return (
      <svg
        aria-hidden="true"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="shrink-0"
      >
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    );
  }
  // bell (default — Join the community)
  return (
    <svg
      aria-hidden="true"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="shrink-0"
    >
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
    </svg>
  );
}

export default function LayloButton({
  url,
  label,
  releaseTitle,
  variant = 'bell',
}: LayloButtonProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} — ${releaseTitle}`}
      className="group flex items-center gap-4 px-5 py-4 bg-gradient-to-r from-[#580AFF] to-[#9B30FF] text-white hover:from-[#4A08D6] hover:to-[#8B25EE] transition-all duration-150"
    >
      <Icon variant={variant} />
      <span className="text-base font-semibold tracking-tight">{label}</span>
      <svg
        aria-hidden="true"
        width="14"
        height="14"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="ml-auto shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-150"
      >
        <path d="M2 6h8M6 2l4 4-4 4" />
      </svg>
    </a>
  );
}
