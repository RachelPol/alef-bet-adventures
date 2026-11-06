import { useEffect, useRef } from "react";
import type { Application, Sprite } from "pixi.js";
import room from "@/assets/room-scene.jpg";
import street from "@/assets/shopping-street.jpg";
import redCar from "@/assets/actors/red-car.png";
import blueCar from "@/assets/actors/blue-car.png";
import family from "@/assets/actors/family.png";
import walkers from "@/assets/actors/walkers.png";
import { ITEM_ART, ITEM_SIZE } from "@/lib/room-art";
import { CATALOG, type Wallet } from "@/lib/wallet";

export default function WorldScene({ kind, wallet, onMove }: { kind: "room" | "street"; wallet: Wallet; onMove?: (uid: string, x: number, y: number) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef(wallet); state.current = wallet;
  const callback = useRef(onMove); callback.current = onMove;
  const scene = useRef<{ app: Application; rebuild: () => Promise<void> } | null>(null);
  useEffect(() => {
    let disposed = false; let app: Application | undefined;
    async function start() {
      const { Application, Assets, Sprite, Container, Text, Graphics } = await import("pixi.js");
      const element = host.current; if (!element || disposed) return;
      app = new Application(); await app.init({ width: 1536, height: 1024, backgroundAlpha: 0, antialias: true, resolution: 1, preference: "webgl" });
      if (disposed) { app.destroy(true, { children: true }); return; }
      element.appendChild(app.canvas); app.canvas.setAttribute("aria-label", kind === "room" ? "החדר האישי" : "רחוב עם מכוניות ואנשים");
      const bg = new Sprite(await Assets.load(kind === "room" ? room : street)); bg.width = 1536; bg.height = 1024; app.stage.addChild(bg);
      const layer = new Container(); layer.sortableChildren = true; app.stage.addChild(layer);
      async function rebuild() {
        if (!app || disposed || kind !== "room") return;
        const current = state.current;
        const textures = await Promise.all(current.owned.map(p => ITEM_ART[p.itemId] ? Assets.load(ITEM_ART[p.itemId]) : Promise.resolve(null)));
        if (disposed) return;
        layer.removeChildren().forEach(c => c.destroy());
        if (current.wall) {
          const tint = new Graphics().poly([65,40,1470,40,1470,550,65,550]).fill({ color: current.wall, alpha: .28 });
          layer.addChild(tint);
        }
        current.owned.forEach((p, index) => {
          const item = CATALOG.find(i => i.id === p.itemId); if (!item) return;
          const texture = textures[index];
          const object = texture ? new Sprite(texture) : new Text({ text: item.emoji, style: { fontSize: 90 } });
          object.anchor.set(.5, .8); if (texture) { const size = ITEM_SIZE[item.id] ?? 100; object.width = size; object.height = size * texture.height / texture.width; }
          object.position.set(p.x / 100 * 1536, p.y / 100 * 1024); object.zIndex = p.y;
          object.eventMode = "static"; object.cursor = "grab"; let dragging = false;
          object.on("pointerdown", () => { dragging = true; object.cursor = "grabbing"; });
          object.on("globalpointermove", e => { if (!dragging) return; object.position.set(Math.max(77, Math.min(1459, e.global.x)), Math.max(51, Math.min(973, e.global.y))); });
          const finish = () => { if (!dragging) return; dragging = false; object.cursor = "grab"; callback.current?.(p.uid, object.x / 1536 * 100, object.y / 1024 * 100); };
          object.on("pointerup", finish); object.on("pointerupoutside", finish); object.on("pointercancel", finish); layer.addChild(object);
        });
        element?.setAttribute("data-scene-ready", "true");
      }
      if (kind === "room") await rebuild();
      else {
        const urls = [redCar, blueCar, family, walkers]; const textures = await Promise.all(urls.map(url => Assets.load(url)));
        if (disposed || !app) return;
        const actors: { sprite: Sprite; speed: number }[] = [];
        textures.forEach((texture, i) => {
          const actor = new Sprite(texture); actor.anchor.set(.5, 1); actor.width = i < 2 ? 240 : 125; actor.height = actor.width * texture.height / texture.width;
          actor.position.set([280,1050,500,1250][i] ?? 0, i < 2 ? (i === 0 ? 880 : 995) : 778); layer.addChild(actor); actors.push({ sprite: actor, speed: [95,-120,22,-18][i] ?? 0 });
        });
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        app.ticker.add(ticker => { if (reduced) return; const dt = Math.min(ticker.deltaMS / 1000, .05); actors.forEach(({ sprite, speed }) => { sprite.x += speed * dt; if (sprite.x > 1680) sprite.x = -140; if (sprite.x < -140) sprite.x = 1680; }); });
        element.setAttribute("data-scene-ready", "true");
      }
      if (app && !disposed) scene.current = { app, rebuild };
    }
    void start().catch(() => host.current?.setAttribute("data-scene-error", "true"));
    return () => { disposed = true; scene.current = null; if (app?.renderer) app.destroy(true, { children: true }); };
  }, [kind]);
  useEffect(() => { void scene.current?.rebuild(); }, [wallet.owned, wallet.wall]);
  return <div ref={host} className="world-canvas" style={{ backgroundImage: `url(${kind === "room" ? room : street})` }} />;
}