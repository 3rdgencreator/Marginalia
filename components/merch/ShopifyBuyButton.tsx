'use client';

import { useEffect, useRef } from 'react';

export default function ShopifyBuyButton({ embedCode }: { embedCode: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !embedCode) return;

    // Parse the embed HTML to separate div placeholders from script tags
    const temp = document.createElement('div');
    temp.innerHTML = embedCode;

    // Append non-script nodes (the placeholder divs Shopify needs)
    Array.from(temp.childNodes).forEach((node) => {
      if ((node as Element).tagName !== 'SCRIPT') {
        container.appendChild(node.cloneNode(true));
      }
    });

    // Re-create and append each script so the browser actually executes it
    // (innerHTML does not execute scripts — this is required)
    const scripts: HTMLScriptElement[] = [];
    temp.querySelectorAll('script').forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value)
      );
      newScript.textContent = oldScript.textContent;
      document.body.appendChild(newScript);
      scripts.push(newScript);
    });

    return () => {
      // Clean up on unmount
      container.innerHTML = '';
      scripts.forEach((s) => s.remove());
    };
  }, [embedCode]);

  return <div ref={containerRef} className="w-full" />;
}
