interface ShowcaseLink {
  label: string;
  url: string;
}

interface Props {
  links: ShowcaseLink[];
}

export default function ShowcaseLinksList({ links }: Props) {
  if (links.length === 0) return null;

  return (
    <div className="mb-(--space-2xl)">
      <h2 className="text-(--text-heading) text-(--color-text-primary) mb-(--space-md) uppercase tracking-widest">
        Links
      </h2>
      <ul className="flex flex-col gap-(--space-md)">
        {links.map((link, i) => (
          <li key={i}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-(--text-body) text-(--color-text-primary) hover:text-(--color-accent-lime) transition-colors duration-150 underline underline-offset-4"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
