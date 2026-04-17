# Marginalia CMS Workflow

## Overview

Marginalia uses **Keystatic** as its content management system in **local mode**. Content is edited on your computer through a browser-based admin UI, saved as YAML files in the project repository, and published by pushing to GitHub.

## Prerequisites

- Node.js 18+ installed
- Git configured with access to the MRGNL repository
- The repository cloned locally: `git clone https://github.com/souchefsoul/MRGNL.git`

## Daily Workflow

### 1. Start the local server

```bash
cd MRGNL
npm run dev
```

Open your browser to **http://localhost:3000/keystatic**

### 2. Edit content

The Keystatic admin shows all content sections:

**Collections** (multiple entries each):
- **Releases** -- Add or edit catalog entries with artwork, metadata, and platform links
- **Artists** -- Manage the roster with bios, photos, and social links
- **Podcasts** -- Add podcast episodes with SoundCloud/Spotify links
- **Press** -- Add press coverage entries with publication details
- **Showcases** -- Add events with venue details, ticket links, and flyers

**Singletons** (one entry each):
- **Site Config** -- Global settings: social links, merch URL, demo email
- **Home Page** -- Hero text, featured release, Beatport accolade

### 3. Save changes

When you save in the Keystatic admin, it writes YAML files to the `content/` directory and images to `public/images/`. These are local file changes.

### 4. Publish to the live site

```bash
git add .
git commit -m "Add new release: [release name]"
git push origin main
```

Cloudflare Workers automatically rebuilds the site when changes are pushed to the `main` branch.

### 5. Verify

After pushing, wait 1-2 minutes for the build, then check the live site at **marginalialabel.com**.

## Image Guidelines

- **Release artwork:** Max 1200x1200px, JPEG or WebP, under 500KB
- **Artist photos:** Max 1200x1200px, JPEG or WebP, under 500KB
- **Event flyers:** Max 1200x1200px, JPEG or WebP, under 500KB
- Upload images through the Keystatic admin -- do not manually place files

## Important Notes

- Always pull the latest changes before editing: `git pull origin main`
- The CMS only works on localhost (local mode). You cannot edit content on the live site.
- If two people edit at the same time, coordinate via git (pull before push).
- The schema (field structure) is locked. If you need a new field, contact the developer.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Keystatic admin is blank | Make sure `npm run dev` is running, then visit http://localhost:3000/keystatic |
| Image not showing on site | Re-upload through the Keystatic admin; do not manually copy files |
| Git push rejected | Run `git pull origin main` first to get latest changes, resolve any conflicts, then push again |
| Site not updating after push | Check Cloudflare dashboard for build status; builds take 1-2 minutes |
