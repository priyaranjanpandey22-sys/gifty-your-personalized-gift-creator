import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { mapProduct, type Product, type ProductRow } from "./products";

const PRODUCT_COLUMNS =
  "id, slug, name, category, tagline, description, highlights, price, compare_at, images, stock, active, custom_printing, printing_type, text_label, text_placeholder, created_at, updated_at";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

/** Public catalogue — active products only. */
export const listProducts = createServerFn({ method: "GET" }).handler(
  async (): Promise<Product[]> => {
    const { data, error } = await publicClient()
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("active", true)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data as ProductRow[]).map(mapProduct);
  },
);

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }): Promise<Product | null> => {
    const { data: row, error } = await publicClient()
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("slug", data.slug)
      .eq("active", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ? mapProduct(row as ProductRow) : null;
  });

/* ------------------------------- admin side ------------------------------- */

const productInput = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  name: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(60),
  tagline: z.string().trim().max(200).default(""),
  description: z.string().trim().max(4000).default(""),
  highlights: z.array(z.string().trim().max(160)).max(10).default([]),
  price: z.number().int().min(0).max(10_000_000),
  compareAt: z.number().int().min(0).max(10_000_000).nullable().default(null),
  images: z.array(z.string().trim().min(1).max(500)).max(8).default([]),
  stock: z.number().int().min(0).max(1_000_000),
  active: z.boolean(),
  customPrinting: z.boolean(),
  printingType: z.enum(["photo", "text", "both"]),
  textLabel: z.string().trim().max(120).nullable().default(null),
  textPlaceholder: z.string().trim().max(120).nullable().default(null),
});

export type ProductInput = z.infer<typeof productInput>;

type AuthedContext = { supabase: ReturnType<typeof publicClient>; userId: string };

async function assertAdmin(context: AuthedContext) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden");
}

/** True when the signed-in user is an admin. */
export const getIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<boolean> => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return Boolean(data);
  });

/**
 * First-run bootstrap: the very first signed-in user may claim admin.
 * Once an admin exists this always fails.
 */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ ok: boolean; reason?: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (error) throw new Error(error.message);
    if ((count ?? 0) > 0) return { ok: false, reason: "An admin already exists." };
    const { error: insertError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (insertError) throw new Error(insertError.message);
    return { ok: true };
  });

/** Admin catalogue — every product, including inactive ones. */
export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Product[]> => {
    await assertAdmin(context as AuthedContext);
    const { data, error } = await context.supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as ProductRow[]).map(mapProduct);
  });

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => productInput.parse(input))
  .handler(async ({ data, context }): Promise<Product> => {
    await assertAdmin(context as AuthedContext);
    const payload = {
      slug: data.slug,
      name: data.name,
      category: data.category,
      tagline: data.tagline,
      description: data.description,
      highlights: data.highlights,
      price: data.price,
      compare_at: data.compareAt,
      images: data.images,
      stock: data.stock,
      active: data.active,
      custom_printing: data.customPrinting,
      printing_type: data.printingType,
      text_label: data.textLabel,
      text_placeholder: data.textPlaceholder,
    };

    const query = data.id
      ? context.supabase.from("products").update(payload).eq("id", data.id)
      : context.supabase.from("products").insert(payload);

    const { data: row, error } = await query.select(PRODUCT_COLUMNS).single();
    if (error) {
      throw new Error(
        error.code === "23505"
          ? "Another product already uses that web address (slug)."
          : error.message,
      );
    }
    return mapProduct(row as ProductRow);
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await assertAdmin(context as AuthedContext);
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
