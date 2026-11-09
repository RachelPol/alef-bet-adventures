import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/lib/account";
import { supabase } from "@/integrations/supabase/client";
import { ALL_PRACTICE, normalizePractice, PRACTICE_LETTERS, PRACTICE_VOWELS, type PracticeSettings } from "@/lib/practice-settings";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [
    { title: "הגדרות תרגול – אָלֶף בֵּית" }, { name: "description", content: "בחירת אותיות וניקודים לתרגול אישי לכל ילד" },
    { property: "og:title", content: "הגדרות תרגול – אָלֶף בֵּית" }, { property: "og:description", content: "אותיות וניקודים מותאמים לחשבון הילד בכל הפעילויות" },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Settings,
});
function Settings() {
  const { user, profile, ready, refresh } = useAccount();
  const [selection, setSelection] = useState<PracticeSettings>(ALL_PRACTICE);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => { setSelection(normalizePractice(profile?.practice_settings)); }, [profile?.practice_settings]);
  const toggle = (key: keyof PracticeSettings, id: string, all: string[]) => {
    setMessage("");
    setSelection(current => {
      const values = current[key] ?? all;
      return { ...current, [key]: values.includes(id) ? values.filter(v => v !== id) : [...values, id] };
    });
  };
  const save = async () => {
    if (!user) return;
    if (selection.letters?.length === 0 || selection.vowels?.length === 0) { setMessage("בחרו לפחות אות אחת ולפחות ניקוד אחד."); return; }
    setBusy(true); setMessage("");
    try {
      const { data, error } = await supabase.from("profiles").update({ practice_settings: { letters: selection.letters, vowels: selection.vowels } }).eq("id", user.id).select("id").single();
      if (error || !data) throw new Error("לא הצלחנו לשמור. נסו שוב.");
      await refresh(); setMessage("הבחירה נשמרה לכל הפעילויות");
    } catch (error) { setMessage(error instanceof Error ? error.message : "לא הצלחנו לשמור. נסו שוב."); }
    finally { setBusy(false); }
  };
  return <main className="mx-auto max-w-3xl px-4 py-8" dir="rtl">
    <nav className="flex flex-wrap justify-between gap-3"><Button asChild variant="outline" className="h-14"><Link to="/">🏠 בית</Link></Button><Button asChild variant="ghost" className="h-14"><Link to="/auth">החשבון שלי</Link></Button></nav>
    <h1 className="my-6 flex items-center justify-center gap-3 text-4xl font-bold"><Settings2 /> הגדרות תרגול</h1>
    {!ready ? <p>טוענים…</p> : !user ? <Button asChild><Link to="/auth">כניסה לחשבון</Link></Button> : <>
      <p className="mb-6 text-center text-xl text-muted-foreground">{profile?.name}</p>
      <fieldset disabled={busy} className="border-b border-border pb-7">
        <legend className="mb-4 text-2xl font-bold">אותיות</legend>
        <div className="mb-4 flex gap-3"><Button variant="outline" onClick={() => setSelection(s => ({ ...s, letters: null }))}>כל האותיות</Button><Button variant="ghost" onClick={() => setSelection(s => ({ ...s, letters: [] }))}>ניקוי בחירה</Button></div>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">{PRACTICE_LETTERS.map(letter => {
          const selected = selection.letters === null || selection.letters.includes(letter);
          return <Button key={letter} aria-label={`אות ${letter}`} aria-pressed={selected} variant={selected ? "default" : "outline"} onClick={() => toggle("letters", letter, PRACTICE_LETTERS)} className="relative h-20 text-4xl">{letter}{selected && <Check aria-hidden="true" className="absolute end-1 top-1 size-4" />}</Button>;
        })}</div>
      </fieldset>
      <fieldset disabled={busy} className="py-7">
        <legend className="pt-7 text-2xl font-bold">ניקודים</legend>
        <div className="mb-4 flex gap-3"><Button variant="outline" onClick={() => setSelection(s => ({ ...s, vowels: null }))}>כל הניקודים</Button><Button variant="ghost" onClick={() => setSelection(s => ({ ...s, vowels: [] }))}>ניקוי בחירה</Button></div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">{PRACTICE_VOWELS.map(vowel => {
          const selected = selection.vowels === null || selection.vowels.includes(vowel.id);
          return <Button key={vowel.id} aria-label={vowel.label} aria-pressed={selected} variant={selected ? "secondary" : "outline"} onClick={() => toggle("vowels", vowel.id, PRACTICE_VOWELS.map(v => v.id))} className="relative h-auto min-h-24 flex-col gap-2 py-3"><span className="text-4xl">{vowel.sample}</span><span className="text-base">{vowel.label}</span>{selected && <Check aria-hidden="true" className="absolute end-1 top-1 size-4" />}</Button>;
        })}</div>
      </fieldset>
      <Button disabled={busy} onClick={() => void save()} className="h-14 w-full text-xl">{busy ? "שומרים…" : "שמירת הבחירה"}</Button>
      {message && <p role="status" className="mt-4 text-center text-lg">{message}</p>}
    </>}
  </main>;
}