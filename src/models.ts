export type Material =
  "PET" | "HDPE" | "LDPE" | "PP" | "Other rigid" | "Mixed / unidentified";
export type Unit = "g" | "kg" | "tonne" | "bags" | "containers" | "items";
export type Status =
  "Requested" | "Accepted" | "Collected" | "Weighed" | "Delivered";
export interface CollectionRequest {
  id: string;
  category: Material;
  quantity: number;
  unit: Unit;
  area: string;
  date: string;
  status: Status;
  createdAt: string;
}
export interface ResearchMetric {
  label: string;
  value: number;
  unit: string;
  period: string;
  geography: string;
  classification: string;
  source: string;
  url: string;
}
export interface Listing {
  id: string;
  material: Material;
  quantityKg: number;
  quality: string;
  price: number | null;
  buyer: string;
}
