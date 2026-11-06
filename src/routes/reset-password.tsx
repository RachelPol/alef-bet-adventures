import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/reset-password")({ head: () => ({ meta: [{ title: "איפוס סיסמה – אָלֶף בֵּית" }, { name: "description", content: "קביעת סיסמה חדשה לחשבון הילד" }, { property: "og:title", content: "איפוס סיסמה – אָלֶף בֵּית" }, { property: "og:description", content: "חזרה בטוחה לחשבון ולנקודות" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }), component: Reset });
function Reset() {
  const [recovery, setRecovery] = useState(false); const [password, setPassword] = useState(""); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { setRecovery(new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery"); }, []);
  return <main className="mx-auto max-w-md px-5 py-12"><h1 className="mb-6 text-3xl">סִיסְמָה חֲדָשָׁה</h1>{recovery ? <form className="grid gap-4" onSubmit={async e => { e.preventDefault(); setBusy(true); const { error } = await supabase.auth.updateUser({ password }); setMessage(error ? error.message : "הסיסמה עודכנה"); setBusy(false); }}><label>סיסמה חדשה<input required type="password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-lg border bg-card p-3" /></label><Button disabled={busy}>שמירת סיסמה</Button></form> : <p>פתחו את קישור איפוס הסיסמה מהמייל</p>}<p role="status">{message}</p><Button asChild variant="link"><Link to="/auth">לחשבון שלי</Link></Button></main>;
}