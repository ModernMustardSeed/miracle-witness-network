"use client";
import { useState, useEffect } from "react";

const GOLD = "#D4A017";
const GOLD_LIGHT = "#F5D76E";
const NAVY = "#0D1B2A";
const NAVY_DEEP = "#060E18";
const WHITE = "#FFFFFF";

function SmallCross({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ filter: "drop-shadow(0 0 6px rgba(212,160,23,0.4))" }}>
      <defs>
        <linearGradient id="smMetal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0F0F0"/><stop offset="50%" stopColor="#F8F8F8"/>
          <stop offset="100%" stopColor="#E0E0E0"/>
        </linearGradient>
        <radialGradient id="smGlow2" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor={GOLD_LIGHT} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={GOLD} stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="16" cy="15" r="14" fill="url(#smGlow2)"/>
      <rect x="14" y="4" width="4" height="24" rx="1.2" fill="url(#smMetal)"/>
      <rect x="6" y="11" width="20" height="4" rx="1.2" fill="url(#smMetal)"/>
    </svg>
  );
}

function SectionDivider() {
  return <div style={{ width: 80, height: 1, background: `linear-gradient(90deg, transparent, rgba(212,160,23,0.4), transparent)`, margin: "48px auto" }}/>;
}

function Scripture({ text, ref: reference }) {
  return (
    <div style={{ textAlign: "center", margin: "40px 0", padding: "32px 24px", background: `linear-gradient(90deg, rgba(212,160,23,0.04), rgba(212,160,23,0.08), rgba(212,160,23,0.04))`, borderTop: `1px solid rgba(212,160,23,0.1)`, borderBottom: `1px solid rgba(212,160,23,0.1)`, borderRadius: 12 }}>
      <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 15, color: "rgba(255,248,231,0.7)", maxWidth: 600, margin: "0 auto", lineHeight: 1.8 }}>&ldquo;{text}&rdquo;</p>
      <span style={{ display: "block", marginTop: 8, fontSize: 10, color: "rgba(212,160,23,0.5)", fontFamily: "'Outfit', sans-serif", letterSpacing: "0.15em", textTransform: "uppercase" }}>{reference}</span>
    </div>
  );
}

function H2({ children, id }) { return <h2 id={id} style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, color: WHITE, margin: "0 0 20px 0", lineHeight: 1.2 }}>{children}</h2>; }
function H3({ children }) { return <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: GOLD, margin: "32px 0 12px 0", letterSpacing: "0.02em" }}>{children}</h3>; }
function P({ children }) { return <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.8, margin: "0 0 16px 0", fontFamily: "'Outfit', sans-serif" }}>{children}</p>; }

function Table({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", margin: "20px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
        <thead><tr>{headers.map((h, i) => <th key={i} style={{ textAlign: "left", padding: "12px 16px", borderBottom: `2px solid rgba(212,160,23,0.3)`, color: GOLD, fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} style={{ padding: "10px 16px", borderBottom: `1px solid rgba(255,255,255,0.06)`, color: j === 0 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.5)", fontWeight: j === 0 ? 600 : 400, verticalAlign: "top", lineHeight: 1.5 }}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function TOCLink({ num, label }) {
  return <a href={`#section-${num}`} style={{ display: "flex", alignItems: "center", gap: 12, color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 14, padding: "8px 0", transition: "color 0.3s", fontFamily: "'Outfit', sans-serif" }} onMouseEnter={(e) => e.currentTarget.style.color = GOLD} onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}><span style={{ color: GOLD, fontWeight: 700, fontFamily: "'Playfair Display', serif", fontSize: 16, minWidth: 24 }}>{num}</span>{label}</a>;
}

export default function WhitepaperPage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);

  return (
    <div style={{ background: NAVY_DEEP, color: WHITE, minHeight: "100vh", fontFamily: "'Outfit', sans-serif" }}>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "16px 24px", background: scrollY > 50 ? "rgba(6,14,24,0.95)" : "transparent", backdropFilter: scrollY > 50 ? "blur(12px)" : "none", borderBottom: scrollY > 50 ? "1px solid rgba(212,160,23,0.1)" : "none", transition: "all 0.4s ease", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <SmallCross size={32}/>
          <div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 14, color: GOLD, letterSpacing: "0.14em" }}>MIRACLE WITNESS</div>
            <div style={{ fontSize: 8, letterSpacing: "0.25em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", fontWeight: 600 }}>NETWORK</div>
          </div>
        </a>
        <a href="/" style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>← Back to Home</a>
      </nav>

      <div style={{ padding: "140px 24px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, rgba(212,160,23,0.06) 0%, transparent 70%)`, pointerEvents: "none" }}/>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.3em", color: GOLD, textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>Technical Whitepaper · v1.0 · February 2026</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 800, color: WHITE, margin: "0 0 16px 0", lineHeight: 1.1 }}>How We Find<br/><span style={{ color: GOLD }}>God&rsquo;s Miracles</span></h1>
          <P>Full transparency into our AI scanning engine, credibility system, and technology stack.</P>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 24px 100px" }}>
        <div style={{ background: "rgba(212,160,23,0.04)", border: "1px solid rgba(212,160,23,0.12)", borderRadius: 16, padding: "28px 32px", marginBottom: 60 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", color: GOLD, fontWeight: 700, marginBottom: 16, textTransform: "uppercase" }}>Contents</div>
          <TOCLink num="1" label="Mission & Philosophy"/>
          <TOCLink num="2" label="System Architecture"/>
          <TOCLink num="3" label="Scanner Agents — Where We Look"/>
          <TOCLink num="4" label="AI Classification Pipeline"/>
          <TOCLink num="5" label="Miracle Categories"/>
          <TOCLink num="6" label="The Miracle Rolodex"/>
          <TOCLink num="7" label="Content Production"/>
          <TOCLink num="8" label="Technology Stack"/>
          <TOCLink num="9" label="Privacy & Ethics"/>
          <TOCLink num="10" label="Roadmap"/>
          <TOCLink num="11" label="Scripture Foundation"/>
        </div>

        <Scripture text="Declare his glory among the nations, his marvelous deeds among all peoples." ref="Psalm 96:3"/>

        <H2 id="section-1">1. Mission &amp; Philosophy</H2>
        <P>The global media ecosystem is overwhelmingly oriented toward fear, conflict, and negativity. Meanwhile, miracles — healings, answered prayers, divine interventions, unexplained medical recoveries — happen every single day around the world. They go unreported. They stay local. Testimonies that could strengthen the faith of millions never leave the church building where they happened.</P>
        <P>MWN exists to fix that.</P>
        <H3>Our Editorial Principles</H3>
        <P><strong style={{color: GOLD}}>Journalistic rigor</strong> — Facts matter. Sources matter. Details matter. We are not a hype machine.</P>
        <P><strong style={{color: GOLD}}>Faithful reverence</strong> — We believe miracles are real and God is active. We approach every report with awe.</P>
        <P><strong style={{color: GOLD}}>Discernment</strong> — Not everything labeled &ldquo;miracle&rdquo; qualifies. We filter noise from signal.</P>
        <P><strong style={{color: GOLD}}>Transparency</strong> — You deserve to know exactly how we find, evaluate, and report what we report.</P>
        <P><strong style={{color: GOLD}}>Scripture-rooted</strong> — Every miracle connects back to God&rsquo;s Word. The Bible is our anchor.</P>

        <SectionDivider/>

        <H2 id="section-2">2. System Architecture</H2>
        <P>The MWN AI Scanning Engine operates as a multi-agent system with five specialized scanner agents feeding into a centralized AI classification pipeline:</P>
        <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: "20px 24px", fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, overflowX: "auto", margin: "16px 0 24px", border: "1px solid rgba(212,160,23,0.1)" }}>
          <span style={{color: GOLD}}>SCANNER AGENTS (5)</span> → <span style={{color: "#4CAF50"}}>AI CLASSIFICATION</span> → <span style={{color: "#42A5F5"}}>MIRACLE ROLODEX</span><br/>
          <br/>
          ┌─ News Scanner&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Stage 1: FILTER<br/>
          ├─ Social Scanner&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Stage 2: CLASSIFY<br/>
          ├─ Reddit Scanner&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Stage 3: SCORE<br/>
          ├─ Medical Scanner&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Stage 4: SCRIPTURE<br/>
          └─ Church Scanner&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Stage 5: CONTENT
        </div>
        <Table headers={["Cycle", "Frequency", "Description"]} rows={[["Full scan", "Every 6 hours", "All 5 scanner agents run simultaneously"], ["News scan", "Every 2 hours", "High-frequency news sources only"], ["Medical scan", "Weekly", "PubMed and journals (slower publication)"], ["Content gen", "Daily 5:00 AM UTC", "Daily Report, Newsletter, Alerts"]]}/>

        <SectionDivider/>

        <H2 id="section-3">3. Scanner Agents — Where We Look</H2>
        <H3>3.1 News Scanner</H3>
        <P>Scans RSS feeds and Google News for miracle-related stories across global media. Sources include CBN News, Christian Post, Charisma News, Premier Christianity, Relevant Magazine, plus 20+ Google News keyword queries including &ldquo;miracle healing,&rdquo; &ldquo;unexplained medical recovery,&rdquo; &ldquo;spontaneous remission,&rdquo; and &ldquo;doctors baffled.&rdquo;</P>
        <H3>3.2 Reddit Scanner</H3>
        <P>Monitors 12 Christian subreddits including r/Christianity, r/TrueChristian, r/testimony, r/miracles, and r/PrayerTeam_amen. Filters for strong testimony indicators with minimum engagement thresholds.</P>
        <H3>3.3 Social Media Scanner</H3>
        <P>Discovers miracle content on YouTube and Twitter/X through search terms like &ldquo;miracle testimony 2026,&rdquo; &ldquo;God healed me,&rdquo; and hashtags including #miracletestimony, #Godhealed, and #answeredprayer.</P>
        <H3>3.4 Medical Scanner</H3>
        <P>Searches PubMed (the U.S. National Library of Medicine) for peer-reviewed case reports of spontaneous remission, unexplained recovery, and medically documented events that defy prognosis.</P>
        <H3>3.5 Church Scanner</H3>
        <P>Monitors church and ministry websites including Bethel Church, Healing Rooms Ministries, Sid Roth&rsquo;s It&rsquo;s Supernatural, International Mission Board, Open Doors, and Voice of the Martyrs.</P>

        <SectionDivider/>

        <H2 id="section-4">4. AI Classification Pipeline</H2>
        <P>Every raw finding passes through a 5-stage AI pipeline before reaching our audience.</P>
        <H3>Stage 1: FILTER</H3>
        <P>AI determines if a raw finding describes a genuine miracle, supernatural event, or divine intervention. Confidence threshold: ≥0.50 to proceed.</P>
        <H3>Stage 2: CLASSIFY</H3>
        <P>Extracts structured data: miracle type, headline, summary, location, people involved, witness count, date, detail level, named sources, medical documentation, and multiple witness confirmation.</P>
        <H3>Stage 3: SCORE — The Witness Score</H3>
        <P>Every miracle receives a Witness Score from 0.0 to 1.0 — a composite credibility metric.</P>
        <Table headers={["Component", "Weight", "How it's calculated"]} rows={[["Source credibility", "25%", "Based on the publishing source tier"], ["Detail level", "35%", "Specificity: names, dates, locations, records"], ["Evidence quality", "20%", "Named sources, medical docs, multiple witnesses"], ["Engagement", "20%", "Community response, shares, corroboration"]]}/>
        <H3>Source Credibility Tiers</H3>
        <Table headers={["Tier", "Sources", "Score"]} rows={[["Tier 1", "Reuters, AP, BBC, PubMed", "0.85–0.95"], ["Tier 2", "CBN, Christian Post, Relevant", "0.75–0.85"], ["Tier 3", "Bethel, IHOP, established ministries", "0.65–0.75"], ["Tier 4", "YouTube, personal blogs", "0.40–0.50"], ["Tier 5", "Reddit, Twitter, TikTok, Facebook", "0.30–0.40"]]}/>
        <P>When the same miracle is independently reported by multiple sources, the Witness Score receives up to a +0.15 corroboration boost.</P>
        <H3>Stage 4: SCRIPTURE</H3>
        <P>Every classified miracle is automatically connected to 2-3 relevant Bible verses from a curated bank of 50+ scriptures organized by miracle type.</P>
        <H3>Stage 5: CONTENT</H3>
        <P>AI generates production-ready content: short headlines for alerts, newsletter blurbs, and database tags.</P>

        <SectionDivider/>

        <H2 id="section-5">5. Miracle Categories</H2>
        <P>MWN classifies all miracles into 11 categories, with Salvation — the greatest miracle of all — at the top:</P>
        <Table headers={["Category", "Description"]} rows={[["✝️ SALVATION", "A life given to Jesus Christ — the greatest miracle. Heaven rejoices."], ["🩹 Healing", "Physical, emotional, or mental restoration"], ["🍞 Provision", "Supernatural financial or material supply"], ["🛡️ Protection", "Divine preservation from harm"], ["⛓️ Deliverance", "Freedom from bondage or oppression"], ["🔄 Restoration", "Relationships, careers, or lives rebuilt"], ["✨ Signs & Wonders", "Supernatural phenomena"], ["👁️ Divine Encounter", "Visions, dreams, encounters with God"], ["🌊 Nature Miracle", "Weather or natural phenomena altered"], ["💀 Resurrection", "Raised from the dead"], ["🙏 Answered Prayer", "Specific prayer with specific answer"]]}/>
        <div style={{ background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.2)", borderRadius: 12, padding: "20px 24px", margin: "24px 0" }}>
          <P><strong style={{color: "#FF6B35"}}>A note on Salvation:</strong> We track every reported instance of a person giving their life to Jesus Christ as the single most important metric in the Miracle Witness Network. Every healing fades. Every provision is spent. But salvation is eternal. As Jesus said: <em>&ldquo;There is rejoicing in the presence of the angels of God over one sinner who repents.&rdquo;</em> — Luke 15:10</P>
        </div>

        <SectionDivider/>

        <H2 id="section-6">6. The Miracle Rolodex</H2>
        <P>The Miracle Rolodex is our persistent, searchable database — the growing archive of every miracle we discover and verify. Each record contains full classification data, credibility scoring, source URLs, connected scriptures, and status tracking (pending → verified → published).</P>
        <P>Stored on Google Firebase Firestore for production (scalable, real-time, globally distributed) with local JSON fallback for development.</P>

        <SectionDivider/>

        <H2 id="section-7">7. Content Production</H2>
        <Table headers={["Format", "Cadence", "Platform"]} rows={[["Daily Miracle Report", "Daily", "YouTube (10-15 min)"], ["Miracle Alerts", "3-5/day", "Shorts, Reels, TikTok"], ["Miracle Morning Newsletter", "Daily at 6 AM", "Email"], ["Social media posts", "With each alert", "X, Instagram, Facebook"], ["Miracle Map", "Real-time", "Website"]]}/>

        <SectionDivider/>

        <H2 id="section-8">8. Technology Stack</H2>
        <Table headers={["Layer", "Technology", "Purpose"]} rows={[["AI Classification", "Kimi (Moonshot AI)", "Cost-effective classification & content"], ["AI Fallback", "Anthropic Claude / Google Gemini", "Premium AI for complex tasks"], ["Source Scanning", "Python agents + feedparser + aiohttp", "RSS parsing, API calls, web scanning"], ["Medical Search", "NCBI E-utilities (PubMed API)", "Peer-reviewed medical literature"], ["Database", "Google Firebase Firestore", "Scalable cloud database"], ["Website", "Next.js + React", "miraclewitness.network"], ["Hosting", "Vercel + Google Cloud Run", "Global CDN + serverless compute"], ["Scheduling", "Google Cloud Scheduler", "Automated scan cycles"], ["Container", "Docker", "Portable deployment"]]}/>

        <SectionDivider/>

        <H2 id="section-9">9. Privacy &amp; Ethics</H2>
        <H3>What we collect</H3>
        <P>Publicly available news articles and social media posts. Published medical research (open-access PubMed records). Public RSS feeds and blog posts. Community-submitted testimonies (with explicit consent).</P>
        <H3>What we do NOT do</H3>
        <P>We do not scrape private accounts or locked content. We do not access medical records without them being publicly shared. We do not identify private individuals without their public testimony. We do not fabricate, embellish, or editorialize miracle reports. We do not present unverified reports as confirmed.</P>
        <P>Every report includes its Witness Score for full transparency. Source attribution is always provided.</P>

        <SectionDivider/>

        <H2 id="section-10">10. Roadmap</H2>
        <H3>Phase 1 — Foundation (Months 1-3)</H3>
        <P>Launch 5 scanner agents, build AI classification pipeline, implement Witness Score, deploy Miracle Rolodex, launch miraclewitness.network, begin daily content production.</P>
        <H3>Phase 2 — Scale (Months 4-8)</H3>
        <P>Expand to 10+ scanners, direct Twitter/X and YouTube API integration, multi-language scanning (Spanish, Portuguese, Korean, Swahili, Mandarin), community submission portal, church partnership program, Miracle Map visualization.</P>
        <H3>Phase 3 — Ecosystem (Months 9-12+)</H3>
        <P>Mobile app (iOS + Android), Gratitude Rolodex, ElevenLabs voiceover auto-generation, podcast RSS, annual Miracle Documentary, medical institution partnerships, API access for churches and ministries.</P>

        <SectionDivider/>

        <H2 id="section-11">11. Scripture Foundation</H2>
        <P>Every architectural decision maps back to scripture:</P>
        <Scripture text="Declare his glory among the nations, his marvelous deeds among all peoples." ref="Psalm 96:3 — Why we scan globally"/>
        <Scripture text="And they overcame him by the blood of the Lamb and by the word of their testimony." ref="Revelation 12:11 — Why testimonies matter"/>
        <Scripture text="Whatever is true, whatever is noble, whatever is right, whatever is pure, whatever is lovely, whatever is admirable — if anything is excellent or praiseworthy — think about such things." ref="Philippians 4:8 — What we focus on"/>
        <Scripture text="Very truly I tell you, whoever believes in me will do the works I have been doing, and they will do even greater things than these." ref="John 14:12 — What we expect"/>
        <Scripture text="For the earth will be filled with the knowledge of the glory of the LORD as the waters cover the sea." ref="Habakkuk 2:14 — Where this ends"/>

        <div style={{ textAlign: "center", marginTop: 80, padding: "40px 0", borderTop: "1px solid rgba(212,160,23,0.1)" }}>
          <SmallCross size={28}/>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: GOLD, fontWeight: 700, letterSpacing: "0.14em", marginTop: 12 }}>MIRACLE WITNESS NETWORK</div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 12, lineHeight: 1.8 }}>miraclewitnessnetwork@gmail.com · miraclewitness.network<br/>Built by Modern Mustard Seed · Powered by AI · Fueled by Faith<br/>© 2026 Miracle Witness Network. All rights reserved.</div>
        </div>
      </div>
    </div>
  );
}
