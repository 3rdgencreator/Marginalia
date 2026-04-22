// Receives a pre-constructed embed URL from SoundCloudEmbed (server builds it
// via buildSoundCloudEmbedUrl so this module stays free of server-only imports).
type SoundCloudPlayerProps = { embedUrl: string };

export default function SoundCloudPlayer({ embedUrl }: SoundCloudPlayerProps) {
  return (
    <iframe
      title="SoundCloud player"
      src={embedUrl}
      width="100%"
      height={166}
      scrolling="no"
      frameBorder={0}
      allow="autoplay"
      className="block w-full"
    />
  );
}
