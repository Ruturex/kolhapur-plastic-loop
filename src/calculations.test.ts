import { describe, expect, it } from "vitest";
import {
  advanceStatus,
  estimateEarnings,
  operatingBalance,
  recoveryRate,
  toKilograms,
  validatePositiveQuantity,
} from "./calculations";

describe("weight and value calculations", () => {
  it("converts weight-based units to kilograms and leaves counts unconverted", () => {
    expect(toKilograms(500, "g")).toBe(0.5);
    expect(toKilograms(2, "kg")).toBe(2);
    expect(toKilograms(0.25, "tonne")).toBe(250);
    expect(toKilograms(4, "bags")).toBeNull();
  });
  it("rejects negative quantities", () => {
    expect(() => toKilograms(-1, "kg")).toThrow();
  });
  it("calculates material recovery from output and received mass", () => {
    expect(recoveryRate(8, 10)).toBe(80);
    expect(recoveryRate(0, 0)).toBeNull();
    expect(() => recoveryRate(11, 10)).toThrow();
  });
  it("calculates illustrative collector earnings", () => {
    expect(estimateEarnings(12, 18)).toBe(216);
  });
  it("rejects negative earnings inputs", () => {
    expect(() => estimateEarnings(-1, 10)).toThrow();
  });
  it("calculates an operating balance from revenue less costs", () => {
    expect(operatingBalance([100, 50], [80, 20])).toBe(50);
    expect(() => operatingBalance([100], [-1])).toThrow();
  });
  it("advances collection requests through defined stages without passing Delivered", () => {
    expect(advanceStatus("Requested")).toBe("Accepted");
    expect(advanceStatus("Weighed")).toBe("Delivered");
    expect(advanceStatus("Delivered")).toBe("Delivered");
  });
  it("validates positive finite collection quantities", () => {
    expect(validatePositiveQuantity(0.1)).toBe(true);
    expect(validatePositiveQuantity(0)).toBe(false);
    expect(validatePositiveQuantity(-2)).toBe(false);
    expect(validatePositiveQuantity(Number.NaN)).toBe(false);
  });
});
