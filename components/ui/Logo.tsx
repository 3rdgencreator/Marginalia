import Image from 'next/image';

export default function Logo({
  className = '',
  height = 40,
}: {
  className?: string;
  height?: number;
}) {
  const width = Math.round(height * (1839 / 579));
  return (
    <Image
      src="/logo.png"
      alt="Marginalia"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
