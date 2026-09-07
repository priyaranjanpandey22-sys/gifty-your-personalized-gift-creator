import { Link } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { Gift, ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { categories } from "@/lib/products";

function CartBadge() {
  const { count } = useCart();
  if (count === 0) return null;
  return (
    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-accent-foreground">
      {count}
    </span>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-primary-foreground">
            <Gift className="size-5" aria-hidden />
          </span>
          <span className="font-display text-lg font-semibold leading-none">
            GD Gifts
            <span className="block text-[11px] font-medium tracking-wide text-muted-foreground">
              gdgifts.in
            </span>
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-6 text-sm font-medium md:flex">
          <Link to="/shop" className="text-muted-foreground transition-colors hover:text-foreground">
            All Gifts
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/shop"
              search={{ category: c.id }}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {c.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link to="/cart" className="relative btn-base btn-ghost px-3 py-2" aria-label="Cart">
            <ShoppingBag className="size-5" aria-hidden />
            <span className="hidden sm:inline">Cart</span>
            <ClientOnly fallback={null}>
              <CartBadge />
            </ClientOnly>
          </Link>
          <button
            className="btn-base btn-ghost px-3 py-2 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="grid gap-1 border-t border-border px-4 py-3 text-sm md:hidden">
          <Link to="/shop" className="rounded-lg px-2 py-2 hover:bg-secondary" onClick={() => setOpen(false)}>
            All Gifts
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/shop"
              search={{ category: c.id }}
              className="rounded-lg px-2 py-2 hover:bg-secondary"
              onClick={() => setOpen(false)}
            >
              {c.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
