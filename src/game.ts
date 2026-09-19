import { items, type Item } from "./catalog";

export type Collection = Record<string, number>;
export const storageKey = "pocket-gacha.collection.v1";

export function drawItem(random: () => number = Math.random): Item {
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1)
    throw new Error("Random value must be in [0, 1).");
  let cursor = value * items.reduce((sum, item) => sum + item.weight, 0);
  for (const item of items) {
    cursor -= item.weight;
    if (cursor < 0) return item;
  }
  return items[items.length - 1];
}

export function addItem(collection: Collection, item: Item): Collection {
  return {
    ...collection,
    [item.id]: Math.min(
      (collection[item.id] ?? 0) + 1,
      Number.MAX_SAFE_INTEGER,
    ),
  };
}

export function parseCollection(raw: string | null): Collection {
  if (raw === null) return {};
  const data: unknown = JSON.parse(raw);
  if (typeof data !== "object" || data === null || Array.isArray(data))
    throw new Error("Invalid collection");
  const collection: Collection = {};
  for (const item of items) {
    const value: unknown = (data as Record<string, unknown>)[item.id];
    if (value === undefined) continue;
    if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0)
      throw new Error("Invalid item count");
    if (value > 0) collection[item.id] = value;
  }
  return collection;
}

export function stats(collection: Collection) {
  return {
    total: items.reduce((sum, item) => sum + (collection[item.id] ?? 0), 0),
    unique: items.filter((item) => (collection[item.id] ?? 0) > 0).length,
  };
}
