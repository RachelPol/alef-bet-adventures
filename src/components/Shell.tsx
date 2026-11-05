import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { addPoints, updateWallet, useWallet } from "@/lib/wallet";

export function Shell({ title, score, wide, children }: { title: string; score?: number; wide?: boolean; children: ReactNode }) {
  const width = wide ? "max-w-6xl" : "max-w-3xl";
  const [wallet] = useWallet();
  const last = useRef(score ?? 0);
  const [earned, setEarned] = useState(0);
  const [summary, setSummary] = useState(false);
  const navigate = useNavigate();

  // Every increase of an activity's score is banked in the child's wallet.
  useEffect(() => {
    const s = score ?? 0;
    const delta = s - last.current;
    last.current = s;
    if (delta > 0) { updateWallet((w) => addPoints(w, delta)); setEarned((e) => e + delta); }
  }, [score]);

  const leave = () => (earned > 0 ? setSummary(true) : navigate({ to: "/" }));

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <header className={`mx-auto flex ${width} items-center justify-between gap-2`}>
        <button onClick={leave} className="rounded-full bg-card px-5 py-2 text-lg font-bold text-foreground shadow-soft">🏠 סִיּוּם</button>
        <h1 className="font-display text-3xl text-primary">{title}</h1>
        <div className="flex gap-2">
          {score !== undefined && <span className="rounded-full bg-accent px-4 py-2 text-lg font-bold text-accent-foreground">⭐ {score}</span>}
          <Link to="/room" className="rounded-full bg-card px-4 py-2 text-lg font-bold text-foreground shadow-soft">🪙 {wallet.points}</Link>
        </div>
      </header>
      <main className={`mx-auto mt-8 ${width}`}>{children}</main>
      {summary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-card p-8 text-center shadow-pop animate-in zoom-in">
            <div className="text-6xl">🪙</div>
            <p className="mt-2 font-display text-2xl">בַּמִּשְׂחָק הַזֶּה צָבַרְתָּ</p>
            <p className="font-display text-7xl text-primary">{earned}</p>
            <p className="text-xl">נְקֻדּוֹת! סַךְ הַכֹּל: {wallet.points}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/room" className="rounded-2xl bg-primary px-5 py-3 text-xl font-bold text-primary-foreground">🏡 לַחֶדֶר שֶׁלִּי</Link>
              <Link to="/" className="rounded-2xl bg-secondary px-5 py-3 text-xl font-bold text-secondary-foreground">🏠 בַּיִת</Link>
              <button onClick={() => setSummary(false)} className="rounded-2xl bg-muted px-5 py-3 text-xl font-bold">מַמְשִׁיכִים</button>
            </div>
          </div>
        </div>
      )}
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
