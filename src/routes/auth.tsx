import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { childLoginSchema, childSignupSchema } from "@/lib/child-login";
import { enterChildAccount, createChildAccount, setChildCode } from "@/lib/child-login.functions";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAccount } from "@/lib/account";
import { Button } from "@/components/ui/button";
import { forgetChild, rememberedChildren, type RememberedChild } from "@/lib/remembered-children";
import { flushWallet } from "@/lib/wallet";
import { X } from "lucide-react";
import { readingDialect, type ReadingDialect } from "@/lib/reading-dialect";
import "@lovable.dev/cloud-auth-js/styles.css";
export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "החשבון שלי – אָלֶף בֵּית" }, { name: "description", content: "כניסה לחשבון הילד לשמירת נקודות וחדר אישי" }, { property: "og:title", content: "החשבון שלי – אָלֶף בֵּית" }, { property: "og:description", content: "שם, תמונה ונקודות אישיות לכל ילד" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Auth,
});
function Auth() {
  const { user, profile, avatar, refresh, ready } = useAccount();
  const router = useRouter();
  const queryClient = useQueryClient();
  const enter = useServerFn(enterChildAccount);
  const create = useServerFn(createChildAccount);
  const saveCode = useServerFn(setChildCode);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [parentCode,setParentCode]=useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [children, setChildren] = useState<RememberedChild[]>([]);
  const [selected, setSelected] = useState<RememberedChild | null>(null);
  const [dialect, setDialect] = useState<ReadingDialect>("israeli");
  useEffect(() => { setDialect(readingDialect(profile?.reading_dialect)); }, [profile?.reading_dialect]);
  useEffect(() => { setChildren(rememberedChildren()); }, [user?.id]);
  useEffect(() => { setName(profile?.name ?? ""); }, [profile?.name]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const parsed = childLoginSchema.safeParse({ name: !user && selected && mode === "login" ? selected.name : name, pin, email });
      if ((!user || pin) && !parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "בדקו את הפרטים");
      if (user) {
        const childName = name.trim();
        if (!childName) throw new Error("נא להזין את שם הילד");
        let path = profile?.avatar_path ?? null;
        if (photo) {
          if (!photo.type.startsWith("image/") || photo.size > 2 * 1024 * 1024) throw new Error("בחרו תמונה עד 2MB");
          path = `${user.id}/${crypto.randomUUID()}`;
          const { error } = await supabase.storage.from("child-avatars").upload(path, photo, { contentType: photo.type });
          if (error) throw new Error("לא הצלחנו לשמור את התמונה");
        }
        if (pin && parsed.success) await saveCode({ data: parsed.data });
        const { error } = await supabase.from("profiles").update({ name: childName, avatar_path: path, reading_dialect: dialect }).eq("id", user.id);
        if (error) throw new Error("לא הצלחנו לשמור את הפרטים");
        await refresh(); setPin(""); setMessage("הפרטים נשמרו");
      } else if (parsed.success) {
        const session = mode === "signup" ? await create({data:childSignupSchema.parse({...parsed.data,parentCode})}) : await enter({data:parsed.data});
        const { error } = await supabase.auth.setSession(session);
        if (error) {
          if (mode === "signup") setMode("login");
          throw new Error(mode === "signup" ? "החשבון נוצר, אך החיבור נקטע. נסו להיכנס עם אותו שם וקוד" : "החיבור נקטע, נסו שוב");
        }
        setPin("");
        setParentCode("");
        await refresh();
        await router.navigate({ to: "/" });
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "הפעולה לא הצליחה"); }
    finally { setBusy(false); }
  };
  const social = async (provider: "google" | "lovable") => {
    setBusy(true); setMessage("");
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
      if (result.error) setMessage("הכניסה לא הצליחה, נסו שוב");
    } catch { setMessage("הכניסה לא הצליחה, נסו שוב"); }
    finally { setBusy(false); }
  };
  const signOut = async () => {
    setBusy(true);
    await flushWallet();
    await queryClient.cancelQueries(); queryClient.clear();
    await supabase.auth.signOut();
    setName(""); setPin(""); setEmail(""); setMessage("");
    await router.navigate({ to: "/auth", replace: true });
    setBusy(false);
  };
  return <main className="mx-auto max-w-md px-5 py-8">
    <Button asChild variant="ghost"><Link to="/">🏠 בַּיִת</Link></Button>
    <h1 className="my-6 text-center text-4xl font-bold">{user ? "הַחֶשְׁבּוֹן שֶׁלִּי" : mode === "signup" ? "חֶשְׁבּוֹן חָדָשׁ" : "כְּנִיסָה לַחֶשְׁבּוֹן"}</h1>
    {!ready ? <p>טוענים…</p> : <>
      {!user && mode === "login" && children.length > 0 && <section className="mb-5 grid gap-2" aria-label="חשבונות שמורים במכשיר">
        <h2 className="text-xl font-bold">מי משחק היום?</h2>
        {children.map(child => <div key={child.id} className="flex gap-2">
          <Button type="button" disabled={busy} variant={selected?.id === child.id ? "default" : "outline"} className="h-12 min-w-0 flex-1 text-xl" onClick={() => { setSelected(child); setPin(""); setMessage(""); }}>👤 {child.name}</Button>
          <Button type="button" variant="ghost" size="icon" disabled={busy} title="הסרה מהמכשיר בלבד" aria-label={`הסרת ${child.name} מהמכשיר`} onClick={() => { forgetChild(child.id); setChildren(rememberedChildren()); if (selected?.id === child.id) setSelected(null); }}><X /></Button>
        </div>)}
        <Button type="button" variant="ghost" disabled={busy} onClick={() => { setSelected(null); setName(""); setPin(""); }}>כניסה עם שם אחר</Button>
      </section>}
      {user && avatar && <img src={avatar} alt="תמונת הילד" className="mx-auto mb-4 size-24 rounded-full object-cover" />}
      {user && <h2 className="mb-4 text-xl font-bold">הגדרות החשבון</h2>}
      <form onSubmit={submit} className="grid gap-4">
        {!user && mode === "signup" && <label className="grid gap-1 text-xl">קוד הורה לשחזור נקודות (לבחירה)<input type="password" autoComplete="new-password" minLength={8} maxLength={200} value={parentCode} onChange={e=>setParentCode(e.target.value)} className="w-full rounded-lg border border-input bg-card p-3" /></label>}
        {(!selected || user || mode === "signup") && <label className="grid min-w-0 gap-1 text-xl">שֵׁם הַיֶּלֶד<input required maxLength={80} autoComplete="username" value={name} onChange={e => setName(e.target.value)} className="w-full min-w-0 rounded-lg border border-input bg-card p-3 text-card-foreground" /></label>}
        <label className="grid min-w-0 gap-1 text-xl">{user ? "קוד אישי חדש (לבחירה)" : "קוד אישי בן 3 ספרות"}<input required={!user} type="text" inputMode="numeric" pattern="[0-9]{3}" minLength={3} maxLength={3} autoComplete="off" dir="ltr" value={pin} onChange={e => setPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))} className="w-full min-w-0 rounded-lg border border-input bg-card p-3 text-center text-3xl text-card-foreground" /></label>
        {(user || mode === "signup") && <label className="grid min-w-0 gap-1 text-xl">מייל (לבחירה)<input type="email" autoComplete="email" maxLength={254} dir="ltr" value={email} onChange={e => setEmail(e.target.value)} className="w-full min-w-0 rounded-lg border border-input bg-card p-3 text-card-foreground" /></label>}
        {user && <label className="grid min-w-0 gap-1 text-xl">תְּמוּנָה (לִבְחִירָה)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => setPhoto(e.target.files?.[0] ?? null)} /></label>}
        {user && <fieldset><legend className="mb-3 text-xl font-bold">הֲבָרַת הַקְּרִיאָה</legend><div className="grid gap-2"><Button type="button" variant={dialect === "israeli" ? "default" : "outline"} aria-pressed={dialect === "israeli"} onClick={() => setDialect("israeli")} className="h-auto min-h-12 whitespace-normal">עברית ישראלית</Button><Button type="button" variant={dialect === "litvish" ? "default" : "outline"} aria-pressed={dialect === "litvish"} onClick={() => setDialect("litvish")} className="h-auto min-h-12 whitespace-normal">לשון הקודש · אשכנזית ליטאית</Button></div></fieldset>}
        <Button disabled={busy} className="h-12 text-xl">{busy ? "רגע…" : user ? "שְׁמִירָה" : mode === "signup" ? "יְצִירַת חֶשְׁבּוֹן" : "כְּנִיסָה"}</Button>
      </form>
      {message && <p role="status" className="my-4 text-center text-lg">{message}</p>}
      {user ? <div className="mt-6 flex flex-wrap justify-between gap-3"><Button asChild><Link to="/">מַתְחִילִים לְשַׂחֵק</Link></Button><Button disabled={busy} variant="outline" onClick={() => void signOut()}>יְצִיאָה מֵהַחֶשְׁבּוֹן</Button></div> : <>
        <div className="my-4 flex justify-center"><Button disabled={busy} variant="ghost" onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setSelected(null); setPin(""); setMessage(""); }}>{mode === "signup" ? "כבר יש חשבון" : "חשבון חדש"}</Button></div>
        <details className="border-t border-border pt-4">
          <summary className="cursor-pointer text-center text-muted-foreground">אפשרויות כניסה נוספות</summary>
          <div className="mt-3 grid gap-3"><Button variant="outline" disabled={busy} onClick={() => void social("google")}>המשך עם Google</Button><Button variant="outline" disabled={busy} onClick={() => void social("lovable")}>המשך עם Lovable</Button></div>
        </details>
      </>}
    </>}
  </main>;
}
