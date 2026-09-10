import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Sparkles, Truck, Wand2 } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { ProductCard } from "@/components/ProductCard";
import { productsQuery } from "@/lib/product-queries";
import { categories } from "@/lib/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GD Gifts — Personalised Mugs, Sippers & Gift Hampers in India" },
      {
        name: "description",
        content:
          "Personalised gifts from GD Gifts: photo mugs, engraved sipper bottles, anniversary and birthday hampers, and corporate branding kits. Dispatch in 48 hours.",
      },
      { property: "og:title", content: "GD Gifts — Personalised Gifts Made With Your Photos" },
      {
        property: "og:description",
        content:
          "Design your gift live: add names, messages and photos to mugs, bottles and hampers. Shipped across India.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  component: Home,
  errorComponent: () => (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold">We couldn't load the shop</h1>
      <p className="mt-2 text-sm text-muted-foreground">Please refresh and try again.</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold">Nothing here</h1>
    </div>
  ),
});

const features = [
  { icon: Wand2, title: "Live design preview", body: "Type a name, drop a photo, and see the gift before you buy." },
  { icon: BadgeCheck, title: "Print-quality promise", body: "We share a proof before printing. Reprint free if we get it wrong." },
  { icon: Truck, title: "48-hour dispatch", body: "Personalised orders leave our studio within two working days." },
];

function Home() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const bestsellers = products.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-glow" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-2 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
              <Sparkles className="size-3.5 text-accent" aria-hidden />
              Personalised in-house · Shipped pan-India
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
              Gifts that carry <span className="text-brand">their name</span> on them.
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
              Photo mugs, engraved sippers, anniversary hampers and corporate kits — designed
              live with your photos and words, printed by GD Gifts.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-base btn-primary">
                Start designing <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link to="/shop" search={{ category: "corporate" }} className="btn-base btn-ghost">
                Corporate gifting
              </Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Gifts shipped</dt>
                <dd className="font-display text-xl font-semibold">12,000+</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Avg. rating</dt>
                <dd className="font-display text-xl font-semibold">4.8/5</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Dispatch</dt>
                <dd className="font-display text-xl font-semibold">48 hrs</dd>
              </div>
            </dl>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="overflow-hidden rounded-3xl shadow-gift"
          >
            <img
              src={hero}
              alt="Personalised photo mug, engraved sipper bottle and ribboned gift box by GD Gifts"
              width={1600}
              height={1104}
              className="h-full w-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/shop"
              search={{ category: c.id }}
              className="card-surface group p-5 transition-shadow hover:shadow-lift"
            >
              <h2 className="font-display text-lg font-semibold">{c.label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{c.blurb}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Explore <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">Bestselling personalised gifts</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Chosen most often for birthdays, anniversaries and rakhi gifting.
            </p>
          </div>
          <Link to="/shop" className="btn-base btn-ghost">
            View all gifts
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bestsellers.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* Why us */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card-surface p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand text-primary-foreground">
                <f.icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-brand p-8 text-primary-foreground sm:p-12">
          <h2 className="max-w-xl text-3xl font-semibold sm:text-4xl">
            Gifting for a team, a wedding or a whole office?
          </h2>
          <p className="mt-3 max-w-xl text-sm opacity-90 sm:text-base">
            Bulk pricing from 25 units, logo printing in gold or single colour, GST invoicing and
            one consolidated delivery.
          </p>
          <Link
            to="/shop"
            search={{ category: "corporate" }}
            className="btn-base btn-accent mt-7"
          >
            See corporate kits <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
