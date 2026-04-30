'use client';

import SoundCloudEmbed from '@/components/releases/SoundCloudEmbed';

interface ShowcaseRecording {
  id: number;
  title: string;
  djLabel: string | null;
  embedUrl: string; // pre-computed server-side; NOT the raw SoundCloud URL
}

interface Props {
  recordings: ShowcaseRecording[];
}

export default function RecordingsList({ recordings }: Props) {
  if (recordings.length === 0) return null;

  return (
    <div className="mb-(--space-2xl)">
      <h2 className="text-(--text-heading) text-(--color-text-primary) mb-(--space-md) uppercase tracking-widest">
        Listen
      </h2>
      <div className="flex flex-col gap-(--space-xl)">
        {recordings.map((rec) => (
          <div key={rec.id}>
            <h3 className="text-(--text-body) text-(--color-text-primary) font-bold mb-(--space-sm)">
              {rec.title}
              {rec.djLabel && (
                <>
                  {' — '}
                  <span className="text-(--color-text-muted) font-normal">{rec.djLabel}</span>
                </>
              )}
            </h3>
            <SoundCloudEmbed embedUrl={rec.embedUrl} height={166} />
          </div>
        ))}
      </div>
    </div>
  );
}
