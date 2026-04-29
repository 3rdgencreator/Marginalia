# Phase 8: Showcase Detail Enhancements — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-30
**Phase:** 08-showcase-detail-enhancements-per-event-merch-shopify-product
**Areas discussed:** Recordings schema, Recordings UI, Links shape, Merch binding, Recording metadata, Migration strategy, Visibility (past/upcoming)

---

## Recordings schema

| Option | Description | Selected |
|--------|-------------|----------|
| Yeni join table | showcase_recordings(id, showcase_id, url, title, dj_label, sort_order). 1-N kayıt, manuel sıralanabilir. | ✓ |
| JSONB array | showcases.recordings jsonb[{url,title,dj}]. Daha az migration ama UI/sorgulaması karışık. | |

**User's choice:** Yeni join table
**Notes:** Mevcut `showcase_photos` paterniyle uyumlu — aynı (showcase_id, sort_order, cascade FK) yapısı.

---

## Recordings UI

| Option | Description | Selected |
|--------|-------------|----------|
| Hepsi alt alta | Liste halinde her kayıt için bir SoundCloud embed + başlık. | ✓ |
| Tabs | Set başlıkları tab; aktif tab'ın embed'i görünür. | |
| İlk embed + diğerleri liste | İlk kayıt büyük embed, diğerleri başlık+link. | |

**User's choice:** Hepsi alt alta
**Notes:** Tek kayıt durumu da aynı render'ı kullanır — pattern tutarlılığı.

---

## Links shape

| Option | Description | Selected |
|--------|-------------|----------|
| Serbest jsonb [{label,url}] | Admin label ve url yazar; basit liste render. | ✓ |
| Tipli (sponsor/lineup/venue/...) | jsonb[{type,label,url}] — tipler için ikon/grup. | |

**User's choice:** Serbest jsonb [{label,url}]
**Notes:** Linkler heterojen ("after-party", "venue map", "sponsor"); type sınıflandırması katı kalır. Esneklik tercih edildi.

---

## Merch binding

| Option | Description | Selected |
|--------|-------------|----------|
| Shopify product handle dizisi | showcases.merch_handles text[]. Admin multi-select. | ✓ |
| Shopify collection handle (tek) | showcases.merch_collection varchar. Shopify'da event collection. | |

**User's choice:** Shopify product handle dizisi
**Notes:** Her event farklı ürün karması; Shopify'da koleksiyon yönetim disiplini gerekmesin.

---

## Recording metadata fields

| Option | Description | Selected |
|--------|-------------|----------|
| Title (zorunlu) | "Closing Set", "Opening Set" gibi. | ✓ |
| DJ/Artist label | "Beswerda B2B NVRMĪND" — birden fazla DJ etiketi. | ✓ |
| Sort order | Manuel sıralama — number field. | ✓ |

**User's choice:** Tümü
**Notes:** Hepsi seçildi; title NOT NULL, dj_label nullable, sort_order default 0.

---

## Migration strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Otomatik migrate | Mevcut soundcloud_set_url'leri title='Set' olarak yeni tabloya kopyala, eski kolonu drop et. | ✓ |
| Geriye dönük bırak | Eski kolon kalır; manuel taşıma. | |

**User's choice:** Otomatik migrate
**Notes:** İdempotent script; aynı showcase'e çift kayıt eklemez.

---

## Visibility (past/upcoming)

| Option | Description | Selected |
|--------|-------------|----------|
| Recordings + gallery sadece past | Mevcut pattern korunur; merch + links her ikisinde. | ✓ |
| Hepsi her zaman | Dolu olan görünür, tarih kontrolü yok. | |

**User's choice:** Recordings + gallery sadece past
**Notes:** Upcoming sayfada flyer + tickets/laylo; past'ta recordings + gallery + aftermovie. Merch ve links her zaman (dolu ise).

---

## Claude's Discretion

- Admin form repeater UI mikrodetayları (drag handle vs sort_order number input)
- Shopify multi-select picker UI patterni
- Recordings render'ında heading kullanımı
- Merch grid'in sticky/responsive davranışı

## Deferred Ideas

- Per-recording aftermovie
- Lineup management (DJ/artist tablosu bağlama)
- Showcase merch Shopify collection auto-sync
- Recordings unified player (MiniPlayer entegrasyonu)
- Linkler için ikon kütüphanesi
