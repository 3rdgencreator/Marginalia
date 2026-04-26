const BG = '/backgrounds/bg-main.jpg';

export default function RandomBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url('${BG}')`, opacity: 1, filter: 'blur(2px)', transform: 'scale(1.01)' }}
        aria-hidden="true"
      />
      <div className="relative min-h-screen text-(--color-bg)">{children}</div>
    </div>
  );
}
