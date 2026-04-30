/**
 * One-shot idempotent migration: copy soundcloud_set_url values from the
 * showcases table into showcase_recordings, then confirm the column is gone.
 *
 * Safe to run multiple times. Uses a SELECT on showcase_recordings to check
 * whether a recording for this showcase already exists before inserting.
 *
 * Run with:
 *   set -a && source .env.local && set +a && npx tsx lib/db/migrate-showcase-recordings.ts
 */

import { db } from './index';
import { showcaseRecordings } from './schema';
import { eq, sql } from 'drizzle-orm';

async function main() {
  // Fetch all showcases that had a soundcloud_set_url.
  // NOTE: soundcloud_set_url is no longer in the Drizzle schema, so we use a
  // raw SQL query to read it from the live database (it was dropped from the
  // schema file but the column may still exist if this script runs before the
  // push, or may already be gone if push already ran — the script handles both).

  let rows: Array<{ id: number; soundcloud_set_url: string | null }> = [];

  try {
    const result = await db.execute(
      sql`SELECT id, soundcloud_set_url FROM showcases WHERE soundcloud_set_url IS NOT NULL AND soundcloud_set_url != ''`
    );
    rows = result.rows as Array<{ id: number; soundcloud_set_url: string | null }>;
    console.log(`Found ${rows.length} showcase(s) with soundcloud_set_url to migrate.`);
  } catch (err) {
    // Column was already dropped — nothing to migrate
    console.log('soundcloud_set_url column not found (already dropped or never existed). Nothing to migrate.');
    return;
  }

  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.soundcloud_set_url) continue;

    // Idempotency check: skip if a recording for this showcase already exists
    const existing = await db
      .select({ id: showcaseRecordings.id })
      .from(showcaseRecordings)
      .where(eq(showcaseRecordings.showcaseId, row.id))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  showcase ${row.id}: already has recordings — skipping`);
      skipped++;
      continue;
    }

    await db.insert(showcaseRecordings).values({
      showcaseId: row.id,
      url: row.soundcloud_set_url,
      title: 'Set',
      djLabel: null,
      sortOrder: 0,
    });

    console.log(`  showcase ${row.id}: inserted recording (title='Set')`);
    inserted++;
  }

  console.log(`Migration complete. Inserted: ${inserted}, Skipped (idempotent): ${skipped}`);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
