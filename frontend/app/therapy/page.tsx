"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

interface Step {
  instruction: string;
  detail?: string;
  duration?: number; // seconds for timed steps
}

interface Session {
  type: string;
  title: string;
  icon: string;
  description: string;
  color: string;
  steps: Step[];
}

const SESSIONS: Record<string, Session> = {
  cbt: {
    type: "cbt",
    title: "CBT Thought Journal",
    icon: "🧩",
    description: "Cognitive Behavioural Therapy helps you identify and reframe negative thought patterns.",
    color: "var(--accent)",
    steps: [
      { instruction: "Notice the Thought", detail: "Identify a recurring negative thought you've had recently. Write it down mentally or on paper. Don't judge it — just notice it." },
      { instruction: "Examine the Evidence", detail: "Ask yourself: What evidence supports this thought? What evidence contradicts it? Be honest and balanced." },
      { instruction: "Identify the Distortion", detail: "Is this thought catastrophising? All-or-nothing thinking? Mind-reading? Labelling yourself? Name the pattern." },
      { instruction: "Reframe the Thought", detail: "Create a more balanced, realistic alternative. Instead of 'I always fail', try 'I struggle sometimes, but I've also succeeded in the past.'" },
      { instruction: "Behavioural Action", detail: "What one small action can you take today that aligns with your reframed thought? Even 5 minutes counts." },
    ],
  },
  mindfulness: {
    type: "mindfulness",
    title: "5-Sense Grounding",
    icon: "🌿",
    description: "Anchor yourself in the present moment using your five senses.",
    color: "var(--teal)",
    steps: [
      { instruction: "Find Your Space", detail: "Sit or stand comfortably. Close your eyes if you wish. Take one slow, deep breath in through your nose, and out through your mouth." },
      { instruction: "5 Things You Can See", detail: "Open your eyes. Name 5 things you can see right now. Notice colours, textures, shapes. Take your time." },
      { instruction: "4 Things You Can Touch", detail: "Notice 4 things you can physically feel — the weight of your clothes, your feet on the floor, your hands in your lap." },
      { instruction: "3 Things You Can Hear", detail: "Listen carefully. Identify 3 sounds — near or far. Your breath, a fan, distant traffic, whatever is present." },
      { instruction: "2 Things You Can Smell", detail: "Notice 2 scents in your environment, however subtle. If you can't smell anything, recall a favourite scent." },
      { instruction: "1 Thing You Can Taste", detail: "Notice 1 taste in your mouth right now. Breathe slowly. You are present. You are here. Well done." },
    ],
  },
  breathing: {
    type: "breathing",
    title: "Box Breathing Reset",
    icon: "💨",
    description: "A Navy SEAL-approved breathing technique to calm your nervous system in minutes.",
    color: "var(--success)",
    steps: [
      { instruction: "Get Comfortable", detail: "Sit upright. Relax your shoulders. Place your hands in your lap. We'll use the 4-4-4-4 box breathing pattern." },
      { instruction: "Inhale — 4 counts", detail: "Breathe in slowly through your nose for 4 counts: 1… 2… 3… 4…", duration: 4 },
      { instruction: "Hold — 4 counts", detail: "Hold your breath gently for 4 counts: 1… 2… 3… 4…", duration: 4 },
      { instruction: "Exhale — 4 counts", detail: "Slowly breathe out through your mouth for 4 counts: 1… 2… 3… 4…", duration: 4 },
      { instruction: "Hold — 4 counts", detail: "Hold empty for 4 counts: 1… 2… 3… 4…", duration: 4 },
      { instruction: "Round 2 — Inhale", detail: "Breathe in again slowly for 4 counts: 1… 2… 3… 4…", duration: 4 },
      { instruction: "Round 2 — Hold", detail: "Hold: 1… 2… 3… 4…", duration: 4 },
      { instruction: "Round 2 — Exhale", detail: "Breathe out: 1… 2… 3… 4…", duration: 4 },
      { instruction: "Complete", detail: "Well done. Your nervous system has reset. Notice the calm. Carry it with you." },
    ],
  },
};

function TherapyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type") || "";
  const session = SESSIONS[type];

  const [step, setStep] = useState(-1); // -1 = intro
  const [completed, setCompleted] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [ticking, setTicking] = useState(false);

  const currentStep = session?.steps[step];

  const startCountdown = useCallback((seconds: number) => {
    setCountdown(seconds);
    setTicking(true);
  }, []);

  useEffect(() => {
    if (!ticking || countdown <= 0) return;
    const t = setTimeout(() => {
      setCountdown((c) => {
        if (c <= 1) { setTicking(false); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [ticking, countdown]);

  const handleNext = async () => {
    if (step >= (session?.steps.length ?? 0) - 1) {
      setCompleted(true);
      // Save completion
      const completions = JSON.parse(localStorage.getItem("mindwiseCompletions") || "[]");
      completions.push({ type, date: new Date().toISOString() });
      localStorage.setItem("mindwiseCompletions", JSON.stringify(completions));

      let userId = null;
      try {
        const u = localStorage.getItem("mindwiseUser");
        if (u) userId = JSON.parse(u).id;
      } catch {}

      try {
        await fetch("/api/therapy/guided/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, type }),
        });
      } catch {}
    } else {
      const nextStep = step + 1;
      setStep(nextStep);
      const dur = session?.steps[nextStep]?.duration;
      if (dur) startCountdown(dur);
    }
  };

  if (!session) {
    return (
      <div style={centeredStyle}>
        <div className="card" style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🌿</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Choose a Session</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Object.values(SESSIONS).map((s) => (
              <Link key={s.type} href={`/therapy?type=${s.type}`} style={{ textDecoration: "none" }}>
                <div className="card" style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
                  <span style={{ fontSize: 28 }}>{s.icon}</span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 700 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.description}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div style={centeredStyle}>
        <div className="card fade-in" style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Session Complete!</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
            You completed <strong>{session.title}</strong>. Take a moment to notice how you feel.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Link href="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
            <button className="btn btn-secondary" onClick={() => { setStep(-1); setCompleted(false); }}>Repeat Session</button>
          </div>
        </div>
      </div>
    );
  }

  const progress = step < 0 ? 0 : ((step + 1) / session.steps.length) * 100;

  return (
    <div style={centeredStyle}>
      <div className="card fade-in" style={{ maxWidth: 540, width: "100%" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <Link href="/dashboard" className="btn btn-ghost" style={{ padding: "6px 10px", fontSize: 13 }}>← Dashboard</Link>
          <span className="badge" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", fontSize: 12 }}>
            {session.icon} {session.title}
          </span>
          {step >= 0 && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{step + 1}/{session.steps.length}</span>}
        </div>

        {step >= 0 && (
          <div className="progress-bar" style={{ marginBottom: 24 }}>
            <div className="progress-bar-fill" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${session.color}, var(--teal))` }} />
          </div>
        )}

        {/* Intro */}
        {step === -1 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>{session.icon}</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>{session.title}</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: 28, lineHeight: 1.6 }}>{session.description}</p>
            <div className="alert alert-info" style={{ marginBottom: 24, textAlign: "left" }}>
              <strong>Before you begin:</strong> Find a comfortable, quiet space. You have {session.steps.length} steps ahead of you.
            </div>
            <button className="btn btn-primary" style={{ width: "100%", fontSize: 15, padding: "13px" }}
              onClick={() => { setStep(0); if (session.steps[0]?.duration) startCountdown(session.steps[0].duration); }}>
              Begin Session →
            </button>
          </div>
        )}

        {/* Active Step */}
        {step >= 0 && currentStep && (
          <div style={{ textAlign: "center" }}>
            {/* Countdown */}
            {ticking && countdown > 0 && (
              <div style={{
                width: 80, height: 80, borderRadius: "50%", margin: "0 auto 20px",
                background: `conic-gradient(${session.color} ${(1 - countdown / (currentStep.duration || 4)) * 360}deg, var(--bg-secondary) 0deg)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, fontWeight: 800, color: "var(--text-primary)",
                border: `2px solid var(--border)`
              }}>
                {countdown}
              </div>
            )}

            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 14 }}>{currentStep.instruction}</h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 28, fontSize: 15 }}>
              {currentStep.detail}
            </p>

            <button
              className="btn btn-primary"
              style={{ width: "100%", fontSize: 15, padding: "13px" }}
              onClick={handleNext}
              disabled={ticking && countdown > 0}
            >
              {ticking && countdown > 0 ? `Wait ${countdown}s…` : step >= session.steps.length - 1 ? "Complete Session ✓" : "Next Step →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const centeredStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: 24, background: "var(--bg-primary)"
};

export default function TherapyPage() {
  return (
    <Suspense fallback={<div style={centeredStyle}><div className="spinner" /></div>}>
      <TherapyContent />
    </Suspense>
  );
}
