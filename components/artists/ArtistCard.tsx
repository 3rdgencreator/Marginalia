import Link from 'next/link';
import Image from 'next/image';

type Props = {
  slug: string;
  name: string;
  role?: string | null;
  photo?: string | null;
};

export default function ArtistCard({ slug, name, role, photo }: Props) {
  return (
    <Link
      href={`/artists/${slug}`}
      aria-label={name}
      className="group relative block aspect-square overflow-hidden bg-(--color-surface)"
    >
      {photo ? (
        <Image
          src={`/images/artists/${photo}`}
          alt={`${name} photo`}
          width={600}
          height={600}
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-full w-full items-center justify-center text-4xl font-bold text-(--color-text-muted)"
        >
          {name[0]}
        </span>
      )}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-0
          hidden md:flex flex-col items-center justify-center gap-1 p-4
          bg-[rgba(31,31,33,0.75)]
          opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100
          transition-opacity duration-200 ease-out
        "
      >
        <span className="text-(--text-body) font-bold text-center text-(--color-text-primary)">
          {name}
        </span>
        {role && (
          <span className="text-(--text-label) text-(--color-text-secondary) text-center">
            {role}
          </span>
        )}
      </div>
    </Link>
  );
}
