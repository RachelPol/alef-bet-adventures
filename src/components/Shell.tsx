import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function Shell({ title, score, wide, children }: { title: string; score?: number; wide?: boolean; children: ReactNode }) {
  const width = wide ? "max-w-6xl" : "max-w-3xl";
  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <header className={`mx-auto flex ${width} items-center justify-between`}>
        <Link to="/" className="rounded-full bg-card px-5 py-2 text-lg font-bold text-foreground shadow-soft">
          🏠 בית
        </Link>
        <h1 className="font-display text-3xl text-primary">{title}</h1>
        {score !== undefined ? (
          <span className="rounded-full bg-accent px-5 py-2 text-lg font-bold text-accent-foreground">⭐ {score}</span>
        ) : (
          <span />
        )}
      </header>
      <main className={`mx-auto mt-8 ${width}`}>{children}</main>
    </div>
  );
}

export function Feedback({ state }: { state: "ok" | "bad" | null }) {
  if (!state) return <div className="h-12" />;
  return (
    <div className={`h-12 text-center text-3xl font-bold animate-in zoom-in ${state === "ok" ? "text-success" : "text-destructive"}`}>
      {state === "ok" ? "כָּל הַכָּבוֹד! 🎉" : "נַסֵּה שׁוּב 💪"}
    </div>
  );
}
