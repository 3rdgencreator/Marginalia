---
phase: 8
slug: showcase-detail-enhancements-per-event-merch-shopify-product
gathered: 2026-04-30
status: Ready for planning
---

# Phase 8: Showcase Detail Enhancements — Context

<domain>
## Phase Boundary

Showcase detay sayfasını event-spesifik içerikle zenginleştir. Her showcase isteğe bağlı olarak şunları taşıyabilir:

- **0-N curated Shopify ürünü** (event-spesifik merch, ör. event tişörtü)
- **0-N serbest harici link** (sponsor, lineup, venue, vs.)
- **1-N SoundCloud kaydı** (B2B/closing/opening setleri)

Mevcut alanlar (flyer, aftermovie, gallery, ticket/laylo CTA'ları) korunur. `soundcloud_set_url` (tek) yeni `showcase_recordings` join table'ına migrate edilir.

**Out of scope:**
- Showcase RSVP / attendee list
- Lineup'ı artist tablosuna ayrı bağlama (mevcut artistSlugs jsonb yeterli)
- Per-product cart drawer'dan çıkmadan add-to-cart (showcase'te sadece preview + product link)
- Merch'in Shopify collection üzerinden bağlanması

</domain>

<decisions>
## Implementation Decisions

### Schema — Recordings (multi)
- **D-01:** Yeni `showcase_recordings` join table oluşturulur. Pattern: mevcut `showcase_photos` table'ı.
- **D-02:** Kolonlar: `id (serial pk)`, `showcase_id (fk cascade)`, `url (varchar 1000, NOT NULL)`, `title (varchar 500, NOT NULL)`, `dj_label (varchar 500, nullable)`, `sort_order (integer default 0)`.
- **D-03:** `title` zorunlu (örn. "Closing Set"); `dj_label` opsiyonel (örn. "Beswerda B2B NVRMĪND").
- **D-04:** Mevcut `showcases.soundcloud_set_url` dolu olan satırlar migration'da otomatik olarak `showcase_recordings`'a kopyalanır (`title='Set'`, `sort_order=0`). Eski kolon migration sonunda DROP edilir.

### Schema — Links (multi, free-form)
- **D-05:** `showcases` tablosuna `links jsonb` kolonu eklenir; tip: `Array<{ label: string; url: string }>`. Default `[]`.
- **D-06:** Tip sınıflandırması yok (sponsor/lineup/venue gibi tipler zorlanmaz). Admin label ve URL yazar; render basit dikey liste.
- **D-07:** Admin form'da dinamik repeater (label + url + remove button + add row). Sıralama jsonb içindeki array sırasıyla.

### Schema — Merch
- **D-08:** `showcases` tablosuna `merch_handles jsonb` kolonu eklenir; tip: `string[]` (Shopify product handle dizisi). Default `[]`.
- **D-09:** Admin form'da Shopify Storefront API'den ürün listesi fetch edilir, multi-select picker (mevcut `lib/shopify.ts > fetchShopifyProducts` kullanılır).
- **D-10:** Public render'da handle'lar `fetchShopifyProducts` ile resolve edilir; mevcut `MerchGrid` kart paterni reuse edilir (link `/merch/[handle]` iç sayfasına).

### Public Render — Visibility
- **D-11:** Recordings ve gallery sadece `isPast` (mevcut `s.date < today` kontrolü) olduğunda görünür.
- **D-12:** Merch ve links her zaman (upcoming + past) görünür — dolu ise.
- **D-13:** Upcoming sayfada flyer + tickets/laylo CTA'ları ÜSTTE kalır (mevcut pattern korunur). Aftermovie ve recordings sadece past'ta.

### Public Render — Recordings UI
- **D-14:** Birden fazla kayıt `sort_order ASC` ile alt alta render edilir; her kayıt için `<h3>title (dj_label)</h3>` + tam SoundCloud embed (`SoundCloudEmbed`, height=166).
- **D-15:** Tek kayıt da aynı render'ı kullanır (consistent).

### Admin Form
- **D-16:** Showcase admin form'una üç yeni section eklenir:
  - **Recordings** — repeater: title (required) + dj_label (optional) + url (required) + sort_order (number) + remove. Add row button.
  - **Links** — repeater: label + url + remove. Add row button.
  - **Merch** — multi-select: Shopify ürün listesinden seçim (handle bazlı). Async load on mount.
- **D-17:** Mevcut `soundcloud_set_url` field'ı admin form'undan kaldırılır (artık `recordings` table tek truth source).

### Migration Strategy
- **D-18:** `drizzle-kit push` ile schema değişiklikleri uygulanır (mevcut Marginalia pattern'i).
- **D-19:** Data migration: tek bir SQL/Node script (`lib/db/migrate-showcase-recordings.ts`) çalıştırılır. Mevcut showcase'lerin `soundcloud_set_url`'leri yeni tabloya kopyalanır, sonra eski kolon DROP edilir. İdempotent (tekrar çalıştırılırsa aynı sonucu verir).

### Claude's Discretion
- Admin form repeater UI mikrodetayları (drag handle vs sort_order number input — sort_order number basit, planner karar verir).
- Shopify multi-select picker'ın UI patterni (mevcut admin'de paralel pattern yok, planner mevcut `ReleaseFetchWidget` benzeri yaklaşım önerebilir).
- Recordings render'ında `<h2>Listen</h2>` heading kullanımı (1 kayıt vs çok kayıt durumunda heading değişir mi — planner basit tutar).
- Merch grid'in showcase sayfasındaki sticky/responsive davranışı (mevcut MerchGrid'i clone et yeterli).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Mevcut Showcase paterni
- `app/showcases/[slug]/page.tsx` — public render mevcut yapısı (gallery + recordings + aftermovie sıralaması)
- `app/showcases/page.tsx` — listing sayfası
- `app/admin/(protected)/showcases/[slug]/page.tsx` — admin edit form (mevcut)
- `app/admin/(protected)/showcases/new/page.tsx` — admin new form (mevcut)
- `lib/db/schema.ts` §showcases, §showcasePhotos — eklenecek tablo paterni
- `lib/db/queries.ts` §getAllShowcases, §getShowcaseBySlug, §getShowcasePhotos, §resolveImageUrl — yeni queries için pattern
- `lib/db/actions/showcases.ts` (yoksa oluşturulur) — releases.ts paterni gibi server actions

### Shopify entegrasyonu
- `lib/shopify.ts` §fetchShopifyProducts — mevcut handle-based ürün fetch
- `components/merch/MerchGrid.tsx` — kart render paterni (showcase sayfasında reuse)
- `app/merch/page.tsx` — fallback davranışı (env yoksa boş döner)

### Audio embed
- `components/releases/SoundCloudEmbed.tsx` — embed component (height parametresi destekler)
- `lib/releases.ts` §buildSoundCloudEmbedUrl — URL → embed URL dönüşümü

### Admin patternleri
- `components/admin/PresaveSection.tsx` — toggle wrapper paterni (gerekirse repeater için referans)
- `components/keystatic/PlatformLinksField.tsx` — dinamik link field paterni (link repeater için en yakın analog)
- `components/admin/ReleaseFetchWidget.tsx` — async DOM listener paterni (Shopify product picker için referans)
- `lib/db/actions/releases.ts` — server action structure

### Migration
- Drizzle config: `drizzle.config.ts`
- `npm run db:push` (env: `set -a && source .env.local && set +a && npm run db:push`)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SoundCloudEmbed` component → her recording için aynısı kullanılır
- `fetchShopifyProducts` → admin picker'da liste için, public sayfada handle resolve için aynı API
- `MerchGrid` component → showcase sayfasında merch render için clone/reuse
- `RandomBackground` + `Container` layout primitives → showcase detail sayfasında zaten kullanımda
- `getShowcasePhotos` query paterni → `getShowcaseRecordings` aynı şekilde yazılır

### Established Patterns
- **Drizzle join table**: `showcase_photos` tam olarak yeni `showcase_recordings` için template (cascade FK, sort_order, basit kolonlar)
- **Server actions**: `lib/db/actions/releases.ts` pattern → `showcases.ts` paralel şekilde yazılır (createShowcase, updateShowcase + new helpers for recordings/merch)
- **Image path normalization**: `resolveImageUrl` zaten flyer için kullanılıyor; merch için Shopify URL'leri zaten tam (gerek yok)
- **`isPast` kontrolü**: `s.date < today` mevcut; recordings/gallery için aynı flag kullanılır

### Integration Points
- Admin form: `app/admin/(protected)/showcases/[slug]/page.tsx` — yeni 3 section ek
- Public sayfa: `app/showcases/[slug]/page.tsx` — Listen section değişir (multi-render), yeni Merch + Links sectionları eklenir
- DB layer: `lib/db/schema.ts` + yeni `lib/db/actions/showcases.ts` (yoksa) + `lib/db/queries.ts` (getShowcaseRecordings ekle)
- Migration: `lib/db/migrate-showcase-recordings.ts` (one-shot)

</code_context>

<specifics>
## Specific Ideas

- "Patron" (Elif) showcase başına farklı sayıda kayıt ister; ADE gibi 4-5 setli organizasyonlardan tek-DJ event'lere kadar değişken
- Merch event tişörtü gibi LIMITED ürünleri vurgulayacak — Shopify tarafında bu ürünler ayrı oluşturulur, admin handle ile bağlar
- Linkler "after-party venue", "ticket platform alternatif", "sponsor" gibi yapılandırılmamış şeyler — bu yüzden serbest jsonb seçildi

</specifics>

<deferred>
## Deferred Ideas

- **Per-recording aftermovie** — şu an aftermovie showcase başına tek; ileride her recording'in kendi video clip'i olabilir (out of scope)
- **Lineup management** — DJ/artist'leri ayrı tabloya bağlama; şu an `artistSlugs jsonb` yeterli
- **Showcase merch shopify collection auto-sync** — admin'de tag bazlı otomatik filtreleme; v2
- **Recording playback unified player** — mevcut MiniPlayer'a recordings'i de basabilmek; v2
- **Linkler için ikon kütüphanesi** — sponsor/venue/vs için type-based ikon; ihtiyaç olursa v2'de eklenebilir (şu an serbest)

</deferred>

---

*Phase: 08-showcase-detail-enhancements-per-event-merch-shopify-product*
*Context gathered: 2026-04-30*
