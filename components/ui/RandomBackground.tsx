const BG = '/backgrounds/bg-main.jpg';

export default function RandomBackground({
  children,
  darkContent = false,
}: {
  children: React.ReactNode;
  darkContent?: boolean;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${BG}')`, filter: 'blur(2px)', transform: 'scale(1.01)' }}
        aria-hidden="true"
      />
      {darkContent ? (
        <div className="relative min-h-screen">{children}</div>
      ) : (
        <div
          className="on-light-bg relative min-h-screen"
          style={{
            '--color-text-primary': '#1F1F21',
            '--color-text-secondary': '#3A3A3C',
            '--color-text-muted': '#5A5A6A',
            color: '#1F1F21',
          } as React.CSSProperties}
        >{children}</div>
      )}
    </div>
  );
}
