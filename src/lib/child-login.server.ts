import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { childNameKey, type ChildLoginInput, type ChildSignupInput } from "./child-login";
import { createParentCode } from "./parent-code.server";

async function credential(userId: string, pin: string, secret: string | undefined) {
  if (!secret) throw new Error("הכניסה אינה זמינה כרגע, נסו שוב מאוחר יותר");
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(JSON.stringify([userId, pin])));
  return Array.from(new Uint8Array(signature), b => b.toString(16).padStart(2, "0")).join("");
}

export async function authenticateChild(data: ChildSignupInput, signup: boolean, secret: string | undefined, url: string | undefined, key: string | undefined) {
  if (!url || !key || !secret) throw new Error("הכניסה אינה זמינה כרגע, נסו שוב מאוחר יותר");
  const nameKey = childNameKey(data.name);
  if (!nameKey) throw new Error("נא להזין את שם הילד");
  const { data: mapping, error: lookupError } = await supabaseAdmin.from("child_logins").select("user_id").eq("name_key", nameKey).maybeSingle();
  if (lookupError) throw new Error("לא הצלחנו להיכנס, נסו שוב");
  let userId = mapping?.user_id;
  if (signup) {
    if (userId) throw new Error("השם כבר בשימוש. בחרו שם עם שם משפחה או כינוי אישי");
    userId = crypto.randomUUID();
    const password = await credential(userId, data.pin, secret);
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({ email: `${userId}@children.invalid`, password, email_confirm: true, user_metadata: { name: data.name } });
    if (error || !created.user) throw new Error("לא הצלחנו ליצור חשבון, נסו שוב");
    // The Auth-generated id, not the provisional id, is the credential identity.
    const actualId = created.user.id;
    const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(actualId, { password: await credential(actualId, data.pin, secret) });
    const { error: insertError } = passwordError ? { error: passwordError } : await supabaseAdmin.from("child_logins").insert({ name_key: nameKey, user_id: actualId, contact_email: data.email || null });
    if (insertError) {
      await supabaseAdmin.auth.admin.deleteUser(actualId);
      throw new Error("לא הצלחנו ליצור חשבון. ייתכן שהשם כבר בשימוש");
    }
    userId = actualId;
    if(data.parentCode){
      try { await createParentCode(actualId,data.parentCode); }
      catch { await supabaseAdmin.auth.admin.deleteUser(actualId); throw new Error("לא הצלחנו לשמור את קוד ההורה. נסו ליצור חשבון שוב"); }
    }
  }
  if (!userId) throw new Error("השם או הקוד אינם נכונים");
  const { data: account, error: accountError } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (accountError || !account.user?.email) throw new Error("השם או הקוד אינם נכונים");
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
  const { data: result, error } = await client.auth.signInWithPassword({ email: account.user.email, password: await credential(userId, data.pin, secret) });
  if (error || !result.session) throw new Error(error?.status === 429 ? "יותר מדי ניסיונות. המתינו מעט ונסו שוב" : "השם או הקוד אינם נכונים");
  return { access_token: result.session.access_token, refresh_token: result.session.refresh_token };
}

export async function saveChildCode(userId: string, data: ChildLoginInput, secret: string | undefined) {
  const nameKey = childNameKey(data.name);
  if (!nameKey) throw new Error("נא להזין את שם הילד");
  const { data: occupied, error: lookupError } = await supabaseAdmin.from("child_logins").select("user_id").eq("name_key", nameKey).maybeSingle();
  if (lookupError) throw new Error("לא הצלחנו לשמור את הקוד");
  if (occupied && occupied.user_id !== userId) throw new Error("השם כבר בשימוש. הוסיפו שם משפחה או כינוי אישי");
  const { error: mappingError } = await supabaseAdmin.from("child_logins").upsert({ user_id: userId, name_key: nameKey, contact_email: data.email || null }, { onConflict: "user_id" });
  if (mappingError) throw new Error("לא הצלחנו לשמור את הקוד");
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: await credential(userId, data.pin, secret) });
  if (error) throw new Error("לא הצלחנו לשמור את הקוד, נסו שוב");
  return { ok: true };
}