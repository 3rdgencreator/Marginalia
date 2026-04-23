import Link from 'next/link';

type ArtistLinkProps = {
  slug: string;
  name: string;
};

export default function ArtistLink({ slug, name }: ArtistLinkProps) {
  if (!slug || !name) return null;
  return (
    <Link
      href={`/artists/${slug}`}
      aria-label={`${name} on Marginalia`}
      className="text-(--color-text-primary) no-underline hover:underline underline-offset-2 transition-all duration-150"
    >
      {name}
    </Link>
  );
}
