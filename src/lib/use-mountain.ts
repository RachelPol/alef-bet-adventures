import { useEffect, useRef, useState } from 'react';
import { useAccount } from './account';
import { supabase } from '@/integrations/supabase/client';
import { advanceMountain, INITIAL_MOUNTAIN, mountainMilestone, type MountainActivity, type MountainEvent, type MountainState } from './mountain';

type Store = { state: MountainState; loaded: boolean; error: boolean; listeners: Set<() => void>; tail: Promise<void>; seen: Set<string> };
const stores = new Map<string, Store>();
function getStore(key: string) {
  let store = stores.get(key);
  if (!store) { store = {state: INITIAL_MOUNTAIN, loaded:false,error:false,listeners:new Set(),tail:Promise.resolve(),seen:new Set()}; stores.set(key,store); }
  return store;
}
function notify(store: Store) { store.listeners.forEach(fn=>fn()); }
async function load(store: Store, userId: string, activity: MountainActivity) {
  await store.tail;
  const {data,error}=await supabase.from('mountain_progress').select('streak,completions,version').eq('user_id',userId).eq('activity',activity).maybeSingle();
  store.error=Boolean(error);
  if (!error) { if (data && data.version>=store.state.version) store.state=data; store.loaded=true; }
  notify(store);
}
// Accepted writes outlive route unmounts. Capture the caller bearer BEFORE queueing,
// so switching accounts can never credit a previously accepted event to another child.
async function enqueue(store: Store, activity: MountainActivity, id: string, kind: MountainEvent) {
  const sessionPromise=supabase.auth.getSession();
  const operation=store.tail.then(async()=> {
    const {data}=await sessionPromise;
    const token=data.session?.access_token;
    if (!token) throw new Error('Sign in required');
    const body=JSON.stringify({p_activity:activity,p_event_id:id,p_kind:kind});
    let result: MountainState | undefined;
    for (let attempt=0; attempt<3; attempt++) {
      try {
        const response=await fetch('/api/cloud/rest/v1/rpc/record_mountain_event', {method:'POST',headers:{'Content-Type':'application/json',apikey:import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'],Authorization:`Bearer ${token}`},body});
        if (!response.ok) throw new Error('Progress save failed');
        const rows: MountainState[]=await response.json(); result=rows[0];
        if (!result) throw new Error('Missing progress');
        break;
      } catch(error) { if(attempt===2) throw error; await new Promise(resolve=>setTimeout(resolve,350*(attempt+1))); }
    }
    if (result) { store.state=result; store.error=false; notify(store); }
  });
  store.tail=operation.catch(()=>{store.error=true; notify(store);});
  return operation;
}
export function useMountain(activity: MountainActivity) {
  const {user,ready}=useAccount();
  const key=user ? `${user.id}:${activity}` : '';
  const store=key ? getStore(key) : null;
  const [,render]=useState(0);
  const [notice,setNotice]=useState<{kind:'station'|'reset';streak:number;serial:number}|null>(null);
  const active=useRef(key); active.current=key;
  useEffect(()=>{
    setNotice(null);
    if (!store || !user || !ready) return;
    const listener=()=>render(v=>v+1);store.listeners.add(listener);
    void load(store,user.id,activity);
    const refresh=()=>{if(document.visibilityState==='visible') void load(store,user.id,activity);};
    document.addEventListener('visibilitychange',refresh);
    return ()=>{store.listeners.delete(listener);document.removeEventListener('visibilitychange',refresh);};
  },[key,ready]);
  useEffect(()=>{if(!notice)return; const timer=setTimeout(()=>setNotice(null),notice.streak===90?8000:notice.kind==='reset'?2500:3500);return()=>clearTimeout(timer);},[notice]);
  const record=(id:string,kind:MountainEvent)=>{
    if(!store || !store.loaded || store.error || store.seen.has(`${id}:${kind}`))return false;
    store.seen.add(`${id}:${kind}`);
    const before=store.state;
    // No provisional summit celebration: show it only after its durable write.
    void enqueue(store,activity,id,kind).then(()=>{
      if(active.current!==key)return;
      if(kind==='mistake' && before.streak<90)setNotice({kind:'reset',streak:0,serial:Date.now()});
      else if(kind==='success' && mountainMilestone(before.streak,store.state.streak))setNotice({kind:'station',streak:store.state.streak,serial:Date.now()});
    }).catch(()=>undefined);
    return true;
  };
  return {state:store?.state ?? INITIAL_MOUNTAIN,loaded:Boolean(store?.loaded),error:Boolean(store?.error),notice,record,
    dismiss:()=>setNotice(null),retry:()=>{if(store&&user)void load(store,user.id,activity);},
    restart:()=>record(crypto.randomUUID(),'restart')};
}