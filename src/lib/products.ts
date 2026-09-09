import type { Database } from "@/integrations/supabase/types";

export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type PrintingType = Database["public"]["Enums"]["printing_type"];

export type Category = "mugs" | "bottles" | "gift-sets" | "corporate";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAt: number | null;
  /** Resolved URL of the first image, ready for <img src>. */
  image: string;
  /** Raw stored image paths (or absolute URLs). */
  images: string[];
  tagline: string;
  description: string;
  highlights: string[];
  stock: number;
  active: boolean;
  customPrinting: boolean;
  printingType: PrintingType;
  textLabel: string | null;
  textPlaceholder: string | null;
};

export const categories: { id: Category; label: string; blurb: string }[] = [
  { id: "mugs", label: "Customized Mugs", blurb: "Photo mugs, magic mugs and couple sets" },
  { id: "bottles", label: "Sipper Bottles", blurb: "Name-engraved steel sippers" },
  { id: "gift-sets", label: "Gift Sets", blurb: "Anniversary and birthday hampers" },
  { id: "corporate", label: "Corporate Branding", blurb: "Bulk gifting with your logo" },
];

export const categoryIds = categories.map((c) => c.id) as [Category, ...Category[]];

export const categoryLabel = (id: string) =>
  categories.find((c) => c.id === id)?.label ?? id;

/** Images live in a private library, served through our own public image route. */
export function productImageUrl(path: string | undefined | null): string {
  if (!path) return "";
  if (/^(https?:)?\/\//.test(path) || path.startsWith("/")) return path;
  return `/api/public/product-image/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: row.price,
    compareAt: row.compare_at,
    images: row.images ?? [],
    image: productImageUrl(row.images?.[0]),
    tagline: row.tagline,
    description: row.description,
    highlights: row.highlights ?? [],
    stock: row.stock,
    active: row.active,
    customPrinting: row.custom_printing,
    printingType: row.printing_type,
    textLabel: row.text_label,
    textPlaceholder: row.text_placeholder,
  };
}

export const allowsPhoto = (p: Product) =>
  p.customPrinting && (p.printingType === "photo" || p.printingType === "both");

export const allowsText = (p: Product) =>
  p.customPrinting && (p.printingType === "text" || p.printingType === "both");

export const formatINR = (amount: number) =>
  `\u20B9${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
