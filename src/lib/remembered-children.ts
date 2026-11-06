export type RememberedChild = { id: string; name: string };
const KEY = "alef-beit-remembered-children";

export function parseRememberedChildren(raw: string | null): RememberedChild[] {
  try {
    const value: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((child): child is RememberedChild => Boolean(child && typeof child.id === "string" && typeof child.name === "string" && child.name.trim())).map(({ id, name }) => ({ id, name }));
  } catch { return []; }
}

export function rememberedChildren(): RememberedChild[] {
  try { return parseRememberedChildren(localStorage.getItem(KEY)); } catch { return []; }
}

export function rememberChild(child: RememberedChild) {
  try {
    const children = rememberedChildren().filter(c => c.id !== child.id);
    localStorage.setItem(KEY, JSON.stringify([{ id: child.id, name: child.name.trim() }, ...children]));
  } catch { /* Device storage may be disabled; manual entry remains available. */ }
}

export function forgetChild(id: string) {
  try { localStorage.setItem(KEY, JSON.stringify(rememberedChildren().filter(c => c.id !== id))); } catch { /* No stored account to remove. */ }
}