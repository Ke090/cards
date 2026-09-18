export interface Item {
  id: string;
  name: string;
  englishName: string;
  description: string;
  rarity: "normal" | "rare";
  weight: number;
  art: { url: string; position: string; size: string };
  color: string;
}

// Frame each character independently so adjacent toys do not bleed into its card.
// New standalone artwork can use { url: '/assets/new.png', position: 'center', size: 'contain' }.
function atlasArt(left: number, width: number): Item["art"] {
  return {
    url: "/assets/collection.png",
    position: `${(left / (1536 - width)) * 100}% 44%`,
    size: `${(1536 / width) * 100}% auto`,
  };
}

// Stable IDs are persisted. Add catalog entries to expand the collection.
// Weights are relative; probabilities and all UI totals are derived from this list.
export const items: readonly Item[] = [
  {
    id: "sprout",
    name: "ふたばのポポ",
    englishName: "SPROUT POPO",
    description: "のんびり育つ、小さな相棒。今日もちょっとだけ背伸び。",
    rarity: "normal",
    weight: 24,
    art: atlasArt(20, 280),
    color: "#dcece1",
  },
  {
    id: "bird",
    name: "そらいろピピ",
    englishName: "SKY PIPI",
    description: "青空をひとさじ。飛ぶより、お昼寝が得意なことり。",
    rarity: "normal",
    weight: 24,
    art: atlasArt(302, 306),
    color: "#deebf0",
  },
  {
    id: "cat",
    name: "まどろみモモ",
    englishName: "SLEEPY MOMO",
    description: "夢のつづきを探している、ももいろのねこ。",
    rarity: "normal",
    weight: 24,
    art: atlasArt(610, 332),
    color: "#f4e0d9",
  },
  {
    id: "planet",
    name: "ちいさなコスモ",
    englishName: "LITTLE COSMO",
    description: "手のひらサイズの宇宙。ゆっくり、気ままにまわります。",
    rarity: "normal",
    weight: 24,
    art: atlasArt(944, 292),
    color: "#e8e2f1",
  },
  {
    id: "star",
    name: "ほしの王さま",
    englishName: "KING STELLA",
    description:
      "夜空からやってきた、特別なきらめき。出会えたあなたはラッキー！",
    rarity: "rare",
    weight: 4,
    art: atlasArt(1238, 287),
    color: "#f6e9bf",
  },
];

export function probability(item: Item): number {
  return (
    (item.weight / items.reduce((total, entry) => total + entry.weight, 0)) *
    100
  );
}
