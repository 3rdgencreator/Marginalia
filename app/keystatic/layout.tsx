export default function KeystaticLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        body:has([data-keystatic-admin]) > header,
        body:has([data-keystatic-admin]) > footer { display: none !important; }
        body:has([data-keystatic-admin]) > main { flex: unset; }
      `}</style>
      <span data-keystatic-admin style={{ display: 'none' }} />
      {children}
    </>
  );
}
