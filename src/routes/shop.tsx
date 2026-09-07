import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { ProductCard } from "@/components/ProductCard";
import { categories, products } from "@/lib/products";

const searchSchema = z.object({
  category: z.enum(["mugs", "bottles", "gift-sets", "corporate"]).optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Shop Personalised Gifts | GD Gifts" },
      {
        name: "description",
        content:
          "Browse GD Gifts: customised photo mugs, engraved sipper bottles, anniversary and birthday hampers, and corporate branding sets with live design preview.",
      },
      { property: "og:title", content: "Shop Personalised Gifts | GD Gifts" },
      {
        property: "og:description",
        content: "Photo mugs, engraved sippers, celebration hampers and corporate kits.",
      },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { category } = Route.useSearch();
  const list = category ? products.filter((p) => p.category === category) : products;
  const active = categories.find((c) => c.id === category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold sm:text-4xl">
        {active ? active.label : "All personalised gifts"}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
        {active
          ? active.blurb
          : "Every product below can be personalised with a name, a message and your own photo — previewed live before you add it to the cart."}
      </p>

      <div className="mt-7 flex flex-wrap gap-2">
        <Link
          to="/shop"
          className={`btn-base px-4 py-2 text-sm ${category ? "btn-ghost" : "btn-primary"}`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            to="/shop"
            search={{ category: c.id }}
            className={`btn-base px-4 py-2 text-sm ${category === c.id ? "btn-primary" : "btn-ghost"}`}
          >
            {c.label}
          </Link>
        ))}
      </div>

      <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
