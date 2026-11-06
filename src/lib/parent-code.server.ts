import { supabaseAdmin } from "@/integrations/supabase/client.server";
export async function parentCodeHash(code: string, salt: string) {
  const encoder=new TextEncoder();
  const key=await crypto.subtle.importKey("raw",encoder.encode(code),"PBKDF2",false,["deriveBits"]);
  const bits=await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt:encoder.encode(salt),iterations:100000},key,256);
  return Array.from(new Uint8Array(bits),b=>b.toString(16).padStart(2,"0")).join("");
}
export async function createParentCode(userId:string,code:string){
  const salt=crypto.randomUUID();const hash=await parentCodeHash(code,salt);
  const {error}=await supabaseAdmin.from("child_parent_credentials").insert({user_id:userId,code_salt:salt,code_hash:hash});
  if(error)throw new Error("לא הצלחנו לשמור את קוד ההורה");
}
export async function verifyAccountParentCode(userId:string,code:string):Promise<boolean|null>{
  const {data,error}=await supabaseAdmin.from("child_parent_credentials").select("code_hash,code_salt,failed_attempts,locked_until").eq("user_id",userId).maybeSingle();
  if(error)throw new Error("בדיקת קוד ההורה אינה זמינה");if(!data)return null;
  if(data.locked_until&&Date.parse(data.locked_until)>Date.now())throw new Error("יותר מדי ניסיונות. נסו שוב בעוד כמה דקות");
  const hash=await parentCodeHash(code,data.code_salt);let difference=0;
  for(let i=0;i<hash.length;i++)difference|=hash.charCodeAt(i)^data.code_hash.charCodeAt(i);
  const ok=difference===0;const attempts=ok?0:data.failed_attempts+1;
  const {error:saveError}=await supabaseAdmin.from("child_parent_credentials").update({failed_attempts:attempts,locked_until:!ok&&attempts>=5?new Date(Date.now()+15*60*1000).toISOString():null}).eq("user_id",userId);
  if(saveError)throw new Error("בדיקת קוד ההורה אינה זמינה");return ok;
}