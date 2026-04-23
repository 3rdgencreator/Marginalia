'use client';
import { useState, useEffect } from 'react';

const BACKGROUNDS = [
  '/backgrounds/MARGINALIA_EP_10_BG.jpg',
  '/backgrounds/MARGINALIA_EP_11_BG.jpg',
  '/backgrounds/MARGINALIA_EP_12_BG.jpg',
  '/backgrounds/MARGINALIA_EP_13_BG-2.jpg',
  '/backgrounds/MARGINALIA_EP_13_BG-3.jpg',
  '/backgrounds/MARGINALIA_EP_13_BG.jpg',
  '/backgrounds/MARGINALIA_EP_14_BG.jpg',
  '/backgrounds/MARGINALIA_EP_15_BG.jpg',
  '/backgrounds/MARGINALIA_EP_16_BG.jpg',
  '/backgrounds/MARGINALIA_EP_17_Background.jpg',
  '/backgrounds/MARGINALIA_EP_6_BG1.jpg',
  '/backgrounds/MARGINALIA_EP_6_BG2.jpg',
  '/backgrounds/MARGINALIA_EP_7_BG.jpg',
  '/backgrounds/MARGINALIA_EP_8_BG.jpg',
  '/backgrounds/MARGINALIA_EP_9_BG.jpg',
  '/backgrounds/MRGNL018_VA_BG.jpg',
  '/backgrounds/MRGNL019_Reels_BG.jpg',
  '/backgrounds/MRGNL020_EP_COVER-BG.jpg',
  '/backgrounds/Marginalia_ReelsBG-2.jpg',
  '/backgrounds/Marginalia_ReelsBG-3.jpg',
  '/backgrounds/Marginalia_ReelsBG-4.jpg',
  '/backgrounds/Marginalia_ReelsBG-5.jpg',
  '/backgrounds/Marginalia_ReelsBG-6.jpg',
  '/backgrounds/Marginalia_ReelsBG6.jpg',
  '/backgrounds/Marginalia_ReelsBG6_blur.jpg',
  '/backgrounds/Marginalia_ep4_ReelsBG.jpg',
  '/backgrounds/Marginaliaep3_ReelsBG.jpg',
  '/backgrounds/Marginaliaep5_ReelsBG.jpg',
];

export default function RandomBackground({
  children,
  overlay = 'bg-black/65',
}: {
  children: React.ReactNode;
  overlay?: string;
}) {
  const [bg, setBg] = useState('');

  useEffect(() => {
    setBg(BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)]);
  }, []);

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={bg ? { backgroundImage: `url('${bg}')`, opacity: 0.7, filter: 'blur(3px)', transform: 'scale(1.01)' } : {}}
        aria-hidden="true"
      />
      <div className={`relative min-h-screen ${overlay}`}>{children}</div>
    </div>
  );
}
