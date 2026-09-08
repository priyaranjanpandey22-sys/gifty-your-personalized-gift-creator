import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ChevronLeft, ShoppingBag } from "lucide-react";
import { ProductCustomizer, type Customization } from "@/components/ProductCustomizer";
import { useCart } from "@/lib/cart";
import { formatINR, getProduct } from "@/lib/products";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    const title = p ? `${p.name} — Personalised | GD Gifts` : "Gift | GD Gifts";
    const description = p ? `${p.tagline} ${p.description}`.slice(0, 155) : "Personalised gifts by GD Gifts.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { add } = useCart();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [custom, setCustom] = useState<Customization>({ customText: "", font: "script" });

  function addToCart() {
    add({
      slug: product.slug,
      qty,
      customText: custom.customText,
      font: custom.font,
      photoName: custom.photoName,
      photoDataUrl: custom.photoDataUrl,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" aria-hidden /> Back to shop
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="card-surface overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              width={1024}
              height={1024}
              className="aspect-square w-full object-cover"
            />
          </div>
          <div className="mt-6 card-surface p-6">
            <h2 className="text-xl font-semibold">Why people gift this</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {product.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">{product.name}</h1>
          <p className="mt-2 text-base text-muted-foreground">{product.tagline}</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-semibold">{formatINR(product.price)}</span>
            {product.compareAt && (
              <span className="text-base text-muted-foreground line-through">
                {formatINR(product.compareAt)}
              </span>
            )}
            <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
              Inclusive of printing
            </span>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold">Personalise it</h2>
            <div className="mt-4">
              <ProductCustomizer product={product} value={custom} onChange={setCustom} />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-border bg-card">
              <button
                className="px-4 py-2 text-lg"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="min-w-8 text-center text-sm font-semibold">{qty}</span>
              <button
                className="px-4 py-2 text-lg"
                onClick={() => setQty((q) => Math.min(50, q + 1))}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button className="btn-base btn-primary" onClick={addToCart}>
              <ShoppingBag className="size-4" aria-hidden />
              {added ? "Added to cart" : `Add to cart · ${formatINR(product.price * qty)}`}
            </button>
            <button
              className="btn-base btn-accent"
              onClick={() => {
                addToCart();
                navigate({ to: "/cart" });
              }}
            >
              Buy now
            </button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Free shipping on orders above ₹999 · Dispatch within 48 hours
          </p>
        </div>
      </div>
    </div>
  );
}
