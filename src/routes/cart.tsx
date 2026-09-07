import { createFileRoute, Link } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { useState } from "react";
import { ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/products";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Gift Cart | GD Gifts" },
      {
        name: "description",
        content:
          "Review your personalised gifts, apply a promo code and check out securely with GD Gifts.",
      },
      { property: "og:title", content: "Your Gift Cart | GD Gifts" },
      { property: "og:description", content: "Review your personalised gifts and check out." },
    ],
  }),
  component: CartPage,
});

const PROMOS: Record<string, number> = { GIFT10: 0.1, FIRSTGIFT: 0.15 };

function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold sm:text-4xl">Your gift cart</h1>
      <ClientOnly fallback={<p className="mt-6 text-sm text-muted-foreground">Loading your cart…</p>}>
        <CartBody />
      </ClientOnly>
    </div>
  );
}

function CartBody() {
  const { items, subtotal, remove, setQty, productFor } = useCart();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; rate: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const discount = applied ? Math.round(subtotal * applied.rate) : 0;
  const shipping = subtotal === 0 || subtotal - discount >= 999 ? 0 : 79;
  const total = subtotal - discount + shipping;

  if (items.length === 0) {
    return (
      <div className="card-surface mt-8 p-10 text-center">
        <ShoppingBag className="mx-auto size-8 text-muted-foreground" aria-hidden />
        <h2 className="mt-4 text-xl font-semibold">Nothing gift-wrapped yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick a mug, sipper or hamper and personalise it with a name or photo.
        </p>
        <Link to="/shop" className="btn-base btn-primary mt-6">
          Browse gifts
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
      <ul className="space-y-4">
        {items.map((item) => {
          const product = productFor(item.slug);
          if (!product) return null;
          return (
            <li key={item.id} className="card-surface flex gap-4 p-4">
              <img
                src={item.photoDataUrl ?? product.image}
                alt={product.name}
                loading="lazy"
                width={1024}
                height={1024}
                className="size-24 shrink-0 rounded-xl object-cover sm:size-28"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold">{product.name}</h2>
                    {item.customText && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Text: “{item.customText}”
                      </p>
                    )}
                    {item.photoName && (
                      <p className="text-sm text-muted-foreground">Photo: {item.photoName}</p>
                    )}
                  </div>
                  <button
                    onClick={() => remove(item.id)}
                    aria-label={`Remove ${product.name}`}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="inline-flex items-center rounded-full border border-border">
                    <button
                      className="px-3 py-1.5"
                      onClick={() => setQty(item.id, item.qty - 1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="min-w-7 text-center text-sm font-semibold">{item.qty}</span>
                    <button
                      className="px-3 py-1.5"
                      onClick={() => setQty(item.id, item.qty + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-semibold">{formatINR(product.price * item.qty)}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="card-surface h-fit p-6">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatINR(subtotal)}</dd>
          </div>
          {applied && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Promo ({applied.code})</dt>
              <dd>−{formatINR(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd>{shipping === 0 ? "Free" : formatINR(shipping)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatINR(total)}</dd>
          </div>
        </dl>

        <div className="mt-6">
          <label htmlFor="promo" className="text-sm font-semibold">
            Promo code
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="promo"
              className="field"
              placeholder="GIFT10"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
            <button
              className="btn-base btn-ghost px-4 py-2 text-sm"
              onClick={() => {
                const rate = PROMOS[code.trim()];
                if (rate) {
                  setApplied({ code: code.trim(), rate });
                  setPromoError(null);
                } else {
                  setApplied(null);
                  setPromoError("That code isn't valid.");
                }
              }}
            >
              Apply
            </button>
          </div>
          {promoError && <p className="mt-2 text-sm text-destructive">{promoError}</p>}
          {applied && <p className="mt-2 text-sm text-primary">Code applied.</p>}
        </div>

        <button className="btn-base btn-primary mt-6 w-full" disabled>
          Secure checkout — coming next
        </button>
        <p className="mt-3 text-xs text-muted-foreground">
          Sign-in, address, payments and order tracking are the next step in the build.
        </p>
      </aside>
    </div>
  );
}
