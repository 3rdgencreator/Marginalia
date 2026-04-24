import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const { artistName, email, soundcloudLink, message, instagram, spotify, _hp } = body;

  // Honeypot — silently drop bot submissions
  if (_hp) return NextResponse.json({ ok: true });

  if (!artistName || !email || !soundcloudLink) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  if (!soundcloudLink.includes('soundcloud.com')) {
    return NextResponse.json({ error: 'Please provide a SoundCloud link' }, { status: 400 });
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    // Dev mode — accept without sending
    return NextResponse.json({ ok: true });
  }

  const lines = [
    `Artist Name: ${artistName}`,
    `Email: ${email}`,
    `SoundCloud: ${soundcloudLink}`,
    instagram ? `Instagram: ${instagram}` : null,
    spotify ? `Spotify: ${spotify}` : null,
    message ? `\nMessage:\n${message}` : null,
  ].filter(Boolean).join('\n');

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Marginalia Website', email: 'noreply@marginalialabel.com' },
        to: [{ email: 'elif@marginalialabel.com', name: 'Elif' }],
        replyTo: { email, name: artistName },
        subject: `Demo Submission — ${artistName}`,
        textContent: lines,
      }),
    });

    if (res.ok) return NextResponse.json({ ok: true });
    const err = await res.text();
    console.error('Brevo demo error:', err);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  } catch (e) {
    console.error('Demo submission error:', e);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
