import mug from "@/assets/product-mug.jpg";
import bottle from "@/assets/product-bottle.jpg";
import anniversary from "@/assets/product-anniversary.jpg";
import corporate from "@/assets/product-corporate.jpg";
import birthday from "@/assets/product-birthday.jpg";

export type Category = "mugs" | "bottles" | "gift-sets" | "corporate";

export type Product = {
  slug: string;
  name: string;
  category: Category;
  price: number;
  compareAt?: number;
  image: string;
  tagline: string;
  description: string;
  highlights: string[];
  customizable: boolean;
  allowsPhoto: boolean;
  textLabel?: string;
  textPlaceholder?: string;
};

export const categories: { id: Category; label: string; blurb: string }[] = [
  { id: "mugs", label: "Customized Mugs", blurb: "Photo mugs, magic mugs and couple sets" },
  { id: "bottles", label: "Sipper Bottles", blurb: "Name-engraved steel sippers" },
  { id: "gift-sets", label: "Gift Sets", blurb: "Anniversary and birthday hampers" },
  { id: "corporate", label: "Corporate Branding", blurb: "Bulk gifting with your logo" },
];

export const products: Product[] = [
  {
    slug: "photo-mug-classic",
    name: "Classic Photo Mug",
    category: "mugs",
    price: 449,
    compareAt: 699,
    image: mug,
    tagline: "Their favourite photo, every single morning.",
    description:
      "A 330ml premium ceramic mug printed with your photo and message in rich, fade-resistant colour. Dishwasher and microwave safe, so the memory lasts far longer than the flowers. Wrapped in protective gift packaging and dispatched within 48 hours.",
    highlights: ["330ml AAA-grade ceramic", "Fade & dishwasher safe print", "Gift-ready packaging", "Dispatch in 48 hours"],
    customizable: true,
    allowsPhoto: true,
    textLabel: "Name or message on the mug",
    textPlaceholder: "e.g. Bhaiya Bhabhi",
  },
  {
    slug: "couple-mug-set",
    name: "Couple Mug Set (Pair)",
    category: "mugs",
    price: 849,
    compareAt: 1199,
    image: birthday,
    tagline: "Two mugs, one story — printed side by side.",
    description:
      "A matched pair of mugs personalised with both names and a line only the two of them will understand. The go-to pick for anniversaries, weddings and \"Bhaiya Bhabhi\" gifting.",
    highlights: ["Set of 2 matched mugs", "Both names printed", "Free gift card", "Anniversary favourite"],
    customizable: true,
    allowsPhoto: true,
    textLabel: "Two names / message",
    textPlaceholder: "e.g. Aarav & Diya",
  },
  {
    slug: "steel-sipper-bottle",
    name: "Engraved Steel Sipper Bottle",
    category: "bottles",
    price: 749,
    compareAt: 999,
    image: bottle,
    tagline: "A daily-use gift with their name on it.",
    description:
      "750ml double-wall stainless steel sipper with a matte finish and a laser-crisp name print that will not peel. Keeps drinks cold for 12 hours — a gift that gets used, not shelved.",
    highlights: ["750ml double-wall steel", "12-hour cold retention", "Leak-proof sipper cap", "Peel-proof name print"],
    customizable: true,
    allowsPhoto: false,
    textLabel: "Name to print on the bottle",
    textPlaceholder: "e.g. Priya",
  },
  {
    slug: "anniversary-gift-hamper",
    name: "Anniversary Gift Hamper",
    category: "gift-sets",
    price: 1699,
    compareAt: 2199,
    image: anniversary,
    tagline: "Everything for the evening, in one box.",
    description:
      "A curated hamper with a personalised photo frame, a scented candle, handcrafted chocolates and a printed message card, nested in a kraft gift box with a satin amber ribbon. Add your photo and we will do the styling.",
    highlights: ["Personalised photo frame", "Scented candle & chocolates", "Handwritten-style message card", "Premium kraft gift box"],
    customizable: true,
    allowsPhoto: true,
    textLabel: "Message for the card",
    textPlaceholder: "e.g. Happy 5th Anniversary!",
  },
  {
    slug: "birthday-surprise-box",
    name: "Birthday Surprise Box",
    category: "gift-sets",
    price: 1299,
    image: birthday,
    tagline: "Confetti, cushion, mug — unboxed in one gasp.",
    description:
      "A birthday box with a personalised cushion, matching mug and a burst of metallic confetti. Choose the name and photo, and we print, pack and ship it the next working day.",
    highlights: ["Personalised cushion + mug", "Metallic confetti reveal", "Next-day dispatch", "Ships pan-India"],
    customizable: true,
    allowsPhoto: true,
    textLabel: "Birthday name / message",
    textPlaceholder: "e.g. Happy Birthday Aditi",
  },
  {
    slug: "corporate-welcome-kit",
    name: "Corporate Welcome Kit",
    category: "corporate",
    price: 1499,
    image: corporate,
    tagline: "Onboarding gifts your new hires post about.",
    description:
      "Notebook, metal pen, ceramic mug and canvas tote — all branded with your logo in gold or single-colour print. Bulk pricing from 25 units with GST invoicing and consolidated delivery.",
    highlights: ["4-piece branded kit", "Logo print in gold or 1-colour", "Bulk pricing from 25 units", "GST invoice provided"],
    customizable: true,
    allowsPhoto: true,
    textLabel: "Company name / tagline",
    textPlaceholder: "e.g. Northwind Labs",
  },
];

export const formatINR = (paise: number) =>
  `\u20B9${paise.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
