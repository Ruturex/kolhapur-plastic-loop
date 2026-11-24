import type { Status, Unit } from "./models";
export const collectionStages: Status[] = [
  "Requested",
  "Accepted",
  "Collected",
  "Weighed",
  "Delivered",
];
export function advanceStatus(status: Status): Status {
  return collectionStages[
    Math.min(collectionStages.indexOf(status) + 1, collectionStages.length - 1)
  ];
}
export function validatePositiveQuantity(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}
export function toKilograms(quantity: number, unit: Unit): number | null {
  if (!Number.isFinite(quantity) || quantity < 0)
    throw new Error("Quantity must be a non-negative number");
  const factor: Partial<Record<Unit, number>> = {
    g: 0.001,
    kg: 1,
    tonne: 1000,
  };
  return factor[unit] === undefined ? null : quantity * factor[unit]!;
}
export function recoveryRate(
  saleableKg: number,
  receivedKg: number,
): number | null {
  if (
    !Number.isFinite(saleableKg) ||
    !Number.isFinite(receivedKg) ||
    saleableKg < 0 ||
    receivedKg < 0 ||
    saleableKg > receivedKg
  )
    throw new Error(
      "Mass values must be finite, non-negative, and mass-balanced",
    );
  if (receivedKg === 0) return null;
  return (saleableKg / receivedKg) * 100;
}
export function estimateEarnings(
  quantityKg: number,
  ratePerKg: number,
): number {
  if (
    !Number.isFinite(quantityKg) ||
    !Number.isFinite(ratePerKg) ||
    quantityKg < 0 ||
    ratePerKg < 0
  )
    throw new Error("Quantity and rate must be finite and non-negative");
  return quantityKg * ratePerKg;
}
export function operatingBalance(revenue: number[], costs: number[]): number {
  if (
    [...revenue, ...costs].some(
      (amount) => !Number.isFinite(amount) || amount < 0,
    )
  )
    throw new Error("Revenue and cost entries must be finite and non-negative");
  return revenue.reduce((a, b) => a + b, 0) - costs.reduce((a, b) => a + b, 0);
}
