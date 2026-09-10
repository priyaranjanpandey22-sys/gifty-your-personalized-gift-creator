import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import {
  ImagePlus,
  Loader2,
  LogOut,
  Package,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { adminProductsQuery } from "@/lib/product-queries";
import {
  claimFirstAdmin,
  deleteProduct,
  getIsAdmin,
  saveProduct,
  type ProductInput,
} from "@/lib/products.functions";
import { categories, formatINR, productImageUrl, type Product } from "@/lib/products";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Catalogue Admin | GD Gifts" },
      {
        name: "description",
        content: "Private GD Gifts admin area for managing the personalised gift catalogue.",
      },
      { property: "og:title", content: "Catalogue Admin | GD Gifts" },
      { property: "og:description", content: "Manage the GD Gifts product catalogue." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type FormState = ProductInput & { highlightsText: string };

const emptyForm = (): FormState => ({
  slug: "",
  name: "",
  category: "mugs",
  tagline: "",
  description: "",
  highlights: [],
  highlightsText: "",
  price: 0,
  compareAt: null,
  images: [],
  stock: 0,
  active: true,
  customPrinting: true,
  printingType: "both",
  textLabel: null,
  textPlaceholder: null,
});

const toForm = (p: Product): FormState => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  category: p.category,
  tagline: p.tagline,
  description: p.description,
  highlights: p.highlights,
  highlightsText: p.highlights.join("\n"),
  price: p.price,
  compareAt: p.compareAt,
  images: p.images,
  stock: p.stock,
  active: p.active,
  customPrinting: p.customPrinting,
  printingType: p.printingType,
  textLabel: p.textLabel,
  textPlaceholder: p.textPlaceholder,
});

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAdminFn = useServerFn(getIsAdmin);
  const claimFn = useServerFn(claimFirstAdmin);

  const adminCheck = useQuery({ queryKey: ["is-admin"], queryFn: () => isAdminFn({}) });
  const [claimError, setClaimError] = useState<string | null>(null);

  const claim = useMutation({
    mutationFn: () => claimFn({}),
    onSuccess: (result) => {
      if (result.ok) {
        void queryClient.invalidateQueries({ queryKey: ["is-admin"] });
      } else {
        setClaimError(result.reason ?? "Admin access is already assigned.");
      }
    },
    onError: () => setClaimError("We couldn't grant admin access."),
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (adminCheck.isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  if (!adminCheck.data) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 sm:px-6">
        <div className="card-surface p-8 text-center">
          <ShieldCheck className="mx-auto size-8 text-primary" aria-hidden />
          <h1 className="mt-4 text-2xl font-semibold">Admin access needed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This area is limited to store administrators. If you are setting the store up for the
            first time, you can claim admin access now — this works only while no administrator
            exists.
          </p>
          <button
            className="btn-base btn-primary mt-6"
            onClick={() => claim.mutate()}
            disabled={claim.isPending}
          >
            {claim.isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Claim admin access
          </button>
          {claimError && <p className="mt-4 text-sm text-destructive">{claimError}</p>}
          <button className="mt-6 block w-full text-sm text-muted-foreground underline" onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard onSignOut={signOut} />;
}

function AdminDashboard({ onSignOut }: { onSignOut: () => void }) {
  const queryClient = useQueryClient();
  const products = useQuery(adminProductsQuery);
  const saveFn = useServerFn(saveProduct);
  const deleteFn = useServerFn(deleteProduct);

  const [form, setForm] = useState<FormState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    void queryClient.invalidateQueries({ queryKey: ["products"] });
    void queryClient.invalidateQueries({ queryKey: ["product"] });
  }

  const save = useMutation({
    mutationFn: (input: ProductInput) => saveFn({ data: input }),
    onSuccess: () => {
      setForm(null);
      setFormError(null);
      refresh();
    },
    onError: (err: unknown) =>
      setFormError(err instanceof Error ? err.message : "We couldn't save this product."),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: refresh,
  });

  async function uploadImage(file: File | undefined) {
    if (!file || !form) return;
    setFormError(null);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFormError("Images must be JPG, PNG or WebP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFormError("Images must be 10MB or smaller.");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `catalog/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { contentType: file.type, upsert: false });
    setUploading(false);
    if (error) {
      setFormError("Upload failed. Please try again.");
      return;
    }
    setForm((prev) => (prev ? { ...prev, images: [...prev.images, path] } : prev));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    const { highlightsText, ...rest } = form;
    save.mutate({
      ...rest,
      highlights: highlightsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">Catalogue admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Products you add here appear on the shop instantly.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-base btn-primary"
            onClick={() => {
              setForm(emptyForm());
              setFormError(null);
            }}
          >
            <Plus className="size-4" aria-hidden /> New product
          </button>
          <button className="btn-base btn-ghost" onClick={onSignOut}>
            <LogOut className="size-4" aria-hidden /> Sign out
          </button>
        </div>
      </div>

      {products.isLoading && (
        <p className="mt-10 text-sm text-muted-foreground">Loading products…</p>
      )}
      {products.isError && (
        <p className="mt-10 text-sm text-destructive">We couldn't load the catalogue.</p>
      )}

      {products.data && (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Stock</th>
                <th className="px-4 py-2">Printing</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.data.map((p) => (
                <tr key={p.id} className="bg-card shadow-sm">
                  <td className="rounded-l-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt=""
                          className="size-10 rounded-lg object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                          <Package className="size-4 text-muted-foreground" aria-hidden />
                        </span>
                      )}
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-xs text-muted-foreground">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3">{formatINR(p.price)}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    {p.customPrinting ? p.printingType : "None"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        p.active ? "bg-accent text-accent-foreground" : "bg-secondary"
                      }`}
                    >
                      {p.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="rounded-r-xl px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        className="btn-base btn-ghost px-3 py-1.5 text-xs"
                        onClick={() => {
                          setForm(toForm(p));
                          setFormError(null);
                        }}
                      >
                        <Pencil className="size-3.5" aria-hidden /> Edit
                      </button>
                      <button
                        className="btn-base btn-ghost px-3 py-1.5 text-xs text-destructive"
                        onClick={() => {
                          if (window.confirm(`Delete “${p.name}”? This cannot be undone.`)) {
                            remove.mutate(p.id);
                          }
                        }}
                      >
                        <Trash2 className="size-3.5" aria-hidden /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.data.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    No products yet. Add your first gift.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm">
          <form
            onSubmit={submit}
            className="mx-auto mt-6 max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-gift"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-semibold">
                {form.id ? "Edit product" : "New product"}
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setForm(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="p-name" className="text-sm font-semibold">
                  Name
                </label>
                <input
                  id="p-name"
                  required
                  className="field mt-2"
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            name,
                            slug:
                              prev.id || prev.slug
                                ? prev.slug
                                : name
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]+/g, "-")
                                    .replace(/^-|-$/g, ""),
                          }
                        : prev,
                    );
                  }}
                />
              </div>
              <div>
                <label htmlFor="p-slug" className="text-sm font-semibold">
                  Web address (slug)
                </label>
                <input
                  id="p-slug"
                  required
                  className="field mt-2"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((prev) => (prev ? { ...prev, slug: e.target.value } : prev))
                  }
                />
              </div>
              <div>
                <label htmlFor="p-category" className="text-sm font-semibold">
                  Category
                </label>
                <select
                  id="p-category"
                  className="field mt-2"
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => (prev ? { ...prev, category: e.target.value } : prev))
                  }
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="p-stock" className="text-sm font-semibold">
                  Stock
                </label>
                <input
                  id="p-stock"
                  type="number"
                  min={0}
                  className="field mt-2"
                  value={form.stock}
                  onChange={(e) =>
                    setForm((prev) =>
                      prev ? { ...prev, stock: Number(e.target.value) || 0 } : prev,
                    )
                  }
                />
              </div>
              <div>
                <label htmlFor="p-price" className="text-sm font-semibold">
                  Price (₹)
                </label>
                <input
                  id="p-price"
                  type="number"
                  min={0}
                  required
                  className="field mt-2"
                  value={form.price}
                  onChange={(e) =>
                    setForm((prev) =>
                      prev ? { ...prev, price: Number(e.target.value) || 0 } : prev,
                    )
                  }
                />
              </div>
              <div>
                <label htmlFor="p-compare" className="text-sm font-semibold">
                  Compare-at price (₹, optional)
                </label>
                <input
                  id="p-compare"
                  type="number"
                  min={0}
                  className="field mt-2"
                  value={form.compareAt ?? ""}
                  onChange={(e) =>
                    setForm((prev) =>
                      prev
                        ? { ...prev, compareAt: e.target.value === "" ? null : Number(e.target.value) }
                        : prev,
                    )
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="p-tagline" className="text-sm font-semibold">
                  Short tagline
                </label>
                <input
                  id="p-tagline"
                  className="field mt-2"
                  value={form.tagline}
                  onChange={(e) =>
                    setForm((prev) => (prev ? { ...prev, tagline: e.target.value } : prev))
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="p-desc" className="text-sm font-semibold">
                  Description
                </label>
                <textarea
                  id="p-desc"
                  rows={4}
                  className="field mt-2"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => (prev ? { ...prev, description: e.target.value } : prev))
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="p-high" className="text-sm font-semibold">
                  Highlights (one per line)
                </label>
                <textarea
                  id="p-high"
                  rows={3}
                  className="field mt-2"
                  value={form.highlightsText}
                  onChange={(e) =>
                    setForm((prev) => (prev ? { ...prev, highlightsText: e.target.value } : prev))
                  }
                />
              </div>
            </div>

            {/* Images */}
            <div className="mt-6">
              <span className="text-sm font-semibold">Images</span>
              <div className="mt-2 flex flex-wrap gap-3">
                {form.images.map((path) => (
                  <div key={path} className="relative">
                    <img
                      src={productImageUrl(path)}
                      alt=""
                      className="size-20 rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      aria-label="Remove image"
                      className="absolute -right-2 -top-2 rounded-full bg-card p-1 shadow-sm"
                      onClick={() =>
                        setForm((prev) =>
                          prev ? { ...prev, images: prev.images.filter((i) => i !== path) } : prev,
                        )
                      }
                    >
                      <X className="size-3.5" aria-hidden />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="flex size-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-xs text-muted-foreground"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <ImagePlus className="size-4" aria-hidden />
                  )}
                  Upload
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    void uploadImage(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                JPG, PNG or WebP up to 10MB. The first image is used on the shop.
              </p>
            </div>

            {/* Printing */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={form.customPrinting}
                  onChange={(e) =>
                    setForm((prev) => (prev ? { ...prev, customPrinting: e.target.checked } : prev))
                  }
                />
                Custom printing
              </label>
              <label className="flex items-center gap-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm((prev) => (prev ? { ...prev, active: e.target.checked } : prev))
                  }
                />
                Active (visible on the shop)
              </label>

              {form.customPrinting && (
                <>
                  <div>
                    <label htmlFor="p-printing" className="text-sm font-semibold">
                      Printing type
                    </label>
                    <select
                      id="p-printing"
                      className="field mt-2"
                      value={form.printingType}
                      onChange={(e) =>
                        setForm((prev) =>
                          prev
                            ? { ...prev, printingType: e.target.value as ProductInput["printingType"] }
                            : prev,
                        )
                      }
                    >
                      <option value="photo">Photo only</option>
                      <option value="text">Text only</option>
                      <option value="both">Photo and text</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="p-textlabel" className="text-sm font-semibold">
                      Text field label
                    </label>
                    <input
                      id="p-textlabel"
                      className="field mt-2"
                      placeholder="Name or message on the mug"
                      value={form.textLabel ?? ""}
                      onChange={(e) =>
                        setForm((prev) =>
                          prev ? { ...prev, textLabel: e.target.value || null } : prev,
                        )
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="p-textph" className="text-sm font-semibold">
                      Text field example
                    </label>
                    <input
                      id="p-textph"
                      className="field mt-2"
                      placeholder="e.g. Aarav & Diya"
                      value={form.textPlaceholder ?? ""}
                      onChange={(e) =>
                        setForm((prev) =>
                          prev ? { ...prev, textPlaceholder: e.target.value || null } : prev,
                        )
                      }
                    />
                  </div>
                </>
              )}
            </div>

            {formError && <p className="mt-5 text-sm font-medium text-destructive">{formError}</p>}

            <div className="mt-7 flex flex-wrap gap-3">
              <button className="btn-base btn-primary" disabled={save.isPending}>
                {save.isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
                Save product
              </button>
              <button type="button" className="btn-base btn-ghost" onClick={() => setForm(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
