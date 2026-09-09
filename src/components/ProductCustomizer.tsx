import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ImagePlus, Trash2, Type as TypeIcon, UploadCloud } from "lucide-react";
import { allowsPhoto, allowsText, type Product } from "@/lib/products";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png"];
const FONTS = [
  { id: "script", label: "Script", css: "'Fraunces', serif" },
  { id: "modern", label: "Modern", css: "'Manrope', sans-serif" },
  { id: "bold", label: "Bold Caps", css: "'Manrope', sans-serif" },
];

export type Customization = {
  customText: string;
  font: string;
  photoName?: string | undefined;
  photoDataUrl?: string | undefined;
};

export function ProductCustomizer({
  product,
  value,
  onChange,
}: {
  product: Product;
  value: Customization;
  onChange: (next: Customization) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeFont = FONTS.find((f) => f.id === value.font) ?? FONTS[0]!;
  const photoAllowed = allowsPhoto(product);
  const textAllowed = allowsText(product);

  function handleFile(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      setError("Please upload a JPG or PNG photo.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That photo is over 10MB. Try a smaller one.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      onChange({ ...value, photoName: file.name, photoDataUrl: String(reader.result) });
    reader.onerror = () => setError("We couldn't read that file. Please try again.");
    reader.readAsDataURL(file);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Live preview */}
      <div className="card-surface relative overflow-hidden p-5">
        <div className="absolute inset-0 bg-glow" aria-hidden />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Live preview
          </p>
          <div className="mt-4 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-secondary">
            <div className="relative size-full">
              {product.image && (
                <img
                  src={product.image}
                  alt={`${product.name} mockup`}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="size-full object-cover"
                />
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
                {photoAllowed && value.photoDataUrl && (
                  <motion.img
                    key={value.photoDataUrl.slice(-24)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35 }}
                    src={value.photoDataUrl}
                    alt="Your uploaded artwork"
                    className="max-h-[42%] w-auto rounded-lg object-contain shadow-lift"
                  />
                )}
                {textAllowed && value.customText && (
                  <motion.p
                    key={value.customText}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="max-w-[80%] break-words text-2xl leading-tight text-accent-foreground drop-shadow-sm sm:text-3xl"
                    style={{
                      fontFamily: activeFont.css,
                      textTransform: value.font === "bold" ? "uppercase" : "none",
                      fontWeight: value.font === "bold" ? 800 : 600,
                    }}
                  >
                    {value.customText}
                  </motion.p>
                )}
                {!value.customText && !value.photoDataUrl && (
                  <p className="text-sm font-medium text-muted-foreground">
                    {photoAllowed && textAllowed
                      ? "Add a name or photo to see the mockup"
                      : photoAllowed
                        ? "Add a photo to see the mockup"
                        : "Add a name to see the mockup"}
                  </p>
                )}
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Indicative mockup. Our design team shares a final proof on WhatsApp before printing.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-5">
        {textAllowed && (
          <>
            <div>
              <label
                htmlFor="custom-text"
                className="flex items-center gap-2 text-sm font-semibold"
              >
                <TypeIcon className="size-4 text-primary" aria-hidden />
                {product.textLabel ?? "Personalisation text"}
              </label>
              <input
                id="custom-text"
                className="field mt-2"
                maxLength={60}
                placeholder={product.textPlaceholder ?? "Add a name or short message"}
                value={value.customText}
                onChange={(e) => onChange({ ...value, customText: e.target.value })}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {value.customText.length}/60 characters
              </p>
            </div>

            <div>
              <span className="text-sm font-semibold">Print style</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {FONTS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onChange({ ...value, font: f.id })}
                    className={`btn-base px-4 py-2 text-sm ${
                      value.font === f.id ? "btn-primary" : "btn-ghost"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {photoAllowed && (
          <div>
            <span className="flex items-center gap-2 text-sm font-semibold">
              <ImagePlus className="size-4 text-primary" aria-hidden />
              Upload your photo
            </span>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              className={`mt-2 rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
                dragging ? "border-primary bg-secondary" : "border-border"
              }`}
            >
              <UploadCloud className="mx-auto size-7 text-muted-foreground" aria-hidden />
              <p className="mt-2 text-sm font-medium">Drag & drop a photo here</p>
              <p className="text-xs text-muted-foreground">JPG or PNG, up to 10MB</p>
              <button
                type="button"
                className="btn-base btn-ghost mt-3 px-4 py-2 text-sm"
                onClick={() => inputRef.current?.click()}
              >
                Choose file
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
            {value.photoName && (
              <div className="mt-2 flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-sm">
                <span className="truncate">{value.photoName}</span>
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => onChange({ ...value, photoName: undefined, photoDataUrl: undefined })}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            )}
            {error && <p className="mt-2 text-sm font-medium text-destructive">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
