import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AuraCalculator } from "../../src/application/services/AuraCalculator.js";

const calc = new AuraCalculator();

describe("AuraCalculator", () => {
  it("+5 aura when 100% progress", () => {
    const r = calc.calculate(100, 1.0);
    assert.equal(r.delta, 5);
    assert.equal(r.reason, "all_completed");
  });

  it("+2 aura when partial progress (> 0% and < 100%)", () => {
    const r = calc.calculate(50, 1.0);
    assert.equal(r.delta, 2);
    assert.equal(r.reason, "partial");
  });

  it("-1 aura when 0% progress", () => {
    const r = calc.calculate(0, 1.0);
    assert.equal(r.delta, -1);
    assert.equal(r.reason, "none");
  });

  it("multiplier amplifies positive delta", () => {
    const r = calc.calculate(100, 2.0);
    assert.equal(r.delta, 10); // 5 * 2
  });

  it("multiplier does not amplify negative delta", () => {
    const r = calc.calculate(0, 2.0);
    assert.equal(r.delta, -1); // penalty unchanged
  });

  it("multiplier rounds to integer", () => {
    const r = calc.calculate(50, 1.5);
    assert.equal(r.delta, 3); // round(2 * 1.5) = 3
  });

  it("100% boundary triggers all_completed, not partial", () => {
    const r = calc.calculate(99.99, 1.0);
    assert.equal(r.reason, "partial");
    const r2 = calc.calculate(100, 1.0);
    assert.equal(r2.reason, "all_completed");
  });
});
