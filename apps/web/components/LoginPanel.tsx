"use client";

import { useEffect, useState } from "react";
import { getSupabase, isCloudConfigured } from "@/lib/supabase";
import { useProgressStore } from "@/lib/progressStore";

export function LoginPanel() {
  const { userId, setUser, sync, syncing } = useProgressStore();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  // Track Supabase auth session and keep the progress store's user in sync.
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user?.id ?? null);
      if (data.user) void sync();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user?.id ?? null);
      if (session?.user) void sync();
    });
    return () => sub.subscription.unsubscribe();
  }, [setUser, sync]);

  if (!isCloudConfigured) {
    return (
      <div className="panel">
        <h2>Cloud Sync</h2>
        <p>
          You&apos;re using the app in <strong>guest mode</strong> — all
          progress is saved locally on this device and never leaves your
          browser.
        </p>
        <p className="muted">
          Optional cloud sync is not configured for this deployment. Set
          <code> NEXT_PUBLIC_SUPABASE_URL </code> and
          <code> NEXT_PUBLIC_SUPABASE_ANON_KEY </code> to enable cross-device
          sync.
        </p>
      </div>
    );
  }

  const signIn = async () => {
    const supabase = getSupabase();
    if (!supabase || !email) return;
    const { error } = await supabase.auth.signInWithOtp({ email });
    setMessage(
      error ? `Error: ${error.message}` : "Check your email for a sign-in link.",
    );
  };

  const signOut = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="panel">
      <h2>Cloud Sync</h2>
      {userId ? (
        <>
          <p>
            Signed in. Your progress syncs across devices{" "}
            {syncing ? "(syncing…)" : "automatically"}.
          </p>
          <button onClick={signOut}>Sign out</button>
        </>
      ) : (
        <>
          <p>Sign in to sync your progress across devices.</p>
          <div className="auth-row">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={signIn} disabled={!email}>
              Send sign-in link
            </button>
          </div>
          {message && <p className="muted">{message}</p>}
        </>
      )}
    </div>
  );
}
