'use client';

import { useState } from 'react';
import { DocumentRenderer } from '@keystatic/core/renderer';

type Node = Parameters<typeof DocumentRenderer>[0]['document'][number];

function extractText(nodes: Node[]): string {
  const getText = (node: unknown): string => {
    const n = node as Record<string, unknown>;
    if (typeof n.text === 'string') return n.text;
    if (Array.isArray(n.children)) return (n.children as unknown[]).map(getText).join('');
    return '';
  };
  return nodes.map(getText).join(' ');
}

function getPreviewText(text: string, limit = 1100): string {
  if (text.length <= limit) return text;
  // Find the first sentence end at or after limit
  const sentenceEnd = text.slice(limit).search(/[.!?]["\s]/);
  if (sentenceEnd !== -1) return text.slice(0, limit + sentenceEnd + 1);
  // Fallback: last sentence end before limit
  const slice = text.slice(0, limit);
  const lastDot = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('." '));
  return lastDot > 700 ? text.slice(0, lastDot + 1) : slice.trimEnd() + '…';
}

export default function AboutBody({ nodes }: { nodes: Node[] }) {
  const [expanded, setExpanded] = useState(false);
  const fullText = extractText(nodes);
  const preview = getPreviewText(fullText);
  const needsExpand = fullText.length > preview.length;

  return (
    <div className="text-(--text-body) leading-relaxed" style={{ color: 'inherit' }}>
      {expanded ? (
        <div className="prose max-w-none">
          <DocumentRenderer document={nodes} />
        </div>
      ) : (
        <p>{preview}</p>
      )}
      {needsExpand && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-sm font-semibold text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors duration-150 underline underline-offset-4"
        >
          {expanded ? 'Read less ↑' : 'Read more ↓'}
        </button>
      )}
    </div>
  );
}
