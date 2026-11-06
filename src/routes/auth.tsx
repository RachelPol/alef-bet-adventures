import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAccount } from "@/lib/account";
import { Button } from "@/components/ui/button";
import "@lovable.dev/cloud-auth-js/styles.css";
export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "החשבון שלי – אָלֶף בֵּית" }, { name: "description", content: "כניסה לחשבון הילד לשמירת נקודות וחדר אישי" }, { property: "og:title", content: "החשבון שלי – אָלֶף בֵּית" }, { property: "og:description", content: "שם, תמונה ונקודות אישיות לכל ילד" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Auth,
});
function Auth() {
  const { user, profile, avatar, refresh, ready } = useAccount();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState<File | null>(null); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  useEffect(() => { setName(profile?.name ?? ""); }, [profile?.name]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      if (user) {
        const childName = (name || profile?.name || "").trim();
        if (!childName) throw new Error("נא להזין את שם הילד");
        let path = profile?.avatar_path ?? null;
        if (photo) {
          if (!photo.type.startsWith("image/") || photo.size > 2 * 1024 * 1024) throw new Error("בחרו תמונה עד 2MB");
          path = `${user.id}/${crypto.randomUUID()}`;
          const { error } = await supabase.storage.from("child-avatars").upload(path, photo, { contentType: photo.type }); if (error) throw error;
        }
        const { error } = await supabase.from("profiles").update({ name: childName, avatar_path: path }).eq("id", user.id); if (error) throw error;
        await refresh(); setMessage("הפרטים נשמרו");
      } else if (mode === "signup") {
        if (!name.trim()) throw new Error("נא להזין את שם הילד");
        const { error, data } = await supabase.auth.signUp({ email, password, options: { data: { name: name.trim() }, emailRedirectTo: window.location.origin } });
        if (error) throw error;
        setMessage(data.session ? "החשבון נוצר" : "שלחנו מייל לאישור החשבון. לחצו על הקישור במייל לפני הכניסה.");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` }); if (error) throw error;
        setMessage("אם קיים חשבון, נשלח קישור לאיפוס הסיסמה למייל");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error;
        await refresh();
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "הפעולה לא הצליחה"); }
    finally { setBusy(false); }
  };
  const social = async (provider: "google" | "lovable") => {
    setBusy(true); const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (result.error) setMessage(result.error.message); setBusy(false);
  };
  return <main className="mx-auto max-w-md px-5 py-8">
    <Button asChild variant="ghost"><Link to="/">🏠 בַּיִת</Link></Button>
    <h1 className="my-6 text-center text-4xl font-bold">{user ? "הַחֶשְׁבּוֹן שֶׁלִּי" : "כְּנִיסָה לַחֶשְׁבּוֹן"}</h1>
    {!ready ? <p>טוענים…</p> : <>
    {user && avatar && <img src={avatar} alt="תמונת הילד" className="mx-auto mb-4 size-24 rounded-full object-cover" />}
    <form onSubmit={submit} className="grid gap-4">
      {(user || mode === "signup") && <label className="grid gap-1 text-xl">שֵׁם הַיֶּלֶד *<input required maxLength={80} value={name} onChange={e => setName(e.target.value)} className="rounded-lg border bg-card p-3" /></label>}
      {user ? <label className="grid gap-1 text-xl">תְּמוּנָה (לִבְחִירָה)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => setPhoto(e.target.files?.[0] ?? null)} /></label> : <>
        <label className="grid gap-1 text-xl">מֵייל<input required type="email" dir="ltr" value={email} onChange={e => setEmail(e.target.value)} className="rounded-lg border bg-card p-3" /></label>
        {mode !== "forgot" && <label className="grid gap-1 text-xl">סִיסְמָה<input required type="password" minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} dir="ltr" value={password} onChange={e => setPassword(e.target.value)} className="rounded-lg border bg-card p-3" /></label>}
      </>}
      <Button disabled={busy} className="h-12 text-xl">{user ? "שְׁמִירָה" : mode === "signup" ? "יְצִירַת חֶשְׁבּוֹן" : mode === "forgot" ? "שְׁלִיחַת קִשּׁוּר" : "כְּנִיסָה"}</Button>
    </form>
    {message && <p role="status" className="my-4 text-center text-lg">{message}</p>}
    {user ? <div className="mt-6 flex justify-between"><Button asChild><Link to="/">מַתְחִילִים לְשַׂחֵק</Link></Button><Button variant="outline" onClick={() => void supabase.auth.signOut()}>יְצִיאָה מֵהַחֶשְׁבּוֹן</Button></div> : <>
      <div className="my-4 flex justify-center gap-2"><Button variant="ghost" onClick={() => setMode(mode === "signup" ? "login" : "signup")}>{mode === "signup" ? "כבר יש חשבון" : "חשבון חדש"}</Button><Button variant="ghost" onClick={() => setMode(mode === "forgot" ? "login" : "forgot")}>שכחתי סיסמה</Button></div>
      <Button variant="outline" className="google-auth-button mb-3 h-12 w-full" disabled={busy} onClick={() => void social("google")}><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>המשך עם Google</Button>
      <Button className="lovable-auth-button h-12 w-full" disabled={busy} onClick={() => void social("lovable")}>Continue with Lovable</Button>
    </>}
    </>}
  </main>;
}