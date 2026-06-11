"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
  User, Mail, Shield, Zap, LogOut,
  CheckCircle2, ExternalLink, Info
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";

const TECH_STACK = [
  { name: "Next.js 15",     role: "Frontend framework",     status: "active" },
  { name: "FastAPI",        role: "Backend API",             status: "active" },
  { name: "PostgreSQL",     role: "Database",                status: "active" },
  { name: "Gemini 2.0",     role: "AI estimation engine",    status: "active" },
  { name: "Vercel",         role: "Frontend hosting",        status: "active" },
  { name: "Render",         role: "Backend hosting",         status: "active" },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [pinging, setPinging] = useState(false);

  const pingBackend = async () => {
    setPinging(true);
    setPingResult(null);
    try {
      const start = Date.now();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`);
      const ms = Date.now() - start;
      if (res.ok) {
        setPingResult(`✅ API online — ${ms}ms response`);
        toast.success(`Backend responding in ${ms}ms`);
      } else {
        setPingResult(`⚠️ API returned ${res.status}`);
      }
    } catch {
      setPingResult("❌ Could not reach backend");
      toast.error("Backend unreachable");
    } finally {
      setPinging(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Account details and platform information
        </p>
      </div>

      {/* Profile card */}
      <section className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Profile</h3>
          </div>
        </div>
        <div className="p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-brand-500/10 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-lg font-bold text-brand-600">
            {session?.user?.name ? getInitials(session.user.name) : "?"}
          </div>
          <div className="flex-1">
            <p className="font-semibold">{session?.user?.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3 h-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Active
          </div>
        </div>
      </section>

      {/* Platform info */}
      <section className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Platform Stack</h3>
          </div>
        </div>
        <div className="divide-y divide-border">
          {TECH_STACK.map(({ name, role, status }) => (
            <div key={name} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs text-muted-foreground">{role}</p>
              </div>
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* API health check */}
      <section className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Backend Health</h3>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={pingBackend} disabled={pinging}
            className="h-8 px-4 text-xs font-medium bg-secondary hover:bg-secondary/80 border border-border rounded-lg transition-colors disabled:opacity-60">
            {pinging ? "Pinging…" : "Ping Backend"}
          </button>
          {pingResult && (
            <span className="text-xs text-muted-foreground">{pingResult}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          API URL: <code className="text-xs bg-secondary px-1.5 py-0.5 rounded font-mono">
            {process.env.NEXT_PUBLIC_API_URL}/health
          </code>
        </p>
      </section>

      {/* About */}
      <section className="bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-brand-700 dark:text-brand-300 mb-1">
              ConstructVision AI v1.0
            </p>
            <p className="text-xs text-brand-600/80 dark:text-brand-400/80 leading-relaxed">
              AI-powered construction cost estimation platform built for Indian civil engineers.
              Uses Google Gemini 2.0 Flash to generate Bills of Quantities aligned with
              CPWD/PWD rate schedules. Built in 7 days.
            </p>
          </div>
        </div>
      </section>

      {/* Sign out */}
      <button
        onClick={() => signOut({ callbackUrl: "/auth/login" })}
        className="flex items-center gap-2 h-9 px-4 text-sm font-medium text-destructive border border-destructive/30 hover:bg-destructive/10 rounded-lg transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    </div>
  );
}
