"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS, scoreAssessment } from "../../lib/assessment";

export default function AssessmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 = intro
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);

  const totalQuestions = QUESTIONS.length;
  const currentQ = QUESTIONS[step - 1];
  const progress = step === 0 ? 0 : (step / totalQuestions) * 100;

  const handleStart = () => setStep(1);

  const handleAnswer = (optionIndex: number) => {
    setSelected(optionIndex);
    setTimeout(async () => {
      const newAnswers = { ...answers, [currentQ.id]: optionIndex };
      setAnswers(newAnswers);
      setSelected(null);
      if (step < totalQuestions) {
        setStep(step + 1);
      } else {
        // Score and save locally + backend
        const profile = scoreAssessment(newAnswers);
        localStorage.setItem("mindwiseProfile", JSON.stringify(profile));

        let userId = null;
        try {
          const uStr = localStorage.getItem("mindwiseUser");
          if (uStr) userId = JSON.parse(uStr).id;
        } catch {}

        try {
          await fetch("/api/assessment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, profile, answers: newAnswers }),
          });
        } catch {
          console.warn("Backend assessment save offline fallback");
        }

        setCompleted(true);
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    }, 350);
  };

  const categoryColors: Record<string, string> = {
    stress: "#f59e0b",
    anxiety: "#f43f5e",
    mood: "#8b5cf6",
    sleep: "#14b8a6",
    selfEsteem: "#10b981",
  };

  const categoryLabels: Record<string, string> = {
    stress: "Stress",
    anxiety: "Anxiety",
    mood: "Mood",
    sleep: "Sleep",
    selfEsteem: "Self-Esteem",
  };

  if (completed) {
    return (
      <div style={centeredStyle}>
        <div className="card fade-in" style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Assessment Complete</h2>
          <p style={{ color: "var(--text-secondary)" }}>Building your personalised profile…</p>
          <div className="spinner" style={{ margin: "24px auto 0" }} />
        </div>
      </div>
    );
  }

  if (step === 0) {
    return (
      <div style={centeredStyle}>
        <div className="card fade-in" style={{ maxWidth: 520, width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🧠</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
              Psychological Assessment
            </h1>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
              A 10-question assessment across 5 dimensions. Takes about 3 minutes.
              Your answers shape your personalised AI therapy experience.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <div key={key} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 14px", borderRadius: 10,
                background: "var(--bg-secondary)", border: "1px solid var(--border)"
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: categoryColors[key], flexShrink: 0
                }} />
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
              </div>
            ))}
          </div>

          <div className="alert alert-info" style={{ marginBottom: 24, fontSize: 13 }}>
            🔒 Your responses are stored securely and encrypted. Anonymous mode supported.
          </div>

          <button className="btn btn-primary" style={{ width: "100%", fontSize: 16, padding: "14px" }} onClick={handleStart}>
            Begin Assessment →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={centeredStyle}>
      <div className="card fade-in" style={{ maxWidth: 540, width: "100%" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div className="badge badge-accent">
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: categoryColors[currentQ.category]
            }} />
            {categoryLabels[currentQ.category]}
          </div>
          <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
            {step} / {totalQuestions}
          </span>
        </div>

        {/* Progress */}
        <div className="progress-bar" style={{ marginBottom: 32 }}>
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Question */}
        <h2 style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.5, marginBottom: 28, color: "var(--text-primary)" }}>
          {currentQ.text}
        </h2>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {currentQ.options.map((option, idx) => (
            <button
              key={idx}
              id={`option-${step}-${idx}`}
              onClick={() => handleAnswer(idx)}
              disabled={selected !== null}
              style={{
                padding: "14px 18px",
                borderRadius: 12,
                border: `1px solid ${selected === idx ? "var(--accent)" : "var(--border)"}`,
                background: selected === idx ? "var(--accent-glow)" : "var(--bg-secondary)",
                color: selected === idx ? "var(--accent-light)" : "var(--text-primary)",
                textAlign: "left",
                cursor: selected !== null ? "default" : "pointer",
                font: "inherit",
                fontSize: 14,
                fontWeight: selected === idx ? 600 : 400,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (selected === null) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.08)";
                }
              }}
              onMouseLeave={(e) => {
                if (selected !== idx) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-secondary)";
                }
              }}
            >
              <span style={{ marginRight: 10, opacity: 0.5 }}>
                {String.fromCharCode(65 + idx)}.
              </span>
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const centeredStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  background: "var(--bg-primary)",
};
