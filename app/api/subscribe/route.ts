import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email, listId } = await req.json().catch(() => ({}));

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    // No key configured — still unlock (soft gate)
    return NextResponse.json({ ok: true });
  }

  const body: Record<string, unknown> = { email, updateEnabled: true };
  if (listId) body.listIds = [Number(listId)];

  try {
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    // 201 = created, 204 = already exists — both are success
    if (res.ok || res.status === 204) {
      return NextResponse.json({ ok: true });
    }
    // Don't block the gate on Brevo errors — still unlock
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
