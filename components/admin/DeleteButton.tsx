'use client';

export function DeleteButton({ action, label = 'Delete' }: { action: () => Promise<void>; label?: string }) {
  return (
    <button
      type="button"
      onClick={async () => {
        if (!confirm(`Delete this ${label.toLowerCase()}? This cannot be undone.`)) return;
        await action();
      }}
      className="px-4 py-2 text-sm text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-colors duration-150 uppercase tracking-widest"
    >
      Delete
    </button>
  );
}
