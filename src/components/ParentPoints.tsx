import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { restoreParentPoints } from "@/lib/parent-points.functions";
import { reloadWallet } from "@/lib/wallet";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { parentRevealMatches } from "@/lib/parent-reveal";
export function ParentPoints({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [reveal,setReveal] = useState(""); const [unlocked,setUnlocked] = useState(false); const [code, setCode] = useState(""); const [points, setPoints] = useState(100);
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  const restore = useServerFn(restoreParentPoints);
  return <Dialog open={open} onOpenChange={value => { onOpenChange(value); setCode(""); setMessage(""); setReveal(""); setUnlocked(false); }}><DialogContent><DialogHeader><DialogTitle>{unlocked ? "שחזור נקודות להורה" : "כניסת הורה"}</DialogTitle><DialogDescription>הנקודות יתווספו לחשבון הילד המחובר.</DialogDescription></DialogHeader>
    {!unlocked ? <form className="grid gap-4" onSubmit={e=>{e.preventDefault();if(parentRevealMatches(reveal)){setUnlocked(true);setReveal("");setMessage("");}else setMessage("קוד הפתיחה אינו נכון");}}><label className="grid gap-2">קוד פתיחה<input autoFocus type="text" inputMode="numeric" maxLength={3} value={reveal} onChange={e=>setReveal(e.target.value.replace(/\D/g,""))} className="rounded-lg border border-input bg-card p-3 text-center text-2xl" /></label><Button>פתיחה</Button><p role="status">{message}</p></form> : <form className="grid gap-4" onSubmit={async e => { e.preventDefault(); setBusy(true); setMessage(""); try { await restore({ data: { code, points } }); await reloadWallet(); setCode(""); setMessage("הנקודות נוספו לחשבון"); } catch (error) { setMessage(error instanceof Error ? error.message : "השחזור לא הצליח"); } finally { setBusy(false); } }}>
      <label className="grid gap-2">קוד הורה<input className="w-full rounded-lg border border-input bg-card p-3" type="password" required minLength={8} value={code} onChange={e => setCode(e.target.value)} /></label>
      <label className="grid gap-2">מספר נקודות<input className="w-full rounded-lg border border-input bg-card p-3" type="number" required min={1} max={10000} value={points} onChange={e => setPoints(Number(e.target.value))} /></label>
      <Button disabled={busy}>{busy ? "שומרים…" : "הוספת נקודות"}</Button><p role="status">{message}</p>
    </form>}
  </DialogContent></Dialog>;
}