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

const assetBaseUrl = `${import.meta.env.BASE_URL}assets/`;

// Frame each character independently so adjacent toys do not bleed into its card.
// New standalone artwork should use individualArt() to remain Pages-path-safe.
function atlasArt(left: number, width: number): Item["art"] {
  return {
    url: `${assetBaseUrl}collection.png`,
    position: `${(left / (1536 - width)) * 100}% 44%`,
    size: `${(1536 / width) * 100}% auto`,
  };
}

function individualArt(id: string, scale = 145): Item["art"] {
  return {
    url: `${assetBaseUrl}${id}.png`,
    position: "center",
    size: `${scale}% auto`,
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
    // 14 normal items × 24 + 14 = 350; keep this rare item's chance at 4%.
    weight: 14,
    art: atlasArt(1238, 287),
    color: "#f6e9bf",
  },
  {
    id: "bunny",
    name: "つきまちルナ",
    englishName: "MOON LUNA",
    description: "お月さまをぎゅっと抱いて。夜を待つ、しろいうさぎ。",
    rarity: "normal",
    weight: 24,
    art: individualArt("bunny"),
    color: "#f4e8dc",
  },
  {
    id: "fox",
    name: "こもれびコン",
    englishName: "SUNNY KON",
    description: "ふわふわのしっぽに、森のぬくもりをしまっている。",
    rarity: "normal",
    weight: 24,
    art: individualArt("fox"),
    color: "#f3dfc9",
  },
  {
    id: "penguin",
    name: "こおりのペペ",
    englishName: "SNOW PEPE",
    description: "お気に入りのマフラーで、南の国までおさんぽ中。",
    rarity: "normal",
    weight: 24,
    art: individualArt("penguin"),
    color: "#dfeaf0",
  },
  {
    id: "mushroom",
    name: "きのこのニョキ",
    englishName: "MUSH NYOKI",
    description: "雨が降ったら背くらべ。水玉ぼうしの、森の住人。",
    rarity: "normal",
    weight: 24,
    art: individualArt("mushroom"),
    color: "#f0dfd3",
  },
  {
    id: "whale",
    name: "くもくじらフワ",
    englishName: "CLOUD FUWA",
    description: "雲をのせて、空の海へ。今日の行き先は風まかせ。",
    rarity: "normal",
    weight: 24,
    art: individualArt("whale", 125),
    color: "#dcebf0",
  },
  {
    id: "ghost",
    name: "おばけのホワ",
    englishName: "LITTLE HOWA",
    description: "こわがらせるのは苦手。そっと葉っぱをくれる、おばけ。",
    rarity: "normal",
    weight: 24,
    art: individualArt("ghost"),
    color: "#e6eadb",
  },
  {
    id: "shell",
    name: "しおさいの真珠",
    englishName: "PEARL SHELL",
    description: "小さな貝のたからもの。耳をすますと、波の音。",
    rarity: "normal",
    weight: 24,
    art: individualArt("shell"),
    color: "#f3e1e3",
  },
  {
    id: "teapot",
    name: "ひだまりポット",
    englishName: "DAISY POT",
    description: "ひと息つこう。やさしい時間を注ぐ、花もようのポット。",
    rarity: "normal",
    weight: 24,
    art: individualArt("teapot", 120),
    color: "#e2ebda",
  },
  {
    id: "lantern",
    name: "よみちのランタン",
    englishName: "AMBER LANTERN",
    description: "迷った夜の道しるべ。手のひらに灯る、あたたかな光。",
    rarity: "normal",
    weight: 24,
    art: individualArt("lantern"),
    color: "#f0e4c9",
  },
  {
    id: "key",
    name: "ゆめのかぎ",
    englishName: "DREAM KEY",
    description: "どこの扉が開くのかな。次の夢へつながる、すみれ色のかぎ。",
    rarity: "normal",
    weight: 24,
    art: individualArt("key"),
    color: "#e8e0f0",
  },
];

export function probability(item: Item): number {
  return (
    (item.weight / items.reduce((total, entry) => total + entry.weight, 0)) *
    100
  );
}
