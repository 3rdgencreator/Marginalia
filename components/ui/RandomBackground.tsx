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
      <div
        className="on-light-bg relative min-h-screen"
        style={{
          '--color-text-primary': '#1F1F21',
          '--color-text-secondary': '#3A3A3C',
          '--color-text-muted': '#5A5A6A',
          color: '#1F1F21',
        } as React.CSSProperties}
      >{children}</div>
    </div>
  );
}
