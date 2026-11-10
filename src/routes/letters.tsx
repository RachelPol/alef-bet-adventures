import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { LETTERS, speak } from "@/lib/letters";
import { usePractice } from "@/lib/hooks";
import { matchesPractice } from "@/lib/practice-settings";
import { PracticeEmpty } from "@/components/PracticeEmpty";
import { Button } from "@/components/ui/button";

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
  const practice = usePractice();
  const letters = LETTERS.filter(l => matchesPractice(l.char, practice));
  return (
    <Shell title="כָּל הָאוֹתִיּוֹת">
      {!letters.length && <PracticeEmpty />}
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
        {letters.map((l) => {
          const exampleAllowed = matchesPractice(l.word, practice);
          return <Button variant="ghost" key={l.char} onClick={() => speak(exampleAllowed ? `${l.name}. ${l.word}` : l.name)} className="letter-tile flex h-auto min-w-0 flex-col items-center whitespace-normal py-4">
            <span className="text-7xl">{l.char}</span>
            {exampleAllowed && <span className="mt-1 text-lg text-muted-foreground">{l.emoji} {l.word}</span>}
          </Button>;
        })}
      </div>
    </Shell>
  );
}
