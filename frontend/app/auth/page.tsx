"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Mode = "login" | "signup";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const m = searchParams.get("mode");
    if (m === "signup" || m === "login") {
      setMode(m);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill all required fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setIsLoading(true);

    const userName = (name && name.trim()) || email.split("@")[0];

    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: userName }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Authentication failed. Please try again.");
        return;
      }

      const userSession = {
        id: data.user?.id || ("user-" + Date.now()),
        email: data.user?.email || email,
        name: data.user?.name || userName,
        isAnonymous: false,
        anonymous: false,
      };

      // Clear any transient previous session profile
      localStorage.removeItem("mindwiseProfile");
      localStorage.removeItem("mindwiseMoodHistory");
      localStorage.removeItem("mindwiseJournals");
      localStorage.setItem("mindwiseUser", JSON.stringify(userSession));

      const userKey = userSession.id || userSession.email;

      if (mode === "signup") {
        // Brand new user signup -> always prompt assessment
        router.push("/assessment");
      } else {
        // Login -> check if this specific user already has a saved assessment profile
        const userProfile = localStorage.getItem(`mindwiseProfile_${userKey}`) || localStorage.getItem(`mindwiseProfile_${userSession.email}`);
        if (userProfile) {
          localStorage.setItem("mindwiseProfile", userProfile);
          router.push("/dashboard");
        } else {
          // Check backend for this user's profile
          try {
            const profileRes = await fetch(`/api/assessment?userId=${userSession.id}`);
            const profileData = await profileRes.json();
            if (profileData.profile) {
              localStorage.setItem(`mindwiseProfile_${userKey}`, JSON.stringify(profileData.profile));
              localStorage.setItem("mindwiseProfile", JSON.stringify(profileData.profile));
              router.push("/dashboard");
              return;
            }
          } catch {}
          router.push("/assessment");
        }
      }
    } catch {
      // Offline / fallback handling
      const userSession = {
        id: "local-" + Date.now(),
        email,
        name: userName,
        isAnonymous: false,
        anonymous: false,
      };
      localStorage.removeItem("mindwiseProfile");
      localStorage.removeItem("mindwiseMoodHistory");
      localStorage.removeItem("mindwiseJournals");
      localStorage.setItem("mindwiseUser", JSON.stringify(userSession));

      if (mode === "signup") {
        router.push("/assessment");
      } else {
        const userKey = userSession.email;
        const userProfile = localStorage.getItem(`mindwiseProfile_${userKey}`);
        if (userProfile) {
          localStorage.setItem("mindwiseProfile", userProfile);
          router.push("/dashboard");
        } else {
          router.push("/assessment");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    // Clear any previous user's active session
    localStorage.removeItem("mindwiseProfile");
    localStorage.removeItem("mindwiseMoodHistory");
    localStorage.removeItem("mindwiseJournals");

    try {
      const res = await fetch("/api/auth/anonymous", { method: "POST" });
      const data = await res.json();
      if (data.user) {
        const user = {
          ...data.user,
          isAnonymous: true,
          anonymous: true,
        };
        localStorage.setItem("mindwiseUser", JSON.stringify(user));
      } else {
        const fallback = {
          id: "anon-" + Date.now(),
          email: "anonymous",
          name: "Anonymous User",
          isAnonymous: true,
          anonymous: true,
        };
        localStorage.setItem("mindwiseUser", JSON.stringify(fallback));
      }
    } catch {
      const fallback = {
        id: "anon-" + Date.now(),
        email: "anonymous",
        name: "Anonymous User",
        isAnonymous: true,
        anonymous: true,
      };
      localStorage.setItem("mindwiseUser", JSON.stringify(fallback));
    } finally {
      setIsLoading(false);
      // Anonymous user always starts with a fresh assessment
      router.push("/assessment");
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg-primary)", padding: 24
    }}>
      {/* Background orb */}
      <div style={{
        position: "fixed", width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
        top: "20%", left: "50%", transform: "translateX(-50%)", pointerEvents: "none"
      }} />

      <div className="card fade-in" style={{ width: "100%", maxWidth: 420, position: "relative" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🧠</div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>
            Mind<span className="gradient-text">Wise AI</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
            Your personal mental health companion
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: "flex", gap: 4, background: "var(--bg-secondary)", borderRadius: 12, padding: 4, marginBottom: 24 }}>
          {(["login", "signup"] as Mode[]).map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              id={`tab-${m}`}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 10, border: "none", cursor: "pointer",
                font: "inherit", fontSize: 13, fontWeight: 600, transition: "all 0.2s",
                background: mode === m ? "var(--bg-card)" : "transparent",
                color: mode === m ? "var(--text-primary)" : "var(--text-muted)",
              }}>
              {m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "signup" && (
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Full Name</label>
              <input id="auth-name" className="input" type="text" placeholder="e.g. Alex" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Email Address</label>
            <input id="auth-email" className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Password</label>
            <input id="auth-password" className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {error && <div className="alert alert-danger" style={{ fontSize: 13 }}>{error}</div>}

          <button id="auth-submit" className="btn btn-primary" type="submit" disabled={isLoading} style={{ width: "100%", fontSize: 15, padding: "13px" }}>
            {isLoading ? <span className="spinner" /> : (mode === "login" ? "Sign In →" : "Create Account →")}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
          <div className="divider" style={{ flex: 1, margin: 0 }} />
          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>or</span>
          <div className="divider" style={{ flex: 1, margin: 0 }} />
        </div>

        <button id="auth-anonymous" className="btn btn-secondary" style={{ width: "100%", fontSize: 14 }} onClick={handleAnonymous} disabled={isLoading}>
          🕵️ Continue Anonymously
        </button>

        <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", marginTop: 20, lineHeight: 1.6 }}>
          By continuing you agree to our Terms & Privacy Policy.<br />
          All data processed securely via MindWise Backend. <Link href="/" style={{ color: "var(--accent-light)" }}>Back to home</Link>
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
        <div className="spinner" />
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}
