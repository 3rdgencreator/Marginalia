import { config, collection, singleton, fields } from '@keystatic/core';
import { platformLinksField } from '@/lib/platform-links-field';
import { soundcloudDownloadField } from '@/lib/soundcloud-download-field';

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
        // All platform URLs + UPC + Laylo in one compound field with auto-fill
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        platformLinks: platformLinksField() as any,
        title: fields.slug({ name: { label: 'Title' } }),
        catalogNumber: fields.text({
          label: 'Catalog Number',
          description: 'MRGNL format, e.g. MRGNL001',
          validation: { length: { min: 1 } },
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
        coverArt: fields.image({
          label: 'Cover Art',
          directory: 'public/images/releases',
          publicPath: '/images/releases/',
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
        presave: fields.checkbox({
          label: 'Pre-Save',
          description: 'Show badge on Releases page and sort to top.',
          defaultValue: false,
        }),
        badgeText: fields.text({
          label: 'Badge Text',
          description: 'Short label shown on the artwork (e.g. Pre-Save, Out Now, New). Leave blank for no badge.',
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
          label: 'Show on Roster',
          description: 'Display this artist on the Roster page.',
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
        managementEmail: fields.text({
          label: 'Management Email',
          description: 'For management and general enquiries',
        }),
        bookingEmail: fields.text({
          label: 'Booking Email (General)',
          description: 'Single booking contact — use if NA/ROW split is not needed',
        }),
        bookingNAEmail: fields.text({
          label: 'Booking Email — NA',
          description: 'North America booking contact',
        }),
        bookingROWEmail: fields.text({
          label: 'Booking Email — ROW',
          description: 'Rest of World booking contact',
        }),
        pressKitUrl: fields.url({
          label: 'Press Kit URL',
          description: 'Link to downloadable press kit (Google Drive, Dropbox, etc.)',
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

    freeDownloads: collection({
      label: 'Free Downloads',
      slugField: 'title',
      path: 'content/free-downloads/*',
      format: { data: 'yaml' },
      entryLayout: 'form',
      schema: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        soundcloudDownload: soundcloudDownloadField() as any,
        title: fields.slug({ name: { label: 'Title' } }),
        artistName: fields.text({ label: 'Artist Name' }),
        description: fields.text({
          label: 'Description',
          multiline: true,
        }),
        coverImage: fields.image({
          label: 'Cover Image (optional override)',
          description: 'Leave empty — artwork is pulled from SoundCloud automatically',
          directory: 'public/images/downloads',
          publicPath: '/images/downloads/',
        }),
        releaseDate: fields.date({ label: 'Release Date' }),
        active: fields.checkbox({
          label: 'Active',
          description: 'Show on Free Downloads page',
          defaultValue: true,
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
        soundcloudSetUrl: fields.url({
          label: 'SoundCloud Set URL',
          description: 'Recorded set from the event (shown as Listen link)',
        }),
        recapPhotos: fields.array(
          fields.object({
            image: fields.image({
              label: 'Photo',
              directory: 'public/images/showcases',
              publicPath: '/images/showcases/',
            }),
            caption: fields.text({ label: 'Caption (optional)' }),
          }),
          {
            label: 'Recap Photos',
            description: 'Event photos for past events',
            itemLabel: (props) => props.fields.caption.value || 'Photo',
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
          description: 'External merch store link (used as fallback link)',
        }),
        shopifyBuyButtonCode: fields.text({
          label: 'Shopify Buy Button Embed Code',
          description: 'Shopify Admin → Sales Channels → Buy Button → Create → Copy code. Paste the full embed code here.',
          multiline: true,
        }),
        demoEmail: fields.text({
          label: 'Demo Submission Email',
          defaultValue: 'elif@marginalialabel.com',
        }),
        newsletterProvider: fields.text({
          label: 'Newsletter Provider ID',
          description: 'Brevo list ID',
        }),
        layloUrl: fields.url({
          label: 'Laylo Community URL',
          description: 'Main Laylo page (shown on Free Downloads gate)',
        }),
        soundcloudPlaylistUrl: fields.url({
          label: 'SoundCloud Podcast Playlist URL',
          description: 'Paste the SoundCloud playlist/set URL — shown as a full embed on the Podcasts page',
        }),
        navbarColor: fields.select({
          label: 'Navbar Background Color',
          description: 'Background color of the top navigation bar',
          defaultValue: 'black-70',
          options: [
            { label: 'Black — semi-transparent (default)', value: 'black-70' },
            { label: 'Black — solid', value: 'black' },
            { label: 'Charcoal — background (#1F1F21)', value: 'bg' },
            { label: 'Dark Gray — surface (#2A2A2C)', value: 'surface' },
            { label: 'Violet (#580AFF)', value: 'violet' },
            { label: 'Purple (#8656FF)', value: 'surface-purple' },
            { label: 'Lime (#9EFF0A)', value: 'lime' },
            { label: 'Pink (#ef6b8e)', value: 'pink' },
            { label: 'Orange (#f29753)', value: 'orange' },
            { label: 'Yellow (#f9c432)', value: 'yellow' },
            { label: 'Olive (#c0c020)', value: 'olive' },
            { label: 'Mint (#66cc99)', value: 'mint' },
            { label: 'Green Light (#7ed35e)', value: 'green-light' },
            { label: 'Green Dark (#599f56)', value: 'green-dark' },
            { label: 'Lavender (#b088d0)', value: 'lavender' },
            { label: 'Purple Tag (#bd63ee)', value: 'purple-tag' },
            { label: 'Blue (#2086c0)', value: 'blue' },
            { label: 'Sky (#a9c2e7)', value: 'sky' },
          ],
        }),
        buttonColor: fields.select({
          label: 'Button Color',
          description: 'Text and border color for outline buttons across the site (embed/branded buttons excluded)',
          defaultValue: 'white',
          options: [
            { label: 'White (default)', value: 'white' },
            { label: 'Lime (#9EFF0A)', value: 'lime' },
            { label: 'Violet (#580AFF)', value: 'violet' },
            { label: 'Purple (#8656FF)', value: 'surface-purple' },
            { label: 'Pink (#ef6b8e)', value: 'pink' },
            { label: 'Orange (#f29753)', value: 'orange' },
            { label: 'Yellow (#f9c432)', value: 'yellow' },
            { label: 'Olive (#c0c020)', value: 'olive' },
            { label: 'Mint (#66cc99)', value: 'mint' },
            { label: 'Green Light (#7ed35e)', value: 'green-light' },
            { label: 'Lavender (#b088d0)', value: 'lavender' },
            { label: 'Sky (#a9c2e7)', value: 'sky' },
          ],
        }),
        miniPlayerColor: fields.select({
          label: 'Mini Player Background Color',
          description: 'Background color of the bottom music player bar',
          defaultValue: 'player-default',
          options: [
            { label: 'Dark (default)', value: 'player-default' },
            { label: 'Black — semi-transparent', value: 'black-70' },
            { label: 'Black — solid', value: 'black' },
            { label: 'Charcoal — background (#1F1F21)', value: 'bg' },
            { label: 'Dark Gray — surface (#2A2A2C)', value: 'surface' },
            { label: 'Violet (#580AFF)', value: 'violet' },
            { label: 'Purple (#8656FF)', value: 'surface-purple' },
            { label: 'Lime (#9EFF0A)', value: 'lime' },
            { label: 'Pink (#ef6b8e)', value: 'pink' },
            { label: 'Orange (#f29753)', value: 'orange' },
            { label: 'Yellow (#f9c432)', value: 'yellow' },
            { label: 'Olive (#c0c020)', value: 'olive' },
            { label: 'Mint (#66cc99)', value: 'mint' },
            { label: 'Green Light (#7ed35e)', value: 'green-light' },
            { label: 'Green Dark (#599f56)', value: 'green-dark' },
            { label: 'Lavender (#b088d0)', value: 'lavender' },
            { label: 'Purple Tag (#bd63ee)', value: 'purple-tag' },
            { label: 'Blue (#2086c0)', value: 'blue' },
            { label: 'Sky (#a9c2e7)', value: 'sky' },
          ],
        }),
        footerColor: fields.select({
          label: 'Footer Background Color',
          description: 'Background color of the site footer',
          defaultValue: 'surface',
          options: [
            { label: 'Dark Gray — surface (#2A2A2C)', value: 'surface' },
            { label: 'Black — semi-transparent', value: 'black-70' },
            { label: 'Black — solid', value: 'black' },
            { label: 'Charcoal — background (#1F1F21)', value: 'bg' },
            { label: 'Violet (#580AFF)', value: 'violet' },
            { label: 'Purple (#8656FF)', value: 'surface-purple' },
            { label: 'Lime (#9EFF0A)', value: 'lime' },
            { label: 'Pink (#ef6b8e)', value: 'pink' },
            { label: 'Orange (#f29753)', value: 'orange' },
            { label: 'Yellow (#f9c432)', value: 'yellow' },
            { label: 'Olive (#c0c020)', value: 'olive' },
            { label: 'Mint (#66cc99)', value: 'mint' },
            { label: 'Green Light (#7ed35e)', value: 'green-light' },
            { label: 'Green Dark (#599f56)', value: 'green-dark' },
            { label: 'Lavender (#b088d0)', value: 'lavender' },
            { label: 'Purple Tag (#bd63ee)', value: 'purple-tag' },
            { label: 'Blue (#2086c0)', value: 'blue' },
            { label: 'Sky (#a9c2e7)', value: 'sky' },
          ],
        }),
        announcementActive: fields.checkbox({
          label: 'Announcement Bar Active',
          description: 'Show the scrolling announcement strip below the navigation bar',
          defaultValue: false,
        }),
        announcementText: fields.text({
          label: 'Announcement Text',
          description: 'e.g. MRGNL037 out now! Click to listen.',
        }),
        announcementUrl: fields.url({
          label: 'Announcement Link URL',
          description: 'Where clicking the bar takes the user (leave empty for no link)',
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
        heroVideoDesktop: fields.object({
          file: fields.file({
            label: 'Upload MP4 (bilgisayardan — öncelikli)',
            directory: 'public/videos',
            publicPath: '/videos/',
          }),
          youtubeUrl: fields.url({
            label: 'YouTube URL (yedek — dosya yüklü değilse kullanılır)',
          }),
        }, { label: 'Hero Video — Desktop (16:9)' }),
        heroVideoStartSecond: fields.integer({
          label: 'Hero Video Start (seconds) — desktop YouTube only',
          description: 'YouTube videosunu kaçıncı saniyeden başlat (boş = baştan)',
        }),
        heroVideoMobile: fields.object({
          file: fields.file({
            label: 'Upload MP4 (bilgisayardan — öncelikli)',
            directory: 'public/videos',
            publicPath: '/videos/',
          }),
          youtubeUrl: fields.url({
            label: 'YouTube URL (yedek — dosya yüklü değilse kullanılır)',
          }),
        }, { label: 'Hero Video — Mobile (9:16)' }),
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
        heroLayloEmbedUrl: fields.url({
          label: 'Hero Laylo Embed URL',
          description: 'Laylo embed iframe URL shown in the hero (e.g. https://laylo.com/marginalialabel/embed)',
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

    about: singleton({
      label: 'About',
      path: 'content/about',
      format: { data: 'yaml' },
      schema: {
        headline: fields.text({ label: 'Headline' }),
        body: fields.document({
          label: 'Body',
          formatting: true,
          links: true,
        }),
        photo: fields.image({
          label: 'Photo',
          directory: 'public/images/about',
          publicPath: '/images/about/',
        }),
      },
    }),

    demoPage: singleton({
      label: 'Demo Submission Page',
      path: 'content/demo-page',
      format: { data: 'yaml' },
      schema: {
        acceptingDemos: fields.checkbox({
          label: 'Accepting Demos',
          description: 'Uncheck to show a notice above the form that demos are not being reviewed for 2026 (form stays open for 2027 submissions)',
          defaultValue: true,
        }),
        heading: fields.text({
          label: 'Heading',
          defaultValue: 'Submit a Demo',
        }),
        intro: fields.document({
          label: 'Intro Text',
          formatting: true,
          links: true,
        }),
      },
    }),
  },
});
