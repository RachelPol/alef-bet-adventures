import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { connectWallet } from "./wallet";
import { installCloudBridge } from "./cloud-bridge";
import { rememberChild } from "./remembered-children";
type Profile = { name: string; avatar_path: string | null };
const AccountContext = createContext<{ user: User | null; profile: Profile | null; avatar: string | null; ready: boolean; refresh: () => Promise<void> }>({ user: null, profile: null, avatar: null, ready: false, refresh: async () => {} });
export const useAccount = () => useContext(AccountContext);
export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const revision = useRef(0);
  const refresh = async () => {
    const run = ++revision.current;
    const { data } = await supabase.auth.getUser();
    if (run !== revision.current) return;
    const current = data.user;
    setReady(false); setUser(current); setProfile(null); setAvatar(null);
    await connectWallet(current?.id ?? null);
    if (run !== revision.current) return;
    if (current) {
      const { data: p } = await supabase.from("profiles").select("name,avatar_path").eq("id", current.id).single();
      if (run !== revision.current) return;
      setProfile(p);
      if (p?.name?.trim()) rememberChild({ id: current.id, name: p.name });
      if (p?.avatar_path) {
        const { data: image } = await supabase.storage.from("child-avatars").createSignedUrl(p.avatar_path, 3600);
        if (run !== revision.current) return;
        setAvatar(image?.signedUrl ?? null);
      }
    }
    setReady(true);
  };
  useEffect(() => {
    const removeBridge = installCloudBridge();
    void refresh();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) setTimeout(() => void refresh(), 0);
    });
    return () => { subscription.unsubscribe(); removeBridge?.(); };
  }, []);
  return <AccountContext.Provider value={{ user, profile, avatar, ready, refresh }}>{children}</AccountContext.Provider>;
}