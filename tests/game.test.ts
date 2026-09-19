import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { items, probability } from "../src/catalog";
import { addItem, drawItem, parseCollection, stats } from "../src/game";

describe("catalog and weighted draws", () => {
  it("ships every referenced artwork file", () => {
    for (const item of items)
      expect(existsSync(resolve("public", item.art.url.slice(1)))).toBe(true);
  });
  it("has fifteen unique items, one rare at 4%, and 100% combined probability", () => {
    expect(items).toHaveLength(15);
    expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
    expect(items.filter((item) => item.rarity === "rare")).toHaveLength(1);
    expect(items.every((item) => item.weight > 0)).toBe(true);
    expect(items.reduce((sum, item) => sum + probability(item), 0)).toBeCloseTo(
      100,
    );
    expect(probability(items.find((item) => item.id === "star")!)).toBe(4);
  });
  it.each(items)(
    "can draw $id at both ends of its probability range",
    (item) => {
      const total = items.reduce((sum, entry) => sum + entry.weight, 0);
      const start = items
        .slice(0, items.indexOf(item))
        .reduce((sum, entry) => sum + entry.weight, 0);
      expect(drawItem(() => start / total + 1e-9).id).toBe(item.id);
      expect(drawItem(() => (start + item.weight) / total - 1e-9).id).toBe(
        item.id,
      );
    },
  );
  it("covers the complete random range without unreachable items", () => {
    const total = items.reduce((sum, item) => sum + item.weight, 0);
    const counts: Record<string, number> = {};
    for (let slot = 0; slot < total; slot++) {
      const item = drawItem(() => (slot + 0.5) / total);
      counts[item.id] = (counts[item.id] ?? 0) + 1;
    }
    for (const item of items) expect(counts[item.id]).toBe(item.weight);
    expect(drawItem(() => 0).id).toBe(items[0].id);
    expect(drawItem(() => 1 - Number.EPSILON).id).toBe(items.at(-1)!.id);
  });
  it.each([-1, 1, NaN, Infinity])("rejects invalid randomness %s", (value) => {
    expect(() => drawItem(() => value)).toThrow();
  });
});
describe("collection persistence", () => {
  it("starts empty when there is no save", () =>
    expect(parseCollection(null)).toEqual({}));
  it("counts duplicates without mutating previous state", () => {
    const first = addItem({}, items[0]);
    const second = addItem(first, items[0]);
    expect(first).toEqual({ sprout: 1 });
    expect(second).toEqual({ sprout: 2 });
    expect(stats(second)).toEqual({ total: 2, unique: 1 });
  });
  it("round-trips all items and duplicate counts", () => {
    let collection = {};
    for (const item of [...items, items[0]])
      collection = addItem(collection, item);
    const loaded = parseCollection(JSON.stringify(collection));
    expect(loaded).toEqual(collection);
    expect(stats(loaded)).toEqual({
      total: items.length + 1,
      unique: items.length,
    });
  });
  it("preserves all five original item IDs and counts when upgrading", () => {
    const oldSave = { sprout: 8, bird: 3, cat: 6, planet: 2, star: 1 };
    const loaded = parseCollection(JSON.stringify(oldSave));
    expect(loaded).toEqual(oldSave);
    expect(stats(loaded)).toEqual({ total: 20, unique: 5 });
    expect(
      addItem(
        loaded,
        items.find((item) => item.id === "bunny")!,
      ),
    ).toEqual({ ...oldSave, bunny: 1 });
  });
  it("accepts missing catalog IDs and ignores unknown IDs", () => {
    expect(parseCollection('{"sprout":2,"retired":99,"bird":0}')).toEqual({
      sprout: 2,
    });
  });
  it.each([
    "invalid",
    "null",
    "[]",
    "true",
    '{"bird":-1}',
    '{"bird":1.5}',
    '{"bird":"2"}',
    '{"bird":9007199254740992}',
  ])("rejects invalid save %s", (value) => {
    expect(() => parseCollection(value)).toThrow();
  });
});
