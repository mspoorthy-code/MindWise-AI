"use client";
import { useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [hovered, setHovered] = useState<number | null>(null);

  const features = [
    {
      icon: "🧠",
      title: "AI Therapy Chat",
      desc: "Context-aware conversations powered by Gemini AI, adapted to your psychological profile.",
    },
    {
      icon: "📊",
      title: "Mood Tracking",
      desc: "Log daily emotions and visualize 7-day trends to understand your mental health patterns.",
    },
    {
      icon: "📝",
      title: "AI-Assisted Journaling",
      desc: "Write freely and receive empathetic, personalized reflections from your AI companion.",
    },
    {
      icon: "🌿",
      title: "Guided Sessions",
      desc: "Interactive CBT, mindfulness, and breathing exercises tailored to your needs.",
    },
  ];

  const stats = [
    { value: "10+", label: "Assessment Dimensions" },
    { value: "3", label: "Therapy Modalities" },
    { value: "100%", label: "Anonymous Option" },
    { value: "24/7", label: "Always Available" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Nav */}
      <nav className="glass" style={{
        position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
        width: "calc(100% - 48px)", maxWidth: 960, zIndex: 100,
        padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🧠</span>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>
            Mind<span className="gradient-text">Wise AI</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/auth" className="btn btn-ghost" style={{ padding: "8px 16px" }}>Sign In</Link>
          <Link href="/assessment" className="btn btn-primary" style={{ padding: "8px 20px" }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", textAlign: "center",
        padding: "120px 24px 80px", position: "relative", overflow: "hidden"
      }}>
        {/* Background orbs */}
        <div style={{
          position: "absolute", width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          top: "10%", left: "50%", transform: "translateX(-50%)", pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)",
          bottom: "10%", right: "10%", pointerEvents: "none"
        }} />

        <div className="badge badge-accent fade-in" style={{ marginBottom: 24 }}>
          ✦ AI-Powered Mental Health Support
        </div>

        <h1 className="fade-in" style={{
          fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 800, lineHeight: 1.1,
          letterSpacing: "-2px", maxWidth: 800, marginBottom: 24,
          animationDelay: "0.1s"
        }}>
          Your Mind Deserves<br />
          <span className="gradient-text">Expert Care</span>
        </h1>

        <p className="fade-in" style={{
          fontSize: 18, color: "var(--text-secondary)", maxWidth: 560,
          marginBottom: 40, lineHeight: 1.7, animationDelay: "0.2s"
        }}>
          MindWise AI combines advanced AI with evidence-based therapy techniques to deliver
          personalized, judgment-free mental health support — available anytime, anywhere.
        </p>

        <div className="fade-in" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", animationDelay: "0.3s" }}>
          <Link href="/assessment" className="btn btn-primary" style={{ fontSize: 16, padding: "14px 32px" }}>
            Start Free Assessment →
          </Link>
          <Link href="/auth" className="btn btn-secondary" style={{ fontSize: 16, padding: "14px 32px" }}>
            Sign In Anonymously
          </Link>
        </div>

        {/* Stats */}
        <div className="fade-in" style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1,
          marginTop: 80, background: "var(--border)", borderRadius: "var(--radius)",
          overflow: "hidden", maxWidth: 700, width: "100%", animationDelay: "0.4s"
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: "var(--bg-card)", padding: "20px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "var(--accent-light)" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 24px", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div className="badge badge-teal" style={{ marginBottom: 16 }}>Core Features</div>
          <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-1px" }}>
            Everything You Need to <span className="gradient-text">Thrive</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {features.map((f, i) => (
            <div
              key={i}
              className="card"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                cursor: "default",
                transform: hovered === i ? "translateY(-4px)" : "none",
                transition: "all 0.25s",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: "80px 24px", textAlign: "center",
        background: "linear-gradient(180deg, transparent 0%, rgba(139,92,246,0.06) 100%)"
      }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>
          Ready to prioritize your <span className="gradient-text">mental health</span>?
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
          Takes 3 minutes. No credit card required. Completely anonymous.
        </p>
        <Link href="/assessment" className="btn btn-primary" style={{ fontSize: 16, padding: "14px 40px" }}>
          Begin Your Journey →
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
        © 2026 MindWise AI · Built with care · Not a substitute for professional medical advice
      </footer>
    </div>
  );
}