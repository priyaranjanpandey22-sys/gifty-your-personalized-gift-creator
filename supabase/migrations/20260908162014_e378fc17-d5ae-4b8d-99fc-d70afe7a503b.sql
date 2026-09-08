CREATE TYPE public.app_role AS ENUM ('admin', 'customer');
CREATE TYPE public.printing_type AS ENUM ('photo', 'text', 'both');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  highlights text[] NOT NULL DEFAULT '{}',
  price integer NOT NULL CHECK (price >= 0),
  compare_at integer CHECK (compare_at >= 0),
  images text[] NOT NULL DEFAULT '{}',
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  active boolean NOT NULL DEFAULT true,
  custom_printing boolean NOT NULL DEFAULT false,
  printing_type public.printing_type NOT NULL DEFAULT 'both',
  text_label text,
  text_placeholder text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX products_category_idx ON public.products (category);
CREATE INDEX products_active_idx ON public.products (active);

GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT TO anon, authenticated USING (active = true);

CREATE POLICY "Admins can view all products" ON public.products
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.products (slug, name, category, tagline, description, highlights, price, compare_at, images, stock, active, custom_printing, printing_type, text_label, text_placeholder) VALUES
('photo-mug-classic', 'Classic Photo Mug', 'mugs', 'Their favourite photo, every single morning.', 'A 330ml premium ceramic mug printed with your photo and message in rich, fade-resistant colour. Dishwasher and microwave safe, so the memory lasts far longer than the flowers. Wrapped in protective gift packaging and dispatched within 48 hours.', ARRAY['330ml AAA-grade ceramic','Fade & dishwasher safe print','Gift-ready packaging','Dispatch in 48 hours'], 449, 699, ARRAY['https://cdnotkjcazsmuhuvjmho.supabase.co/storage/v1/object/public/product-images/seed/mug.jpg'], 40, true, true, 'both', 'Name or message on the mug', 'e.g. Bhaiya Bhabhi'),
('couple-mug-set', 'Couple Mug Set (Pair)', 'mugs', 'Two mugs, one story — printed side by side.', 'A matched pair of mugs personalised with both names and a line only the two of them will understand. The go-to pick for anniversaries, weddings and "Bhaiya Bhabhi" gifting.', ARRAY['Set of 2 matched mugs','Both names printed','Free gift card','Anniversary favourite'], 849, 1199, ARRAY['https://cdnotkjcazsmuhuvjmho.supabase.co/storage/v1/object/public/product-images/seed/birthday.jpg'], 25, true, true, 'both', 'Two names / message', 'e.g. Aarav & Diya'),
('steel-sipper-bottle', 'Engraved Steel Sipper Bottle', 'bottles', 'A daily-use gift with their name on it.', '750ml double-wall stainless steel sipper with a matte finish and a laser-crisp name print that will not peel. Keeps drinks cold for 12 hours — a gift that gets used, not shelved.', ARRAY['750ml double-wall steel','12-hour cold retention','Leak-proof sipper cap','Peel-proof name print'], 749, 999, ARRAY['https://cdnotkjcazsmuhuvjmho.supabase.co/storage/v1/object/public/product-images/seed/bottle.jpg'], 30, true, true, 'text', 'Name to print on the bottle', 'e.g. Priya'),
('anniversary-gift-hamper', 'Anniversary Gift Hamper', 'gift-sets', 'Everything for the evening, in one box.', 'A curated hamper with a personalised photo frame, a scented candle, handcrafted chocolates and a printed message card, nested in a kraft gift box with a satin amber ribbon. Add your photo and we will do the styling.', ARRAY['Personalised photo frame','Scented candle & chocolates','Handwritten-style message card','Premium kraft gift box'], 1699, 2199, ARRAY['https://cdnotkjcazsmuhuvjmho.supabase.co/storage/v1/object/public/product-images/seed/anniversary.jpg'], 15, true, true, 'both', 'Message for the card', 'e.g. Happy 5th Anniversary!'),
('birthday-surprise-box', 'Birthday Surprise Box', 'gift-sets', 'Confetti, cushion, mug — unboxed in one gasp.', 'A birthday box with a personalised cushion, matching mug and a burst of metallic confetti. Choose the name and photo, and we print, pack and ship it the next working day.', ARRAY['Personalised cushion + mug','Metallic confetti reveal','Next-day dispatch','Ships pan-India'], 1299, NULL, ARRAY['https://cdnotkjcazsmuhuvjmho.supabase.co/storage/v1/object/public/product-images/seed/birthday.jpg'], 18, true, true, 'both', 'Birthday name / message', 'e.g. Happy Birthday Aditi'),
('corporate-welcome-kit', 'Corporate Welcome Kit', 'corporate', 'Onboarding gifts your new hires post about.', 'Notebook, metal pen, ceramic mug and canvas tote — all branded with your logo in gold or single-colour print. Bulk pricing from 25 units with GST invoicing and consolidated delivery.', ARRAY['4-piece branded kit','Logo print in gold or 1-colour','Bulk pricing from 25 units','GST invoice provided'], 1499, NULL, ARRAY['https://cdnotkjcazsmuhuvjmho.supabase.co/storage/v1/object/public/product-images/seed/corporate.jpg'], 50, true, true, 'photo', 'Company name / tagline', 'e.g. Northwind Labs');
