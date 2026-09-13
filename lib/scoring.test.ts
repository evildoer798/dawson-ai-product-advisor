import { describe, expect, it } from "vitest";
import { scoreProduct } from "./scoring";
import type { ProductInput } from "./types";

const base: ProductInput = {
  name: "Aero 15K",
  market: "AE",
  brand: "DAWSEN",
  puffs: 15000,
  eLiquidMl: 18,
  nicotineMgMl: 20,
  flavor: "Mint",
  retailPriceUsd: 17.9,
  targetCostUsd: 6.2,
  visualTraits: ["dual display", "metallic finish"]
};

describe("deterministic scoring", () => {
  it("returns the same scoring output for identical inputs", () => {
    const first = scoreProduct(base);
    const second = scoreProduct(base);
    expect(second.score).toBe(first.score);
    expect(second.verdict).toBe(first.verdict);
    expect(second.dimensions).toEqual(first.dimensions);
  });

  it("applies the Saudi restricted-flavour hard gate", () => {
    const result = scoreProduct({ ...base, market: "SA", flavor: "Coffee Vanilla" });
    expect(result.compliancePass).toBe(false);
    expect(result.verdict).toBe("NO_GO");
    expect(result.score).toBeLessThanOrEqual(39);
    expect(result.hardFails.length).toBeGreaterThan(0);
  });

  it("marks commercial evidence insufficient when target cost is missing", () => {
    const result = scoreProduct({ ...base, targetCostUsd: undefined });
    expect(result.dimensions.find((item) => item.key === "commercial")?.status).toBe("insufficient");
    expect(result.confidence).toBeLessThanOrEqual(69);
  });

  it("caps confidence until historical outcome labels exist", () => {
    const result = scoreProduct({ ...base, batteryMah: 650, charging: "USB-C", moq: 10000, channel: "Specialty retail" });
    expect(result.confidenceBand).toBe("MEDIUM");
    expect(result.confidence).toBeLessThan(70);
  });
});
