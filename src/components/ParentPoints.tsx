import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { restoreParentPoints } from "@/lib/parent-points.functions";
import { reloadWallet } from "@/lib/wallet";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { parentShortcutStep } from "@/lib/parent-shortcut";
export function ParentPoints() {
  const [open, setOpen] = useState(false); const [code, setCode] = useState(""); const [points, setPoints] = useState(100);
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  const restore = useServerFn(restoreParentPoints);
  useEffect(() => {
    let previous: number | null = null;
    const key = (e: KeyboardEvent) => {
      const target = e.target;
      const editing = target instanceof HTMLElement && Boolean(target.closest('input,textarea,select,[contenteditable="true"]'));
      const result = parentShortcutStep(previous, Date.now(), { code:e.code, ctrlKey:e.ctrlKey, shiftKey:e.shiftKey, altKey:e.altKey, metaKey:e.metaKey, repeat:e.repeat, editing });
      previous = result.previous;
      if (previous !== null || result.open) e.preventDefault();
      if (result.open) setOpen(true);
    };
    window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key);
  }, []);
  return <Dialog open={open} onOpenChange={value => { setOpen(value); setCode(""); setMessage(""); }}><DialogContent><DialogHeader><DialogTitle>שחזור נקודות להורה</DialogTitle><DialogDescription>הנקודות יתווספו לחשבון הילד המחובר.</DialogDescription></DialogHeader>
    <form className="grid gap-4" onSubmit={async e => { e.preventDefault(); setBusy(true); setMessage(""); try { await restore({ data: { code, points } }); await reloadWallet(); setCode(""); setMessage("הנקודות נוספו לחשבון"); } catch (error) { setMessage(error instanceof Error ? error.message : "השחזור לא הצליח"); } finally { setBusy(false); } }}>
      <label className="grid gap-2">קוד הורה<input className="w-full rounded-lg border border-input bg-card p-3" type="password" required minLength={8} value={code} onChange={e => setCode(e.target.value)} /></label>
      <label className="grid gap-2">מספר נקודות<input className="w-full rounded-lg border border-input bg-card p-3" type="number" required min={1} max={10000} value={points} onChange={e => setPoints(Number(e.target.value))} /></label>
      <Button disabled={busy}>{busy ? "שומרים…" : "הוספת נקודות"}</Button><p role="status">{message}</p>
    </form>
  </DialogContent></Dialog>;
}