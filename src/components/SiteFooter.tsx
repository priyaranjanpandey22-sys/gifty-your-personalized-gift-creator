import { Link } from "@tanstack/react-router";
import { Gift, Mail, Phone } from "lucide-react";
import { categories } from "@/lib/products";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-primary-foreground">
              <Gift className="size-5" aria-hidden />
            </span>
            <span className="font-display text-lg font-semibold">GD Gifts</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Personalised gifts printed in-house and shipped across India. Mugs, sippers,
            celebration hampers and corporate kits — made with your photos, names and words.
          </p>
          <div className="mt-5 flex flex-col gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Mail className="size-4" aria-hidden /> hello@gdgifts.in
            </span>
            <span className="inline-flex items-center gap-2">
              <Phone className="size-4" aria-hidden /> +91 00000 00000
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Shop</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {categories.map((c) => (
              <li key={c.id}>
                <Link to="/shop" search={{ category: c.id }} className="hover:text-foreground">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Help</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Dispatch in 48 hours</li>
            <li>Print-quality guarantee</li>
            <li>Bulk & corporate enquiries</li>
            <li>Pan-India delivery</li>
            <li>
              <Link to="/admin" className="hover:text-foreground">
                Store admin
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} GD Gifts · gdgifts.in
      </div>
    </footer>
  );
}
