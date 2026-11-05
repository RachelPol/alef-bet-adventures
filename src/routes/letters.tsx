import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { LETTERS, speak } from "@/lib/letters";

export const Route = createFileRoute("/letters")({
  head: () => ({
    meta: [
      { title: "כל האותיות – אָלֶף בֵּית" },
      { name: "description", content: "כל אותיות האלף בית עם שמע ומילה לדוגמה" },
      { property: "og:title", content: "כל האותיות – אָלֶף בֵּית" },
      { property: "og:description", content: "כל אותיות האלף בית עם שמע ומילה לדוגמה" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Letters,
});

function Letters() {
  return (
    <Shell title="כָּל הָאוֹתִיּוֹת">
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
        {LETTERS.map((l) => (
          <button key={l.char} onClick={() => speak(`${l.name}. ${l.word}`)} className="letter-tile flex flex-col items-center py-4">
            <span className="text-7xl">{l.char}</span>
            <span className="mt-1 text-lg text-muted-foreground">{l.emoji} {l.word}</span>
          </button>
        ))}
      </div>
    </Shell>
  );
}
