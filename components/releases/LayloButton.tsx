type LayloButtonProps = {
  url: string | null | undefined;
  releaseTitle: string;
  releaseDate: string | null;
};

export default function LayloButton({
  url,
  releaseTitle,
  releaseDate,
}: LayloButtonProps) {
  if (!url) return null;

  const today = new Date().toISOString().slice(0, 10);
  const isOut = releaseDate !== null && releaseDate <= today;
  const label = isOut ? 'Save' : 'Pre-save';
  const verb = isOut ? 'Save' : 'Pre-save';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${verb} "${releaseTitle}" on Laylo`}
      className="
        inline-flex items-center justify-center
        rounded-md px-6 py-3
        bg-[--color-accent-lime] text-[--color-bg] font-bold
        hover:bg-[--color-accent-violet] hover:text-[--color-text-primary]
        transition-colors duration-150
        text-[--text-body]
      "
    >
      {label}
    </a>
  );
}
