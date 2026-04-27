import { DocumentRenderer } from '@keystatic/core/renderer';

type Node = Parameters<typeof DocumentRenderer>[0]['document'][number];

export default function AboutBody({ nodes }: { nodes: Node[] }) {
  return (
    <div className="prose max-w-none text-(--text-body) leading-relaxed" style={{ color: 'inherit' }}>
      <DocumentRenderer document={nodes} />
    </div>
  );
}
