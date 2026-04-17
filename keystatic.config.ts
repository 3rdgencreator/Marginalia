import { config, collection, singleton, fields } from '@keystatic/core';

export default config({
  storage: { kind: 'local' },
  // NOTE: GitHub mode is blocked by issue #1497 on Cloudflare Workers.
  // v1 uses local-only. When #1497 is resolved, switch to:
  // storage: process.env.NODE_ENV === 'production'
  //   ? { kind: 'github', repo: { owner: 'souchefsoul', name: 'MRGNL' }, branchPrefix: 'keystatic/' }
  //   : { kind: 'local' },

  collections: {
    releases: collection({
      label: 'Releases',
      slugField: 'title',
      path: 'content/releases/*',
      format: { data: 'yaml' },
      entryLayout: 'form',
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        catalogNumber: fields.text({
          label: 'Catalog Number',
          description: 'MRGNL format, e.g. MRGNL001',
        }),
        releaseDate: fields.date({ label: 'Release Date' }),
        releaseType: fields.select({
          label: 'Release Type',
          options: [
            { label: 'Single', value: 'single' },
            { label: 'EP', value: 'ep' },
            { label: 'Album', value: 'album' },
            { label: 'Compilation', value: 'compilation' },
            { label: 'Edit', value: 'edit' },
          ],
          defaultValue: 'single',
        }),
        artistSlugs: fields.array(
          fields.text({ label: 'Artist Slug' }),
          {
            label: 'Artists',
            description:
              'Slugs of artists on this release (must match artist collection slugs)',
            itemLabel: (props) => props.value,
          }
        ),
        coverArt: fields.image({
          label: 'Cover Art',
          directory: 'public/images/releases',
          publicPath: '/images/releases/',
        }),
        genres: fields.multiselect({
          label: 'Genres',
          options: [
            { label: 'Melodic House', value: 'melodic-house' },
            { label: 'Techno', value: 'techno' },
            { label: 'Indie Dance', value: 'indie-dance' },
            { label: 'Organic House', value: 'organic-house' },
            { label: 'Afro House', value: 'afro-house' },
          ],
        }),
        description: fields.document({
          label: 'Description',
          formatting: true,
          links: true,
        }),
        featured: fields.checkbox({
          label: 'Featured on Homepage',
          defaultValue: false,
        }),
        // Platform URLs (all optional)
        beatportUrl: fields.url({ label: 'Beatport URL' }),
        spotifyUrl: fields.url({ label: 'Spotify URL' }),
        appleMusicUrl: fields.url({ label: 'Apple Music URL' }),
        soundcloudUrl: fields.url({
          label: 'SoundCloud URL',
          description: 'Premiere link (not embed)',
        }),
        bandcampUrl: fields.url({ label: 'Bandcamp URL' }),
        traxsourceUrl: fields.url({ label: 'Traxsource URL' }),
        layloUrl: fields.url({
          label: 'Laylo URL',
          description: 'Presave stage link',
        }),
        youtubeUrl: fields.url({ label: 'YouTube URL' }),
        tidalUrl: fields.url({ label: 'Tidal URL' }),
        deezerUrl: fields.url({ label: 'Deezer URL' }),
        boomkatUrl: fields.url({ label: 'Boomkat URL' }),
        junoUrl: fields.url({ label: 'Juno URL' }),
        soundcloudPodcastUrl: fields.url({
          label: 'Related Podcast SoundCloud URL',
          description: 'Linked podcast SC URL for related episodes',
        }),
      },
    }),

    artists: collection({
      label: 'Artists',
      slugField: 'name',
      path: 'content/artists/*',
      format: { data: 'yaml' },
      entryLayout: 'form',
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        role: fields.text({
          label: 'Role',
          description: 'e.g. Founder & DJ, Producer',
        }),
        bio: fields.document({
          label: 'Bio',
          formatting: true,
          links: true,
        }),
        photo: fields.image({
          label: 'Photo',
          directory: 'public/images/artists',
          publicPath: '/images/artists/',
        }),
        featured: fields.checkbox({
          label: 'Featured on Roster',
          defaultValue: true,
        }),
        // Social/platform URLs (all optional)
        soundcloudUrl: fields.url({ label: 'SoundCloud URL' }),
        spotifyUrl: fields.url({ label: 'Spotify URL' }),
        beatportUrl: fields.url({ label: 'Beatport URL' }),
        instagramUrl: fields.url({ label: 'Instagram URL' }),
        residentAdvisorUrl: fields.url({ label: 'Resident Advisor URL' }),
        youtubeUrl: fields.url({ label: 'YouTube URL' }),
        layloUrl: fields.url({ label: 'Laylo URL' }),
        bookingEmail: fields.text({
          label: 'Booking Email',
          description: 'Optional booking contact email',
        }),
      },
    }),

    podcasts: collection({
      label: 'Podcasts',
      slugField: 'title',
      path: 'content/podcasts/*',
      format: { data: 'yaml' },
      entryLayout: 'form',
      schema: {
        title: fields.slug({
          name: { label: 'Title', description: 'e.g. Marginalia Podcast 012' },
        }),
        episodeNumber: fields.integer({
          label: 'Episode Number',
        }),
        episodePart: fields.select({
          label: 'Episode Part',
          options: [
            { label: 'Single (no parts)', value: 'single' },
            { label: 'Part A', value: 'a' },
            { label: 'Part B', value: 'b' },
            { label: 'Part C', value: 'c' },
          ],
          defaultValue: 'single',
        }),
        catalogNumber: fields.text({
          label: 'Catalog Number',
          description: 'Links to release catalog number',
        }),
        date: fields.date({ label: 'Date' }),
        artistSlug: fields.text({
          label: 'Artist Slug',
          description: 'Host or featured artist slug',
        }),
        soundcloudUrl: fields.url({
          label: 'SoundCloud URL',
          description: 'Primary embed source',
        }),
        spotifyUrl: fields.url({
          label: 'Spotify URL',
          description: 'Spotify podcast link (ELIF full mixes)',
        }),
        youtubeUrl: fields.url({
          label: 'YouTube URL',
          description: 'YouTube set link (ELIF sets every 3 weeks)',
        }),
        applePodcastsUrl: fields.url({ label: 'Apple Podcasts URL' }),
        description: fields.text({
          label: 'Description',
          multiline: true,
        }),
        coverImage: fields.image({
          label: 'Cover Image',
          description: 'Optional — falls back to label artwork',
          directory: 'public/images/releases',
          publicPath: '/images/releases/',
        }),
      },
    }),

    press: collection({
      label: 'Press',
      slugField: 'headline',
      path: 'content/press/*',
      format: { data: 'yaml' },
      entryLayout: 'form',
      schema: {
        headline: fields.slug({ name: { label: 'Headline' } }),
        publication: fields.text({ label: 'Publication' }),
        date: fields.date({ label: 'Date' }),
        url: fields.url({ label: 'Article URL' }),
        excerpt: fields.text({
          label: 'Excerpt',
          description: 'Pull quote for display',
          multiline: true,
        }),
        type: fields.select({
          label: 'Type',
          options: [
            { label: 'Review', value: 'review' },
            { label: 'Interview', value: 'interview' },
            { label: 'Feature', value: 'feature' },
            { label: 'Mention', value: 'mention' },
            { label: 'Chart', value: 'chart' },
          ],
          defaultValue: 'feature',
        }),
        featured: fields.checkbox({
          label: 'Featured',
          description: 'Surface quote on homepage',
          defaultValue: false,
        }),
      },
    }),

    showcases: collection({
      label: 'Showcases',
      slugField: 'title',
      path: 'content/showcases/*',
      format: { data: 'yaml' },
      entryLayout: 'form',
      schema: {
        title: fields.slug({ name: { label: 'Event Name' } }),
        date: fields.date({ label: 'Date' }),
        venue: fields.text({ label: 'Venue' }),
        city: fields.text({ label: 'City' }),
        country: fields.text({ label: 'Country' }),
        status: fields.select({
          label: 'Status',
          description: 'Auto-derive from date but allow manual override',
          options: [
            { label: 'Upcoming', value: 'upcoming' },
            { label: 'Past', value: 'past' },
          ],
          defaultValue: 'upcoming',
        }),
        artistSlugs: fields.array(
          fields.text({ label: 'Artist Slug' }),
          {
            label: 'Marginalia Artists on Bill',
            itemLabel: (props) => props.value,
          }
        ),
        ticketUrl: fields.url({
          label: 'Ticket URL',
          description: 'RA, Dice links for upcoming events',
        }),
        layloSignupUrl: fields.url({
          label: 'Laylo Signup URL',
          description: 'Save-the-date before tickets are available',
        }),
        flyer: fields.image({
          label: 'Event Flyer',
          directory: 'public/images/showcases',
          publicPath: '/images/showcases/',
        }),
        aftermovieUrl: fields.url({
          label: 'Aftermovie URL',
          description: 'YouTube URL for past events',
        }),
        recapPhotos: fields.array(
          fields.image({
            label: 'Photo',
            directory: 'public/images/showcases',
            publicPath: '/images/showcases/',
          }),
          {
            label: 'Recap Photos',
            description: 'Event photos for past events',
          }
        ),
      },
    }),
  },

  singletons: {
    siteConfig: singleton({
      label: 'Site Config',
      path: 'content/site-config',
      format: { data: 'yaml' },
      schema: {
        siteName: fields.text({
          label: 'Site Name',
          defaultValue: 'Marginalia',
        }),
        tagline: fields.text({ label: 'Tagline' }),
        instagramUrl: fields.url({ label: 'Instagram URL' }),
        soundcloudUrl: fields.url({ label: 'SoundCloud URL' }),
        beatportUrl: fields.url({ label: 'Beatport URL' }),
        youtubeUrl: fields.url({ label: 'YouTube URL' }),
        tiktokUrl: fields.url({ label: 'TikTok URL' }),
        facebookUrl: fields.url({ label: 'Facebook URL' }),
        merchUrl: fields.url({
          label: 'Merch Store URL',
          description: 'External merch store link',
        }),
        demoEmail: fields.text({
          label: 'Demo Submission Email',
          defaultValue: 'elif@marginalialabel.com',
        }),
        newsletterProvider: fields.text({
          label: 'Newsletter Provider ID',
          description: 'Brevo list ID',
        }),
      },
    }),

    homePage: singleton({
      label: 'Home Page',
      path: 'content/home',
      format: { data: 'yaml' },
      schema: {
        heroHeadline: fields.text({ label: 'Hero Headline' }),
        heroSubtext: fields.text({ label: 'Hero Subtext' }),
        featuredReleaseSlug: fields.text({
          label: 'Featured Release Slug',
          description: 'Manually curated featured release',
        }),
        featuredArtistSlugs: fields.array(
          fields.text({ label: 'Artist Slug' }),
          {
            label: 'Featured Artists',
            description: 'Roster preview on homepage',
            itemLabel: (props) => props.value,
          }
        ),
        beatportAccolade: fields.text({
          label: 'Beatport Accolade',
          description: 'e.g. Hype Label of the Month, March 2025',
        }),
        showSpotifyPlaylist: fields.checkbox({
          label: 'Show Spotify Playlist',
          description: 'v2 feature — field locked now, feature deferred',
          defaultValue: false,
        }),
        spotifyPlaylistUrl: fields.url({
          label: 'Spotify Playlist URL',
          description: 'v2 feature — field locked now, feature deferred',
        }),
      },
    }),
  },
});
