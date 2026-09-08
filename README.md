# Gifty: Your Personalized Gift Creator

Act as a Principal Full-Stack Software Engineer & UI/UX Designer. Build a production-ready, highly secure, fully responsive E-Commerce Web Application for "GD Gifts" (Domain: gdgifts.in).

---

### 1. TECH STACK & ARCHITECTURE

- Frontend: Next.js 14+ (App Router, React, TypeScript), Tailwind CSS, Framer Motion, Lucide Icons.

- Backend / API: Next.js API Routes / Server Actions.

- Database: PostgreSQL (configured via Prisma ORM or Drizzle ORM).

- Authentication: NextAuth.js / Auth.js with Google OAuth 2.0 (Role-based: Admin vs Customer).

- Payments: Razorpay / Cashfree / Stripe integration with signature verification webhooks.

- Email / Notifications: Resend / Nodemailer (Transactional Emails: Order Confirmation, Shipping Status, Invoice PDF) + Real-time Admin Notifications (Pusher or WebSockets).

- Cloud Storage: AWS S3 or Cloudinary (for customer-uploaded custom image assets).

---

### 2. DESIGN & BRANDING GUIDELINES

- Brand Name: GD Gifts (gdgifts.in)

- Color Palette (Warm Gift & Elegance Theme):

  * Primary: Deep Indigo / Violet Gold Gradient (`linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)`)

  * Accent / CTA: Warm Amber Gold (`#F59E0B`)

  * Background: Slate Light (`#F8FAFC`) with Dark Mode support.

- Responsiveness: Fluid UI using Tailwind breakpoint design (Mobile-first: 320px up to 4K displays).

---

### 3. KEY FEATURES & WORKFLOWS

A. Product Catalog & Descriptions:

- Dynamic Product Listing & Detail Pages with SEO metadata.

- Product descriptions must be compelling, concise, and persuasive for gift shoppers.

- Products include: Customized Mugs, Sipper Bottles, Anniversary/Birthday Gift Sets, Corporate Branding Sets.

B. Customization Engine (Crucial):

- For custom products, provide interactive input fields:

  * Text Personalization (e.g., Names like "Bhaiya Bhabhi", Quotes, Custom Messages).

  * File / Image Upload (Drag-and-drop for user photos to be printed on mugs/bottles).

  * Real-time Live Preview / Mockup stage showing customized output.

C. Authentication & User Profile:

- Google OAuth 2.0 login/signup.

- Protected customer dashboard for Order Tracking, Saved Addresses, and Purchase History.

D. Cart & Checkout Flow:

- Persistent Shopping Cart (LocalStorage + DB sync on login).

- Secure Checkout with Address validation, Promo Codes, Order Summary, and Gateway Webhook integration.

E. Admin Dashboard:

- Secure Admin Panel (`/admin`) restricted to admin role.

- Real-time Order Management: View incoming orders, inspect customized uploaded images/text, update order statuses (Processing, Shipped, Delivered).

- Inventory & Product Management (CRUD operations).

F. Security & Performance (Production-Grade):

- Database Security: Prepared statements, strict SQL injection prevention, Row-Level Security (RLS) / Prisma access guards.

- Security Headers: Helmet/Next headers, CSRF Protection, Rate-Limiting (Upstash Redis / Express-rate-limit) on auth & payment endpoints.

- Input Sanitization & File Upload Validation (Strict MIME type checking for JPG/PNG/PDF, size limits max 10MB).

---

### 4. DELIVERABLES

Generate complete, modular, runnable code including:

1. `prisma/schema.prisma` - Complete PostgreSQL schema (Users, Products, Categories, Customizations, Orders, OrderItems, Payments).

2. Environment Variables template (`.env.example`).

3. NextAuth configuration (`/lib/auth.ts`).

4. Customization component (`/components/ProductCustomizer.tsx`).

5. Payment Gateway Webhook handler (`/api/payments/webhook/route.ts`).

6. Email Notification templates (`/lib/email.ts`).

7. Complete layout and page structures with step-by-step instructions to deploy to Vercel/Render with PostgreSQL.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2270acac-3c92-46f4-8d9f-5075c3817be7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
