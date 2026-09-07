import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Wand2 } from "lucide-react";
import { formatINR, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="card-surface block overflow-hidden transition-shadow hover:shadow-lift"
      >
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={1024}
            height={1024}
            className="size-full object-cover"
          />
          {product.customizable && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-card/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">
              <Wand2 className="size-3.5 text-primary" aria-hidden /> Customisable
            </span>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-display text-lg font-semibold">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.tagline}</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-lg font-semibold">{formatINR(product.price)}</span>
            {product.compareAt && (
              <span className="text-sm text-muted-foreground line-through">
                {formatINR(product.compareAt)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
