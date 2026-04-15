"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { AssessmentProfile } from "../../lib/assessment";

interface MoodEntry {
  date: string;
  score: number; // 1–5
  label: string;
  emoji: string;
}

interface JournalEntry {
  id: string;
  date: string;
  text: string;
  reflection: string;
  mood: number;
}

const MOODS = [
  { emoji: "😭", label: "Terrible", score: 1, color: "#f43f5e" },
  { emoji: "😕", label: "Bad", score: 2, color: "#f97316" },
  { emoji: "😐", label: "Okay", score: 3, color: "#f59e0b" },
  { emoji: "🙂", label: "Good", score: 4, color: "#14b8a6" },
  { emoji: "😄", label: "Great", score: 5, color: "#10b981" },
];

function MoodChart({ history }: { history: MoodEntry[] }) {
  const max = 5;
  const width = 280;
  const height = 80;
  const pad = 16;
  const chartW = width - pad * 2;
  const chartH = height - pad * 2;
  const n = history.length;

  if (n < 2) return (
    <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: "24px 0" }}>
      Log 2+ moods to see your trend chart
    </div>
  );

  const pts = history.map((h, i) => ({
    x: pad + (i / (n - 1)) * chartW,
    y: pad + (1 - (h.score - 1) / (max - 1)) * chartH,
  }));

  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${path} L ${pts[pts.length - 1].x} ${height - pad} L ${pts[0].x} ${height - pad} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#chartGrad)" />
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--accent)" stroke="var(--bg-primary)" strokeWidth="2">
          <title>{history[i].label} – {history[i].date}</title>
        </circle>
      ))}
    </svg>
  );
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<AssessmentProfile | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodLogged, setMoodLogged] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "journal" | "sessions">("overview");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const p = localStorage.getItem("mindwiseProfile");
    if (p) setProfile(JSON.parse(p));

    const mh = localStorage.getItem("mindwiseMoodHistory");
    if (mh) setMoodHistory(JSON.parse(mh));

    const jl = localStorage.getItem("mindwiseJournals");
    if (jl) setJournals(JSON.parse(jl));

    const u = localStorage.getItem("mindwiseUser");
    if (u) {
      try {
        const parsed = JSON.parse(u);
        setUserId(parsed.id);
        
        // Fetch from backend
        fetch(`/api/mood?userId=${parsed.id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.history && data.history.length > 0) {
              setMoodHistory(data.history);
              localStorage.setItem("mindwiseMoodHistory", JSON.stringify(data.history));
            }
          })
          .catch(() => {});

        fetch(`/api/journal?userId=${parsed.id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.journals && data.journals.length > 0) {
              setJournals(data.journals);
              localStorage.setItem("mindwiseJournals", JSON.stringify(data.journals));
            }
          })
          .catch(() => {});
      } catch {}
    }
  }, []);

  const handleMoodLog = async () => {
    if (selectedMood === null) return;
    const mood = MOODS[selectedMood];
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const entry: MoodEntry = { date: today, score: mood.score, label: mood.label, emoji: mood.emoji };
    const updated = [...moodHistory.slice(-6), entry];
    setMoodHistory(updated);
    localStorage.setItem("mindwiseMoodHistory", JSON.stringify(updated));
    setMoodLogged(true);

    try {
      await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, date: today, score: mood.score, label: mood.label, emoji: mood.emoji }),
      });
    } catch {}
  };

  const handleJournalSubmit = async () => {
    if (!journalText.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/journal/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: journalText,
          profile,
          userId,
          mood: selectedMood !== null ? MOODS[selectedMood].score : 3,
        }),
      });
      const data = await res.json();
      const entry: JournalEntry = {
        id: data.entry?.id || Date.now().toString(),
        date: data.entry?.date || new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        text: journalText,
        reflection: data.reflection || "Thank you for sharing. Your words matter.",
        mood: selectedMood !== null ? MOODS[selectedMood].score : 3,
      };
      const updated = [entry, ...journals];
      setJournals(updated);
      localStorage.setItem("mindwiseJournals", JSON.stringify(updated));
      setJournalText("");
    } catch {
      console.error("Journal API error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const profileSections = profile
    ? [
        { label: "Stress", value: profile.stress, icon: "⚡" },
        { label: "Anxiety", value: profile.anxiety, icon: "💭" },
        { label: "Mood", value: profile.mood, icon: "🌤️" },
        { label: "Sleep", value: profile.sleep, icon: "🌙" },
        { label: "Self-Esteem", value: profile.selfEsteem, icon: "💪" },
      ]
    : [];

  const levelColor = (v: string) => {
    if (["High", "Poor", "Low"].includes(v)) return "var(--rose)";
    if (["Moderate", "Fair", "Neutral"].includes(v)) return "var(--amber)";
    return "var(--success)";
  };

  const streak = moodHistory.length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Nav */}
      <nav className="glass" style={{
        position: "sticky", top: 0, zIndex: 50, padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid var(--border)", borderRadius: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🧠</span>
          <span style={{ fontWeight: 800, fontSize: 17 }}>Mind<span className="gradient-text">Wise AI</span></span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/therapy" className="btn btn-secondary" style={{ padding: "8px 14px", fontSize: 13 }}>🌿 Guided Sessions</Link>
          <Link href="/chat" className="btn btn-primary" style={{ padding: "8px 16px", fontSize: 13 }}>💬 Start Therapy</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 20px" }}>
        {/* Welcome */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px" }}>
            Your Wellness Dashboard
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            {streak > 0 && <span style={{ marginLeft: 12 }} className="badge badge-success">🔥 {streak}-day streak</span>}
          </p>
        </div>

        {/* Profile Cards */}
        {profile && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 28 }}>
            {profileSections.map((s) => (
              <div key={s.label} className="card" style={{ padding: "16px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: levelColor(s.value) }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {!profile && (
          <div className="alert alert-info" style={{ marginBottom: 24 }}>
            🧠 Complete your <Link href="/assessment" style={{ color: "var(--accent-light)", textDecoration: "underline" }}>psychological assessment</Link> to personalize your experience.
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "var(--bg-secondary)", borderRadius: 12, padding: 4, width: "fit-content" }}>
          {(["overview", "journal", "sessions"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "8px 18px", borderRadius: 10, border: "none", cursor: "pointer",
              font: "inherit", fontSize: 13, fontWeight: 600, transition: "all 0.2s",
              background: activeTab === tab ? "var(--bg-card)" : "transparent",
              color: activeTab === tab ? "var(--text-primary)" : "var(--text-muted)",
              boxShadow: activeTab === tab ? "0 1px 6px rgba(0,0,0,0.3)" : "none"
            }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
            {/* Mood Logger */}
            <div className="card">
              <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Today's Mood</h2>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>How are you feeling right now?</p>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                {MOODS.map((m, i) => (
                  <button key={i} id={`mood-${i}`} onClick={() => { setSelectedMood(i); setMoodLogged(false); }}
                    title={m.label}
                    style={{
                      background: "none", border: "none", cursor: "pointer", fontSize: 28,
                      filter: selectedMood === i ? "none" : "grayscale(1)",
                      transform: selectedMood === i ? "scale(1.25)" : "scale(1)",
                      transition: "all 0.2s"
                    }}>
                    {m.emoji}
                  </button>
                ))}
              </div>
              {selectedMood !== null && !moodLogged && (
                <button className="btn btn-primary" style={{ width: "100%", fontSize: 13 }} onClick={handleMoodLog}>
                  Log "{MOODS[selectedMood].label}"
                </button>
              )}
              {moodLogged && (
                <div className="alert alert-success" style={{ fontSize: 13, textAlign: "center" }}>
                  ✅ Mood logged!
                </div>
              )}
            </div>

            {/* Mood Chart */}
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontWeight: 700, fontSize: 16 }}>7-Day Mood Trend</h2>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Your emotional journey</p>
                </div>
                {moodHistory.length > 0 && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 22 }}>{moodHistory[moodHistory.length - 1].emoji}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Latest</div>
                  </div>
                )}
              </div>
              <MoodChart history={moodHistory} />
              {moodHistory.length > 0 && (
                <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                  {moodHistory.slice(-7).map((m, i) => (
                    <span key={i} title={m.label} style={{ fontSize: 18 }}>{m.emoji}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Journal Tab */}
        {activeTab === "journal" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
            <div className="card">
              <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>AI-Assisted Journaling</h2>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
                Write freely. MindWise AI will offer a gentle, empathetic reflection.
              </p>
              <textarea
                id="journal-input"
                className="input"
                style={{ minHeight: 140, marginBottom: 12 }}
                placeholder="I felt really overwhelmed during my exam today…"
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
              />
              <button
                id="journal-submit"
                className="btn btn-primary"
                style={{ fontSize: 13 }}
                disabled={isAnalyzing || !journalText.trim()}
                onClick={handleJournalSubmit}
              >
                {isAnalyzing ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Reflecting…</> : "Save & Reflect ✨"}
              </button>

              {/* Past entries */}
              {journals.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: "var(--text-secondary)" }}>Recent Entries</div>
                  {journals.slice(0, 3).map((j) => (
                    <div key={j.id} style={{ marginBottom: 16, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>{j.date}</div>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8, lineHeight: 1.5 }}>
                        {j.text.slice(0, 120)}{j.text.length > 120 ? "…" : ""}
                      </p>
                      <div style={{ background: "var(--accent-glow)", border: "1px solid var(--border-accent)", borderRadius: 10, padding: "10px 14px" }}>
                        <span style={{ fontSize: 11, color: "var(--accent-light)", fontWeight: 600 }}>🧠 MindWise Reflection: </span>
                        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{j.reflection}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card" style={{ alignSelf: "start" }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Writing Prompts</h3>
              {[
                "What made you smile today, even briefly?",
                "Describe one challenge and how you handled it.",
                "What would you tell your past self from a week ago?",
                "What's one thing you're grateful for right now?",
                "What emotion is hardest to express and why?",
              ].map((p, i) => (
                <button key={i} className="tag" style={{ display: "block", width: "100%", textAlign: "left", marginBottom: 8, fontSize: 12 }}
                  onClick={() => setJournalText(p)}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <div>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 20 }}>
              Explore guided therapy sessions tailored to your profile.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {[
                { title: "CBT Foundations", desc: "Cognitive Behavioural Therapy exercises to reframe negative thought patterns.", icon: "🧩", duration: "15 min", href: "/therapy?type=cbt" },
                { title: "Mindfulness", desc: "Guided mindfulness to anchor you in the present moment.", icon: "🌿", duration: "10 min", href: "/therapy?type=mindfulness" },
                { title: "Breathing Reset", desc: "Evidence-based breathing techniques to calm your nervous system instantly.", icon: "💨", duration: "5 min", href: "/therapy?type=breathing" },
              ].map((s, i) => (
                <Link key={i} href={s.href} style={{ textDecoration: "none" }}>
                  <div className="card" style={{ cursor: "pointer", height: "100%" }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>{s.icon}</div>
                    <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{s.title}</h3>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 16 }}>{s.desc}</p>
                    <span className="badge badge-teal">⏱ {s.duration}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}