export const metadata = {
  title: "Miracle Witness Network — AI-Powered Miracle News Bureau",
  description: "God is still in the miracle business — and we have the receipts. AI-powered. Scripture-rooted. Reporting His glory across the earth, every single day.",
  keywords: "miracles, testimony, Jesus, healing, faith, AI, news, Christian",
  openGraph: {
    title: "Miracle Witness Network",
    description: "AI-powered miracle reporting. God never stops — and neither do we.",
    url: "https://miraclewitness.network",
    siteName: "Miracle Witness Network",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Miracle Witness Network",
    description: "AI-powered miracle reporting. God never stops — and neither do we.",
    creator: "@miraclewitnessn",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600&family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#060E18" }}>
        {children}
      </body>
    </html>
  );
}
