import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'Miracle Witness Network — the world’s good news, gathered every hour';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const PAPER = '#FBF7EF';
const INK = '#1B1815';
const EMBER = '#B4471B';
const RULE = '#E4DACA';

/**
 * Resolves the real font file behind a Google Fonts family. If the network is
 * not there at build time the card still renders, just in the default face,
 * which is why nothing below depends on the font having loaded.
 */
async function loadFont(family: string, weight: number, text: string) {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } },
    ).then((response) => response.text());

    const url = /src:\s*url\((https:\/\/[^)]+)\)/.exec(css)?.[1];
    if (!url) return null;
    return await fetch(url).then((response) => response.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function Image() {
  const headline = 'Witness Network';
  const rest =
    'MIRACLE Real stories. Named sources. Every one you can check. The world’s good news, gathered every hour. RESCUE REVIVAL HEALING PROVISION REUNION KINDNESS JUSTICE RENEWAL';

  const [displayFont, sansFont] = await Promise.all([
    loadFont('Fraunces', 600, headline),
    loadFont('Inter', 600, rest),
  ]);

  const fonts = [
    ...(displayFont ? [{ name: 'Fraunces', data: displayFont, weight: 600 as const }] : []),
    ...(sansFont ? [{ name: 'Inter', data: sansFont, weight: 600 as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: PAPER,
          padding: '58px 64px',
          fontFamily: sansFont ? 'Inter' : 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${RULE}`,
            paddingBottom: 18,
            fontSize: 20,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: '#5C554C',
          }}
        >
          <span>Good news, gathered every hour</span>
          <span style={{ color: EMBER }}>Eight desks</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
          <span
            style={{
              fontSize: 30,
              letterSpacing: 10,
              textTransform: 'uppercase',
              color: EMBER,
              fontWeight: 600,
            }}
          >
            Miracle
          </span>
          <span
            style={{
              fontSize: 132,
              lineHeight: 1,
              marginTop: 8,
              color: INK,
              fontFamily: displayFont ? 'Fraunces' : 'serif',
              fontWeight: 600,
              letterSpacing: -3,
            }}
          >
            {headline}
          </span>
          <span style={{ fontSize: 34, marginTop: 26, color: '#5C554C' }}>
            Real stories. Named sources. Every one you can check.
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {['#33614A', '#B4471B', '#2A5A85', '#8A6212', '#6A3358', '#A2384F', '#3B4A8C', '#4A6A2B'].map(
            (color) => (
              <div key={color} style={{ flex: 1, height: 10, background: color }} />
            ),
          )}
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length > 0 ? fonts : undefined },
  );
}
