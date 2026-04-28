import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  const email = 'elif@marginalialabel.com';
  const password = 'marginalia2026';

  const existing = await db.select().from(schema.users).where(eq(schema.users.email, email));
  if (existing.length > 0) {
    console.log('Admin user already exists:', email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.insert(schema.users).values({
    email,
    name: 'Elif',
    passwordHash,
    role: 'admin',
  });

  // Seed singleton rows so updates work (upsert requires an existing row)
  await db.insert(schema.siteConfig).values({ id: 1 }).onConflictDoNothing();
  await db.insert(schema.homePage).values({ id: 1 }).onConflictDoNothing();
  await db.insert(schema.aboutPage).values({ id: 1 }).onConflictDoNothing();
  await db.insert(schema.demoPage).values({ id: 1 }).onConflictDoNothing();

  console.log('✓ Admin user created:', email);
  console.log('✓ Password:', password);
  console.log('✓ Singleton rows seeded');
  console.log('\nChange the password after first login!');
}

seed().catch(console.error);
