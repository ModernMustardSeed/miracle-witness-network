"use client";
import { useState, useEffect, useRef } from "react";

const GOLD = "#D4A017";
const GOLD_LIGHT = "#F5D76E";
const GOLD_PALE = "#FFF8E7";
const NAVY = "#0D1B2A";
const NAVY_DEEP = "#060E18";
const CRIMSON = "#9B1B30";
const WHITE = "#FFFFFF";

function GloryParticles({ count = 60 }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 3 + 1, duration: Math.random() * 8 + 6,
    delay: Math.random() * 5, opacity: Math.random() * 0.6 + 0.2,
  }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map((p) => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
          width: `${p.size}px`, height: `${p.size}px`, borderRadius: "50%",
          backgroundColor: GOLD_LIGHT, opacity: p.opacity,
          animation: `floatParticle ${p.duration}s ease-in-out ${p.delay}s infinite`,
          boxShadow: `0 0 ${p.size * 4}px ${GOLD}`,
        }} />
      ))}
    </div>
  );
}

function LiquidMetalCross({ size = 160 }) {
  const s = size, cx = s/2, cy = s/2;
  const armW = s*0.14, vH = s*0.72, hW = s*0.52;
  const vTop = cy - vH/2, hLeft = cx - hW/2, crossBar = cy - vH*0.12;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" style={{ display: "block", filter: "drop-shadow(0 0 30px rgba(212,160,23,0.5))" }}>
      <defs>
        <linearGradient id="metalV" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F5F5F5"/><stop offset="25%" stopColor="#C0C0C0"/>
          <stop offset="50%" stopColor="#D8D8D8"/><stop offset="75%" stopColor="#A8A8A8"/>
          <stop offset="100%" stopColor="#D0D0D0"/>
          <animate attributeName="x1" values="0;0.3;0" dur="6s" repeatCount="indefinite"/>
        </linearGradient>
        <linearGradient id="metalH" x1="0" y1="0" x2="1" y2="0.5">
          <stop offset="0%" stopColor="#D0D0D0"/><stop offset="30%" stopColor="#B0B0B0"/>
          <stop offset="60%" stopColor="#D4D4D4"/><stop offset="100%" stopColor="#E0E0E0"/>
          <animate attributeName="x2" values="1;0.7;1" dur="7s" repeatCount="indefinite"/>
        </linearGradient>
        <radialGradient id="illuminate" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor={GOLD_LIGHT} stopOpacity="0.45"/>
          <stop offset="50%" stopColor={GOLD} stopOpacity="0.15"/>
          <stop offset="100%" stopColor={GOLD} stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="crossGlow" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor={GOLD_LIGHT} stopOpacity="0.6"/>
          <stop offset="50%" stopColor={GOLD} stopOpacity="0.2"/>
          <stop offset="100%" stopColor={GOLD} stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="edgeShine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF" stopOpacity="0.9"/>
          <stop offset="50%" stopColor="#FFF" stopOpacity="0.05"/>
          <stop offset="100%" stopColor="#FFF" stopOpacity="0.3"/>
        </linearGradient>
        <filter id="outerGlow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <linearGradient id="shimmer" x1="-1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF" stopOpacity="0"/><stop offset="50%" stopColor="#FFF" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#FFF" stopOpacity="0"/>
          <animate attributeName="x1" values="-1;2" dur="4s" repeatCount="indefinite"/>
          <animate attributeName="x2" values="0;3" dur="4s" repeatCount="indefinite"/>
        </linearGradient>
        <clipPath id="crossClip">
          <rect x={cx-armW/2} y={vTop} width={armW} height={vH} rx={armW*0.15}/>
          <rect x={hLeft} y={crossBar} width={hW} height={armW} rx={armW*0.15}/>
        </clipPath>
      </defs>
      <circle cx={cx} cy={crossBar+armW/2} r={s*0.48} fill="url(#crossGlow)">
        <animate attributeName="r" values={`${s*0.46};${s*0.50};${s*0.46}`} dur="5s" repeatCount="indefinite"/>
      </circle>
      {Array.from({length:16},(_,i)=>{
        const a=(i*22.5*Math.PI)/180,inn=s*0.22,out=s*0.42+(i%2===0?s*0.06:0);
        return <line key={i} x1={cx+Math.cos(a)*inn} y1={crossBar+armW/2+Math.sin(a)*inn} x2={cx+Math.cos(a)*out} y2={crossBar+armW/2+Math.sin(a)*out} stroke={GOLD_LIGHT} strokeWidth={i%4===0?"1.5":"0.7"} opacity={i%4===0?"0.5":"0.2"}><animate attributeName="opacity" values={i%4===0?"0.5;0.15;0.5":"0.2;0.05;0.2"} dur={`${3+(i%3)}s`} repeatCount="indefinite"/></line>;
      })}
      <g filter="url(#outerGlow)">
        <rect x={cx-armW/2} y={vTop} width={armW} height={vH} rx={armW*0.15} fill="url(#metalV)"/>
        <rect x={hLeft} y={crossBar} width={hW} height={armW} rx={armW*0.15} fill="url(#metalH)"/>
      </g>
      <g style={{mixBlendMode:"overlay"}}>
        <rect x={cx-armW/2} y={vTop} width={armW} height={vH} rx={armW*0.15} fill="url(#illuminate)"/>
        <rect x={hLeft} y={crossBar} width={hW} height={armW} rx={armW*0.15} fill="url(#illuminate)"/>
      </g>
      <rect x={cx-armW/2+1} y={vTop+1} width={armW*0.35} height={vH-2} rx={armW*0.1} fill="url(#edgeShine)" opacity="0.4"/>
      <g clipPath="url(#crossClip)"><rect x={0} y={0} width={s} height={s} fill="url(#shimmer)"/></g>
    </svg>
  );
}

function SmallCross({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ filter: "drop-shadow(0 0 6px rgba(212,160,23,0.4))" }}>
      <defs>
        <linearGradient id="smMetal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0F0F0"/><stop offset="50%" stopColor="#F8F8F8"/>
          <stop offset="100%" stopColor="#E0E0E0"/>
        </linearGradient>
        <radialGradient id="smGlow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor={GOLD_LIGHT} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={GOLD} stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="16" cy="15" r="14" fill="url(#smGlow)"/>
      <rect x="14" y="4" width="4" height="24" rx="1.2" fill="url(#smMetal)"/>
      <rect x="6" y="11" width="20" height="4" rx="1.2" fill="url(#smMetal)"/>
    </svg>
  );
}

function Section({ children, bg = "transparent", style = {} }) {
  return (<div style={{ position: "relative", background: bg, padding: "80px 24px", ...style }}>
    <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>{children}</div>
  </div>);
}

function MiracleCard({ miracle, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div style={{ background: `linear-gradient(135deg, rgba(13,27,42,0.95), rgba(13,27,42,0.85))`, border: `1px solid rgba(212,160,23,0.3)`, borderRadius: 16, padding: 28, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)", backdropFilter: "blur(10px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ background: miracle.color || GOLD, color: NAVY_DEEP, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.05em", fontFamily: "'Outfit', sans-serif" }}>{miracle.type}</span>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>{miracle.location}</span>
      </div>
      <h3 style={{ color: WHITE, fontSize: 18, fontWeight: 600, lineHeight: 1.4, margin: "0 0 12px 0", fontFamily: "'Playfair Display', serif" }}>{miracle.title}</h3>
      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.6, margin: 0, fontFamily: "'Outfit', sans-serif" }}>{miracle.description}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16, color: GOLD, fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>
        <span>✦</span><span>{miracle.witnesses} witnesses</span><span style={{ margin: "0 4px", opacity: 0.3 }}>|</span><span>{miracle.date}</span>
      </div>
    </div>
  );
}

function PillarCard({ icon, title, desc }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ background: h ? `linear-gradient(135deg, rgba(212,160,23,0.15), rgba(212,160,23,0.05))` : `rgba(255,255,255,0.03)`, border: `1px solid ${h ? "rgba(212,160,23,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: 16, padding: 32, transition: "all 0.4s ease", cursor: "default", transform: h ? "translateY(-4px)" : "translateY(0)" }}>
      <div style={{ fontSize: 32, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ color: WHITE, fontSize: 18, fontWeight: 600, margin: "0 0 10px 0", fontFamily: "'Playfair Display', serif" }}>{title}</h3>
      <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, margin: 0, fontFamily: "'Outfit', sans-serif" }}>{desc}</p>
    </div>
  );
}

function AnimatedCounter({ end, duration = 2000, label, suffix = "", highlight = false }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  useEffect(() => { const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 }); if (ref.current) o.observe(ref.current); return () => o.disconnect(); }, []);
  useEffect(() => { if (!started) return; let s = 0; const step = end / (duration / 16); const t = setInterval(() => { s += step; if (s >= end) { setCount(end); clearInterval(t); } else setCount(Math.floor(s)); }, 16); return () => clearInterval(t); }, [started, end, duration]);
  return (
    <div ref={ref} style={{ textAlign: "center", position: "relative" }}>
      {highlight && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 70%)`, animation: "pulseGlow 3s ease-in-out infinite", pointerEvents: "none" }}/>}
      <div style={{ fontSize: highlight ? 56 : 48, fontWeight: 700, color: highlight ? "#FF6B35" : GOLD, fontFamily: "'Playfair Display', serif", lineHeight: 1.1, textShadow: highlight ? "0 0 30px rgba(255,107,53,0.4)" : "none" }}>{count.toLocaleString()}{suffix}</div>
      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 8, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Outfit', sans-serif" }}>{label}</div>
    </div>
  );
}

function EmailSignup() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      {!submitted ? (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={{ flex: "1 1 280px", padding: "14px 20px", borderRadius: 12, border: `1px solid rgba(212,160,23,0.3)`, background: "rgba(255,255,255,0.05)", color: WHITE, fontSize: 15, fontFamily: "'Outfit', sans-serif", outline: "none", minWidth: 200 }}/>
          <button onClick={() => { if (email) setSubmitted(true); }} style={{ padding: "14px 32px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${GOLD}, #B8860B)`, color: NAVY_DEEP, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", letterSpacing: "0.02em", whiteSpace: "nowrap" }}>Become a Witness</button>
        </div>
      ) : (
        <div style={{ textAlign: "center", color: GOLD_LIGHT, fontSize: 18, fontFamily: "'Playfair Display', serif", animation: "fadeIn 0.5s ease" }}>✦ Welcome to the Witness Network ✦</div>
      )}
    </div>
  );
}

function ScriptureBlock({ text, reference, style = {} }) {
  return (
    <div style={{ textAlign: "center", ...style }}>
      <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 16, color: "rgba(255,248,231,0.75)", maxWidth: 620, margin: "0 auto", lineHeight: 1.8 }}>"{text}"</p>
      <span style={{ display: "block", marginTop: 10, fontSize: 11, color: "rgba(212,160,23,0.55)", fontFamily: "'Outfit', sans-serif", letterSpacing: "0.15em", textTransform: "uppercase" }}>{reference}</span>
    </div>
  );
}

export default function MiracleWitnessNetwork() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);

  const sampleMiracles = [
    { type: "SALVATION", location: "Lagos, Nigeria", title: "147 people give their lives to Jesus at marketplace outreach — pastor reports entire families surrendering together", description: "What began as a small prayer meeting in an open-air market in Ikeja turned into a mass altar call. Pastor Adebayo reports 147 first-time decisions for Christ, with many saying they felt a sudden, overwhelming conviction. Local churches are organizing follow-up discipleship.", witnesses: 200, date: "Feb 6, 2026", color: "#FF6B35" },
    { type: "HEALING", location: "São Paulo, Brazil", title: "Woman walks for first time in 12 years after prayer service", description: "Maria Santos, paralyzed since a 2014 car accident, stood and walked during a Wednesday night prayer meeting at Comunidade da Graça. Medical records confirm her spinal injury was previously deemed irreversible.", witnesses: 47, date: "Feb 5, 2026", color: "#4CAF50" },
    { type: "PROVISION", location: "Nairobi, Kenya", title: "Orphanage receives exact amount needed — to the penny — from anonymous donor", description: "Hope Children's Home was 3 days from closing when an envelope arrived containing the exact $14,237.89 needed to clear all debts and fund operations through June.", witnesses: 12, date: "Feb 4, 2026", color: GOLD },
    { type: "PROTECTION", location: "Manila, Philippines", title: "Family of 6 survives building collapse — found in prayer circle under intact archway", description: "After a 5.2 earthquake collapsed their apartment building, rescue workers found the Reyes family unharmed beneath the only standing archway, kneeling in prayer exactly where the mother felt led to gather them.", witnesses: 83, date: "Feb 4, 2026", color: "#42A5F5" },
    { type: "SIGNS & WONDERS", location: "Appalachian Mountains, USA", title: "Spring appears in drought-stricken town after 40-day community prayer and fast", description: "The town of Hollow Creek, population 340, had been without water for 6 months. On the 40th day of a community-wide fast, a fresh spring broke through on the church property.", witnesses: 340, date: "Feb 3, 2026", color: "#AB47BC" },
  ];

  const pillars = [
    { icon: "🔴", title: "Daily Miracle Report", desc: "10-15 minutes every morning. The top miracles from the last 24 hours, sourced globally by AI and verified by our team." },
    { icon: "⚡", title: "Miracle Alerts", desc: "Breaking miracle news delivered as 60-second Shorts. 3-5 per day. Designed for sharing." },
    { icon: "🎙️", title: "Witness Interviews", desc: "Deep-dive conversations with the people behind the miracles. Raw. Real. Unscripted testimonies." },
    { icon: "📖", title: "The Miracle Rolodex", desc: "A living, searchable database of verified miracles worldwide. Browse by type, location, date." },
    { icon: "🙏", title: "Gratitude Rolodex", desc: "Log your daily gratitude. See what the world is thankful for in real time." },
    { icon: "📬", title: "Miracle Morning", desc: "Daily newsletter at 6 AM. Three miracles, one gratitude highlight, one scripture." },
  ];

  return (
    <div style={{ background: NAVY_DEEP, color: WHITE, minHeight: "100vh", fontFamily: "'Outfit', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes floatParticle { 0%,100%{transform:translateY(0) translateX(0)} 25%{transform:translateY(-20px) translateX(10px)} 50%{transform:translateY(-10px) translateX(-10px)} 75%{transform:translateY(-30px) translateX(5px)} }
        @keyframes pulseGlow { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes breathe { 0%,100%{box-shadow:0 0 40px rgba(212,160,23,0.2)} 50%{box-shadow:0 0 80px rgba(212,160,23,0.4)} }
        @keyframes titleGlow { 0%,100%{text-shadow:0 0 40px rgba(212,160,23,0.3),0 0 80px rgba(212,160,23,0.1)} 50%{text-shadow:0 0 60px rgba(212,160,23,0.5),0 0 120px rgba(212,160,23,0.2)} }
        @keyframes megaPulse { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:0.35} 50%{transform:translate(-50%,-50%) scale(1.15);opacity:0.55} }
        @keyframes megaPulse2 { 0%,100%{transform:translate(-50%,-50%) scale(1.05);opacity:0.2} 50%{transform:translate(-50%,-50%) scale(1.25);opacity:0.4} }
        @keyframes godRaysSpin { 0%{transform:translate(-50%,-50%) rotate(0deg)} 100%{transform:translate(-50%,-50%) rotate(360deg)} }
        @keyframes verticalBeam { 0%,100%{opacity:0.3;height:140vh} 50%{opacity:0.6;height:160vh} }
        @keyframes horizontalBeam { 0%,100%{opacity:0.15;width:140vw} 50%{opacity:0.35;width:160vw} }
        @keyframes gloryBurst { 0%,100%{transform:translate(-50%,-50%) scale(0.95);opacity:0.5} 33%{transform:translate(-50%,-50%) scale(1.1);opacity:0.7} 66%{transform:translate(-50%,-50%) scale(1.02);opacity:0.55} }
        *{box-sizing:border-box;margin:0;padding:0}
        ::selection{background:rgba(212,160,23,0.3);color:white}
        a{color:${GOLD};text-decoration:none} a:hover{text-decoration:underline}
      `}</style>

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "16px 24px", background: scrollY > 50 ? "rgba(6,14,24,0.95)" : "transparent", backdropFilter: scrollY > 50 ? "blur(12px)" : "none", borderBottom: scrollY > 50 ? "1px solid rgba(212,160,23,0.1)" : "none", transition: "all 0.4s ease", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SmallCross size={32}/>
          <div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 14, color: GOLD, letterSpacing: "0.14em" }}>MIRACLE WITNESS</div>
            <div style={{ fontSize: 8, letterSpacing: "0.25em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", fontWeight: 600 }}>NETWORK</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {["Watch", "Rolodex", "Whitepaper", "Submit", "About"].map((item) => (
            <a key={item} href={item === "Whitepaper" ? "/whitepaper" : "#"} style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, letterSpacing: "0.06em", textDecoration: "none", transition: "color 0.3s ease", fontWeight: 500 }} onMouseEnter={(e) => e.target.style.color = GOLD} onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.6)"}>{item}</a>
          ))}
        </div>
      </nav>

      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "120px 24px 80px", overflow: "visible" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 80% 60% at 50% 40%, rgba(212,160,23,0.1) 0%, rgba(6,14,24,1) 70%)`, overflow: "hidden" }}/>
        <GloryParticles count={80}/>
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: "200vw", height: "200vh", borderRadius: "50%", background: `radial-gradient(circle, rgba(212,160,23,0.06) 0%, rgba(212,160,23,0.03) 25%, rgba(212,160,23,0.01) 45%, transparent 65%)`, animation: "megaPulse2 8s ease-in-out infinite", pointerEvents: "none" }}/>
        <div style={{ position: "absolute", top: "32%", left: "50%", transform: "translate(-50%,-50%)", width: "140vw", height: "140vh", borderRadius: "50%", background: `radial-gradient(circle, rgba(212,160,23,0.1) 0%, rgba(245,215,110,0.05) 20%, rgba(212,160,23,0.02) 40%, transparent 60%)`, animation: "megaPulse 7s ease-in-out infinite", pointerEvents: "none" }}/>
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 1200, height: 1200, borderRadius: "50%", background: `radial-gradient(circle, rgba(212,160,23,0.14) 0%, rgba(245,215,110,0.07) 30%, rgba(212,160,23,0.03) 55%, transparent 75%)`, animation: "gloryBurst 6s ease-in-out infinite", pointerEvents: "none" }}/>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 4, height: "160vh", background: `linear-gradient(to bottom, transparent 0%, rgba(212,160,23,0.03) 15%, rgba(245,215,110,0.15) 35%, rgba(255,255,255,0.35) 50%, rgba(245,215,110,0.15) 65%, rgba(212,160,23,0.03) 85%, transparent 100%)`, animation: "verticalBeam 5s ease-in-out infinite", pointerEvents: "none", zIndex: 1 }}/>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 60, height: "160vh", background: `linear-gradient(to bottom, transparent 0%, rgba(212,160,23,0.02) 20%, rgba(212,160,23,0.12) 50%, rgba(212,160,23,0.02) 80%, transparent 100%)`, animation: "verticalBeam 6s ease-in-out infinite", filter: "blur(15px)", pointerEvents: "none", zIndex: 1 }}/>
        <div style={{ position: "absolute", top: "28%", left: "50%", transform: "translate(-50%,-50%)", width: "140vw", height: 3, background: `linear-gradient(to right, transparent 0%, rgba(212,160,23,0.02) 15%, rgba(255,255,255,0.3) 50%, rgba(212,160,23,0.02) 85%, transparent 100%)`, animation: "horizontalBeam 6s ease-in-out infinite", pointerEvents: "none", zIndex: 1 }}/>
        <div style={{ position: "absolute", top: "28%", left: "50%", transform: "translate(-50%,-50%)", width: "140vw", height: 40, background: `linear-gradient(to right, transparent 0%, rgba(212,160,23,0.08) 50%, transparent 100%)`, filter: "blur(12px)", pointerEvents: "none", zIndex: 1 }}/>
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 1600, height: 1600, borderRadius: "50%", background: `conic-gradient(from 0deg, transparent 0deg, rgba(212,160,23,0.04) 10deg, transparent 20deg, transparent 40deg, rgba(245,215,110,0.03) 50deg, transparent 60deg, transparent 85deg, rgba(212,160,23,0.05) 95deg, transparent 105deg, transparent 130deg, rgba(245,215,110,0.03) 140deg, transparent 150deg, transparent 175deg, rgba(212,160,23,0.04) 185deg, transparent 195deg, transparent 220deg, rgba(245,215,110,0.03) 230deg, transparent 240deg, transparent 265deg, rgba(212,160,23,0.05) 275deg, transparent 285deg, transparent 310deg, rgba(245,215,110,0.03) 320deg, transparent 330deg, transparent 360deg)`, animation: "godRaysSpin 120s linear infinite", pointerEvents: "none", maskImage: "radial-gradient(circle, white 20%, transparent 70%)", WebkitMaskImage: "radial-gradient(circle, white 20%, transparent 70%)" }}/>
        <div style={{ position: "absolute", top: "28%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(245,215,110,0.12) 20%, rgba(212,160,23,0.08) 40%, transparent 70%)`, animation: "pulseGlow 4s ease-in-out infinite", pointerEvents: "none", zIndex: 1 }}/>

        <div style={{ position: "relative", zIndex: 2, animation: "slideUp 1s ease" }}>
          <div style={{ marginBottom: 28, display: "flex", justifyContent: "center", width: "100%" }}><LiquidMetalCross size={160}/></div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(52px, 10vw, 110px)", fontWeight: 900, lineHeight: 0.95, margin: "0 0 4px 0", letterSpacing: "0.04em", textTransform: "uppercase", color: WHITE, animation: "titleGlow 5s ease-in-out infinite" }}>MIRACLE</h1>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(52px, 10vw, 110px)", fontWeight: 900, lineHeight: 0.95, margin: "0 0 6px 0", letterSpacing: "0.04em", textTransform: "uppercase", background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 40%, #B8860B 70%, ${GOLD_LIGHT} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>WITNESS</h1>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(14px, 2.5vw, 22px)", fontWeight: 600, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 36 }}>NETWORK</div>
          <p style={{ fontSize: 19, color: "rgba(255,255,255,0.7)", maxWidth: 640, margin: "0 auto 12px", lineHeight: 1.7, fontFamily: "'Outfit', sans-serif", fontWeight: 400 }}>God is still in the miracle business — and we have the receipts.</p>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", maxWidth: 560, margin: "0 auto 20px", lineHeight: 1.7, fontFamily: "'Outfit', sans-serif" }}>AI-powered. Scripture-rooted. Reporting His glory across the earth, every single day.</p>
          <ScriptureBlock text="And they overcame him by the blood of the Lamb and by the word of their testimony." reference="Revelation 12:11" style={{ marginBottom: 40 }}/>
          <EmailSignup/>
          <div style={{ marginTop: 48, display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
            {[{ label: "Watch Daily Report", icon: "▶" }, { label: "Browse the Rolodex", icon: "📖" }, { label: "Submit a Miracle", icon: "✦" }, { label: "Read the Whitepaper", icon: "📄", href: "/whitepaper" }].map((item) => (
              <a key={item.label} href={item.href || "#"} style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.45)", fontSize: 13, textDecoration: "none", transition: "color 0.3s", fontWeight: 500 }} onMouseEnter={(e) => e.target.style.color = GOLD} onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.45)"}><span style={{ fontSize: 16 }}>{item.icon}</span> {item.label}</a>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: `linear-gradient(90deg, rgba(212,160,23,0.06), rgba(212,160,23,0.12), rgba(212,160,23,0.06))`, borderTop: `1px solid rgba(212,160,23,0.12)`, borderBottom: `1px solid rgba(212,160,23,0.12)`, padding: "44px 24px" }}>
        <ScriptureBlock text="Finally, brothers and sisters, whatever is true, whatever is noble, whatever is right, whatever is pure, whatever is lovely, whatever is admirable — if anything is excellent or praiseworthy — think about such things." reference="Philippians 4:8"/>
      </div>

      <Section style={{ padding: "100px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.3em", color: GOLD, textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>What God Did Today</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, color: WHITE, margin: 0 }}>Today's Miracle Report</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))", gap: 20 }}>
          {sampleMiracles.map((m, i) => <MiracleCard key={i} miracle={m} delay={i * 200}/>)}
        </div>
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: GOLD, fontSize: 14, fontWeight: 600, textDecoration: "none", letterSpacing: "0.04em" }}>View full report + 23 more miracles →</a>
        </div>
      </Section>

      <div style={{ background: `linear-gradient(90deg, rgba(212,160,23,0.04), rgba(212,160,23,0.1), rgba(212,160,23,0.04))`, borderTop: `1px solid rgba(212,160,23,0.1)`, borderBottom: `1px solid rgba(212,160,23,0.1)`, padding: "44px 24px" }}>
        <ScriptureBlock text="Declare his glory among the nations, his marvelous deeds among all peoples." reference="Psalm 96:3"/>
      </div>

      <div style={{ background: `linear-gradient(135deg, rgba(212,160,23,0.05), rgba(6,14,24,1))`, padding: "64px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 64, fontWeight: 700, fontFamily: "'Playfair Display', serif", lineHeight: 1.1, background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 40%, #B8860B 70%, ${GOLD_LIGHT} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "titleGlow 5s ease-in-out infinite" }}>1,247+</div>
          <div style={{ color: WHITE, fontSize: 16, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'Outfit', sans-serif", marginTop: 8 }}>Lives Given to Jesus</div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "'Playfair Display', serif", fontStyle: "italic", marginTop: 8, maxWidth: 400, margin: "8px auto 0" }}>"There is rejoicing in the presence of the angels of God over one sinner who repents." — Luke 15:10</div>
        </div>
        <div style={{ textAlign: "center", marginBottom: 56, position: "relative" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,107,53,0.12) 0%, rgba(212,160,23,0.06) 40%, transparent 70%)`, animation: "pulseGlow 4s ease-in-out infinite", pointerEvents: "none" }}/>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.3em", color: "#FF6B35", textTransform: "uppercase", fontWeight: 700, marginBottom: 8, fontFamily: "'Outfit', sans-serif" }}>The Only Stat That Matters for Eternity</div>
            <AnimatedCounter end={1247} label="Souls Saved" suffix="+" highlight={true}/>
            <div style={{ marginTop: 12, fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "'Outfit', sans-serif", maxWidth: 400, margin: "12px auto 0", lineHeight: 1.6 }}>People who gave their lives to Jesus — tracked through partner churches, crusade reports, and testimony submissions worldwide.</div>
          </div>
        </div>
        <div style={{ width: 80, height: 1, background: `linear-gradient(90deg, transparent, rgba(212,160,23,0.3), transparent)`, margin: "0 auto 40px" }}/>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40 }}>
          <AnimatedCounter end={2847} label="Miracles Documented" suffix="+"/>
          <AnimatedCounter end={143} label="Countries Reporting"/>
          <AnimatedCounter end={50000} label="Daily Witnesses" suffix="+"/>
        </div>
      </div>

      <Section style={{ padding: "100px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.3em", color: GOLD, textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>How We Find His Miracles</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, color: WHITE, margin: "0 0 16px 0" }}>AI That Never Sleeps</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>Our agentic AI system scans churches, news feeds, social media, mission fields, and medical records across 50+ languages — 24 hours a day, 7 days a week.</p>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24, flexWrap: "wrap", marginBottom: 48 }}>
          {[{ step: "01", label: "DISCOVER", desc: "AI agents scan global sources continuously" }, { step: "02", label: "VERIFY", desc: "Multi-layer credibility & witness checks" }, { step: "03", label: "REPORT", desc: "Delivered daily to your screen and inbox" }].map((item, i) => (
            <div key={i} style={{ textAlign: "center", flex: "1 1 260px", maxWidth: 300 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", border: `2px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: GOLD, animation: "breathe 4s ease-in-out infinite", animationDelay: `${i * 0.5}s` }}>{item.step}</div>
              <div style={{ fontSize: 13, letterSpacing: "0.15em", color: GOLD, fontWeight: 700, marginBottom: 8 }}>{item.label}</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      <div style={{ background: `linear-gradient(90deg, rgba(212,160,23,0.04), rgba(212,160,23,0.1), rgba(212,160,23,0.04))`, borderTop: `1px solid rgba(212,160,23,0.1)`, borderBottom: `1px solid rgba(212,160,23,0.1)`, padding: "44px 24px" }}>
        <ScriptureBlock text="Very truly I tell you, whoever believes in me will do the works I have been doing, and they will do even greater things than these." reference="John 14:12"/>
      </div>

      <Section style={{ padding: "100px 24px" }}>
        <div style={{ background: `linear-gradient(135deg, rgba(13,27,42,0.9), rgba(6,14,24,0.95))`, border: `1px solid rgba(212,160,23,0.15)`, borderRadius: 24, padding: "64px 48px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, rgba(212,160,23,0.08) 0%, transparent 70%)`, pointerEvents: "none" }}/>
          <div style={{ display: "flex", gap: 48, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 400px" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.3em", color: GOLD, textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>Full Transparency</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, color: WHITE, margin: "0 0 20px 0", lineHeight: 1.2 }}>Read the Technical Whitepaper</h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, lineHeight: 1.8, marginBottom: 12 }}>We believe in radical transparency because truth is the foundation of testimony. Our whitepaper details every source we scan, how our AI classifies miracles, how the Witness Score is calculated, and the full technology stack powering MWN.</p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>From PubMed medical journals to Reddit testimonies, from church ministry feeds to Google News — know exactly where we look and how we verify what God is doing.</p>
              <a href="/whitepaper" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 32px", borderRadius: 12, border: `1px solid ${GOLD}`, color: GOLD, fontSize: 14, fontWeight: 700, textDecoration: "none", letterSpacing: "0.04em" }}>📄 Read the Whitepaper</a>
            </div>
            <div style={{ flex: "1 1 320px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[{ num: "✝", label: "Salvation Tracked", sub: "Lives given to Jesus — the ultimate miracle" }, { num: "5", label: "Scanner Agents", sub: "News · Reddit · Social · Medical · Church" }, { num: "5", label: "AI Pipeline Stages", sub: "Filter → Classify → Score → Scripture → Content" }, { num: "11", label: "Miracle Categories", sub: "Salvation through Resurrection" }].map((item, i) => (
                <div key={i} style={{ background: "rgba(212,160,23,0.05)", border: "1px solid rgba(212,160,23,0.1)", borderRadius: 14, padding: "20px 16px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: GOLD, lineHeight: 1 }}>{item.num}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: WHITE, marginTop: 6, letterSpacing: "0.03em" }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4, lineHeight: 1.4 }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section bg={`linear-gradient(180deg, ${NAVY_DEEP}, rgba(13,27,42,0.5))`} style={{ padding: "100px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.3em", color: GOLD, textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>Everything You Need</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, color: WHITE, margin: 0 }}>Six Ways to Witness</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 20 }}>
          {pillars.map((p, i) => <PillarCard key={i} {...p}/>)}
        </div>
      </Section>

      <Section style={{ padding: "100px 24px" }}>
        <div style={{ background: `linear-gradient(135deg, rgba(212,160,23,0.1), rgba(212,160,23,0.03))`, border: `1px solid rgba(212,160,23,0.2)`, borderRadius: 24, padding: "64px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -100, right: -100, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, rgba(212,160,23,0.08) 0%, transparent 70%)` }}/>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, color: WHITE, margin: "0 0 16px 0" }}>Have You Witnessed a Miracle?</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, maxWidth: 500, margin: "0 auto 32px", lineHeight: 1.7 }}>Every miracle deserves to be told. Submit your testimony and become part of the largest miracle archive in history.</p>
          <button style={{ padding: "16px 40px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${GOLD}, #B8860B)`, color: NAVY_DEEP, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", letterSpacing: "0.03em" }}>Submit Your Testimony ✦</button>
        </div>
      </Section>

      <div style={{ background: `linear-gradient(180deg, ${NAVY_DEEP}, rgba(13,27,42,1))`, padding: "100px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <GloryParticles count={30}/>
        <div style={{ position: "relative", zIndex: 2 }}>
          <LiquidMetalCross size={90}/>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, color: WHITE, margin: "32px 0 24px", lineHeight: 1.2 }}>His Glory Covers the Earth<br/><span style={{ color: GOLD }}>We Just Report It</span></h2>
          <ScriptureBlock text="For the earth will be filled with the knowledge of the glory of the LORD as the waters cover the sea." reference="Habakkuk 2:14" style={{ marginBottom: 40 }}/>
          <EmailSignup/>
          <div style={{ marginTop: 64, display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
            {[{ label: "YouTube", icon: "▶", href: "https://youtube.com/@MiracleWitnessNetwork" }, { label: "Instagram", icon: "◉", href: "https://instagram.com/miraclewitnessnetwork" }, { label: "TikTok", icon: "♪", href: "https://tiktok.com/@miraclewitnessnetwork" }, { label: "X / Twitter", icon: "𝕏", href: "https://x.com/miraclewitnessn" }, { label: "Podcast", icon: "🎙" }].map((s) => (
              <a key={s.label} href={s.href || "#"} style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, textDecoration: "none", display: "flex", alignItems: "center", gap: 6, transition: "color 0.3s" }} onMouseEnter={(e) => e.target.style.color = GOLD} onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.35)"}><span>{s.icon}</span> {s.label}</a>
            ))}
          </div>
        </div>
      </div>

      <footer style={{ borderTop: `1px solid rgba(212,160,23,0.1)`, padding: "32px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
          <SmallCross size={22}/>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: GOLD, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>MIRACLE WITNESS NETWORK</span>
        </div>
        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 13, color: "rgba(255,248,231,0.45)", maxWidth: 500, margin: "0 auto 16px", lineHeight: 1.8 }}>"I am the way and the truth and the life. No one comes to the Father except through me."<span style={{ display: "block", marginTop: 4, fontStyle: "normal", fontSize: 10, color: "rgba(212,160,23,0.35)", letterSpacing: "0.15em", fontFamily: "'Outfit', sans-serif" }}>JOHN 14:6</span></p>
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, lineHeight: 1.8 }}>miraclewitnessnetwork@gmail.com · miraclewitness.network<br/>Built by Modern Mustard Seed · Powered by AI · Fueled by Faith<br/>© 2026 Miracle Witness Network. All rights reserved.</p>
      </footer>
    </div>
  );
}
