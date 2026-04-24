// Receives a pre-constructed embed URL from SoundCloudEmbed (server builds it
// via buildSoundCloudEmbedUrl so this module stays free of server-only imports).
type SoundCloudPlayerProps = { embedUrl: string; height?: number };

export default function SoundCloudPlayer({ embedUrl, height = 166 }: SoundCloudPlayerProps) {
  return (
    <iframe
      title="SoundCloud player"
      src={embedUrl}
      width="100%"
      height={height}
      scrolling="no"
      frameBorder={0}
      allow="autoplay"
      className="block w-full"
    />
  );
}
