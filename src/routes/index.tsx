import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "אָלֶף בֵּית – לומדים לקרוא" },
      { name: "description", content: "אפליקציה לילדים ללימוד אותיות וקריאה בעברית" },
      { property: "og:title", content: "אָלֶף בֵּית – לומדים לקרוא" },
      { property: "og:description", content: "לומדים אותיות, מקשיבים, קוראים ומשחקים" },
    ],
  }),
  component: Index,
});

const MODES = [
  { to: "/listen", emoji: "👂", title: "שְׁמַע וּבְחַר", desc: "שומעים אות ובוחרים מבין שתיים", tone: "bg-primary text-primary-foreground" },
  { to: "/read", emoji: "🗣️", title: "קְרָא בְּקוֹל", desc: "הילד קורא והמבוגר מאשר", tone: "bg-secondary text-secondary-foreground" },
  { to: "/game", emoji: "🎈", title: "פּוֹצְצִים בַּלּוֹנִים", desc: "משחק: מצא את האות ששמעת", tone: "bg-accent text-accent-foreground" },
  { to: "/letters", emoji: "📖", title: "כָּל הָאוֹתִיּוֹת", desc: "לוחצים על אות ושומעים", tone: "bg-card text-card-foreground" },
] as const;

function Index() {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-6xl text-primary md:text-7xl">אָלֶף בֵּית</h1>
        <p className="mt-3 text-xl text-muted-foreground">לוֹמְדִים לִקְרֹא – אוֹת אַחַר אוֹת</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {MODES.map((m) => (
            <Link key={m.to} to={m.to} className={`${m.tone} rounded-3xl p-7 text-right shadow-soft transition hover:-translate-y-1 hover:shadow-pop`}>
              <div className="text-5xl">{m.emoji}</div>
              <div className="mt-3 font-display text-3xl">{m.title}</div>
              <div className="mt-1 text-lg opacity-85">{m.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
