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
    <Link href={`/artists/${slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden bg-(--color-surface)">
        {photo ? (
          <Image
            src={photo}
            alt={`${name} photo`}
            width={600}
            height={600}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center text-4xl font-bold text-(--color-text-muted)"
          >
            {name[0]}
          </span>
        )}
      </div>
      <div className="pt-2">
        <p className="text-(--text-body) font-bold text-(--color-text-primary) group-hover:text-(--color-accent-lime) transition-colors duration-150">
          {name}
        </p>
        {role && (
          <p className="text-(--text-label) font-bold text-(--color-text-secondary)">
            {role}
          </p>
        )}
      </div>
    </Link>
  );
}
