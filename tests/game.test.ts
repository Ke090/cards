import { describe, expect, it } from "vitest";
import { items, probability } from "../src/catalog";
import { addItem, drawItem, parseCollection, stats } from "../src/game";

describe("catalog and weighted draws", () => {
  it("has five unique items, one rare, and 100% combined probability", () => {
    expect(items).toHaveLength(5);
    expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
    expect(items.filter((item) => item.rarity === "rare")).toHaveLength(1);
    expect(items.every((item) => item.weight > 0)).toBe(true);
    expect(items.reduce((sum, item) => sum + probability(item), 0)).toBe(100);
  });
  it.each([
    [0, "sprout"],
    [0.239999, "sprout"],
    [0.24, "bird"],
    [0.479999, "bird"],
    [0.48, "cat"],
    [0.719999, "cat"],
    [0.72, "planet"],
    [0.959999, "planet"],
    [0.96, "star"],
    [0.999999, "star"],
  ])("draws the expected item at random boundary %s", (value, id) => {
    expect(drawItem(() => value).id).toBe(id);
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
    expect(stats(loaded)).toEqual({ total: 6, unique: 5 });
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
