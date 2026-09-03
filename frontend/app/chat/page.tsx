"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AssessmentProfile } from "../../lib/assessment";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const CRISIS_KEYWORDS = ["suicide", "kill myself", "end my life", "don't want to live", "self-harm", "hurt myself"];

function hasCrisisKeyword(text: string): boolean {
  return CRISIS_KEYWORDS.some((kw) => text.toLowerCase().includes(kw));
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<AssessmentProfile | null>(null);
  const [showCrisis, setShowCrisis] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionId] = useState<string>(() => "session-" + Date.now());
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let userKey = "anon";
    let nameGreeting = "";
    const u = localStorage.getItem("mindwiseUser");
    if (u) {
      try {
        const parsed = JSON.parse(u);
        if (parsed.id) setUserId(parsed.id);
        userKey = parsed.id || parsed.email || "anon";
        const isAnon = Boolean(parsed.isAnonymous) || Boolean(parsed.anonymous) || parsed.email === "anonymous" || parsed.name === "Anonymous" || parsed.name === "Anonymous User";
        if (!isAnon && parsed.name) {
          nameGreeting = ` ${parsed.name.trim()}`;
        }
      } catch {}
    }

    const stored = localStorage.getItem(`mindwiseProfile_${userKey}`) || localStorage.getItem("mindwiseProfile");
    const p: AssessmentProfile | null = stored ? JSON.parse(stored) : null;
    setProfile(p);

    // Greeting message
    const greeting = p
      ? `Hello${nameGreeting}! I'm MindWise, your personal AI companion. Based on your assessment, I can see you're experiencing some challenges — I'm here to help. What's on your mind today?`
      : `Hello${nameGreeting}! I'm MindWise, your AI mental health companion. I'm here to listen, support, and help you navigate whatever you're going through. What would you like to talk about?`;

    setMessages([{
      id: "init",
      role: "assistant",
      content: greeting,
      timestamp: new Date(),
    }]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    if (hasCrisisKeyword(text)) setShowCrisis(true);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Build conversation history for context (last 6 messages)
      const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/therapy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: text,
          conversationHistory: history,
          assessmentProfile: profile,
          userId,
          sessionId,
        }),
      });

      const data = await res.json();
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content || "I'm here with you. Can you tell me more?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [...prev, {
        id: "err",
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleEndSession = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/therapy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: "__SUMMARISE_SESSION__",
          conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
          assessmentProfile: profile,
          userId,
          sessionId,
        }),
      });
      const data = await res.json();
      setSessionSummary(data.content);
    } catch {
      setSessionSummary("Session complete. Thank you for sharing today. Remember, every conversation is a step forward.");
    } finally {
      setIsLoading(false);
    }
  };

  const profileColor = (level: string) => {
    if (level === "High" || level === "Poor" || level === "Low") return "var(--rose)";
    if (level === "Moderate" || level === "Fair" || level === "Neutral") return "var(--amber)";
    return "var(--success)";
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
      {/* Header */}
      <header className="glass" style={{
        padding: "14px 20px", display: "flex", alignItems: "center",
        justifyContent: "space-between", borderBottom: "1px solid var(--border)",
        borderRadius: 0, flexShrink: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard" className="btn btn-ghost" style={{ padding: "6px 10px" }}>←</Link>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent), var(--teal))",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
          }}>🧠</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>MindWise AI</div>
            <div style={{ fontSize: 11, color: "var(--success)", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", display: "inline-block" }} />
              Online · Therapy Session
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {profile && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {(["stress", "anxiety", "mood"] as const).map((k) => (
                <span key={k} className="badge" style={{
                  fontSize: 11, padding: "3px 8px",
                  background: "var(--bg-secondary)", border: "1px solid var(--border)"
                }}>
                  <span style={{ color: profileColor(profile[k]) }}>●</span>
                  {k}: {profile[k]}
                </span>
              ))}
            </div>
          )}
          <button className="btn btn-secondary" style={{ fontSize: 12, padding: "6px 12px" }} onClick={handleEndSession}>
            End Session
          </button>
        </div>
      </header>

      {/* Crisis Banner */}
      {showCrisis && (
        <div className="alert alert-danger fade-in" style={{
          margin: "12px 16px", borderRadius: 12, display: "flex",
          justifyContent: "space-between", alignItems: "center"
        }}>
          <span>🆘 If you're in crisis, please reach out: <strong>iCall: 9152987821</strong> · <strong>Vandrevala: 1860-2662-345</strong></span>
          <button onClick={() => setShowCrisis(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rose)", fontSize: 18 }}>×</button>
        </div>
      )}

      {/* Session Summary */}
      {sessionSummary && (
        <div className="alert alert-info fade-in" style={{ margin: "12px 16px", borderRadius: 12 }}>
          <strong>Session Summary:</strong> {sessionSummary}
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <Link href="/dashboard" className="btn btn-primary" style={{ padding: "8px 16px", fontSize: 13 }}>Back to Dashboard</Link>
            <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => setSessionSummary(null)}>Continue Chatting</button>
          </div>
        </div>
      )}

      {/* Messages */}
      <main style={{ flex: 1, overflowY: "auto", padding: "24px 16px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{
              display: "flex",
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
              alignItems: "flex-end", gap: 8
            }}>
              {msg.role === "assistant" && (
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, var(--accent), var(--teal))",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13
                }}>🧠</div>
              )}
              <div style={{
                maxWidth: "75%",
                padding: "12px 16px",
                borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: msg.role === "user"
                  ? "linear-gradient(135deg, var(--accent), #7c3aed)"
                  : "var(--bg-card)",
                border: msg.role === "user" ? "none" : "1px solid var(--border)",
                color: "var(--text-primary)",
                fontSize: 14, lineHeight: 1.6,
              }}>
                {msg.content}
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent), var(--teal))",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13
              }}>🧠</div>
              <div style={{
                padding: "12px 18px", borderRadius: "18px 18px 18px 4px",
                background: "var(--bg-card)", border: "1px solid var(--border)",
                display: "flex", gap: 4, alignItems: "center"
              }}>
                {[0, 150, 300].map((d) => (
                  <span key={d} style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "var(--accent)", display: "inline-block",
                    animation: `pulse 1.2s ease-in-out ${d}ms infinite`
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input */}
      <footer style={{
        padding: "16px", borderTop: "1px solid var(--border)",
        background: "var(--bg-secondary)", flexShrink: 0
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", gap: 10 }}>
          <input
            ref={inputRef}
            id="chat-input"
            className="input"
            style={{ flex: 1, borderRadius: 12 }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Share what's on your mind…"
            disabled={isLoading}
          />
          <button
            id="chat-send"
            className="btn btn-primary"
            style={{ borderRadius: 12, padding: "12px 20px" }}
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : "Send"}
          </button>
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
          Not a substitute for professional help · <Link href="/dashboard" style={{ color: "var(--accent-light)" }}>Dashboard</Link>
        </p>
      </footer>
    </div>
  );
}