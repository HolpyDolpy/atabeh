# Atabeh Royal Carpet Store

A full-stack Next.js + PostgreSQL storefront inspired by the structure and shopping flow of the referenced carpet site, but branded for **Atabeh Royal Carpet** and using the supplied Atabeh logo and local/generated carpet imagery.

## Included

- Responsive home page with hero, categories, featured products, seasonal promotion, new arrivals, and handmade section.
- Product catalog with category/search/filter support.
- Product detail page with variants, stock, size/color selection and client cart.
- Server-validated checkout. Prices and stock are never trusted from localStorage/browser input.
- Orders with unique order numbers and transactional stock deduction.
- Customer account area.
- Admin login and role-protected admin area.
- Admin dashboard, product creation, product list, and order list.
- PostgreSQL/Prisma data model for users, sessions, categories, products, variants, orders and line items.

## Security design

No application can honestly be guaranteed to have “zero security flaws.” This project uses secure defaults and avoids common high-risk shortcuts:

- Password hashing using bcrypt with cost 12.
- Opaque random session tokens; only token hashes are stored in the database.
- HttpOnly, Secure-in-production, SameSite=Lax session cookie.
- Server-side RBAC on every admin route/action.
- Origin checking on state-changing API routes.
- DB-backed rate limiting for login and checkout.
- Zod validation and strict length/range limits.
- Prisma parameterization rather than raw SQL.
- Serializable checkout transaction with server-authoritative pricing and stock.
- Security headers including CSP, frame denial, no-sniff and permissions policy.
- No card numbers are collected or stored. Integrate a PCI-compliant payment provider instead.
- Secrets belong only in `.env`, never in client code or Git.

Before production, run a dependency audit, configure HTTPS, use a managed PostgreSQL database, put the app behind a reverse proxy/WAF if appropriate, configure backups/logging, add email verification/password reset, integrate a real payment provider with signed webhooks, and commission a security review/penetration test.

## Setup

1. Install Node.js 20+ and PostgreSQL.
2. Copy `.env.example` to `.env` and set a strong `ADMIN_PASSWORD`.
3. Run:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Open `http://localhost:3000`.

## Important production note

The seeded admin password is controlled by `.env`. Never leave the placeholder password in production. The card-payment UI is intentionally not implemented until a payment provider is chosen, because handling raw card data yourself would create unnecessary PCI/security risk.

## Production domain layout
Recommended separation when the real domain is ready:
- `example.com` / `www.example.com` — public store
- `admin.example.com` — admin UI (separate deployment or host routing)
- `api.example.com` — optional API hostname later; the current build intentionally uses same-origin `/api/*` routes to reduce CORS/cookie complexity
- other subdomains remain free for future services

Never put database passwords, payment secrets, admin credentials, session secrets, private API keys, or webhook secrets in `NEXT_PUBLIC_*` variables. Anything prefixed `NEXT_PUBLIC_` is sent to the browser.

## What the API is
The API is the server-side interface used by the storefront/admin UI to perform protected operations such as login, checkout, inventory changes, and product administration. Browser code should send only the minimum request data. The API then authenticates the request, validates it, reads trusted prices/stock from PostgreSQL, performs the database operation, and returns only the response fields the browser needs.

For production, keep PostgreSQL inaccessible from the public internet, use HTTPS, restrict admin access, use MFA at the identity/provider layer if possible, and connect payments through a hosted/tokenized payment provider rather than handling card numbers yourself.


## V3 additions: WhatsApp + product colors

Set your public WhatsApp Business number in `.env` using international digits only:

```env
NEXT_PUBLIC_WHATSAPP_NUMBER="9705XXXXXXXX"
```

The floating WhatsApp button reads the local cart only to prepare a convenient message for the customer. The server never trusts those cart prices for checkout.

Products now support `Variant.color`, `Variant.colorHex`, and `Variant.image`. The product page displays color swatches under the price, and selecting a color changes the main product image. The included color images are intentionally representative placeholders; replace them from the admin/catalog when real product photography is ready.

After upgrading an existing local database to V3, run:

```powershell
npx prisma migrate dev --name add_variant_color_images
npx prisma generate
npm run seed
```

## Payment gateway architecture

Do not collect or store raw card numbers, expiry dates, or CVV in this app. Use a PCI-compliant gateway's hosted checkout or tokenized payment component.

Recommended flow:

1. Customer submits checkout details to the Atabeh server.
2. The server validates stock and reads prices from PostgreSQL.
3. The server creates a `PENDING` order.
4. The server creates a payment session/order with the configured gateway using a server-only secret.
5. Customer is redirected to the gateway's hosted payment page (or uses its tokenized SDK).
6. The gateway calls a signed webhook on the Atabeh backend.
7. The backend verifies the webhook signature and amount/currency/order reference.
8. Only then is the Atabeh order marked `PAID`.
9. Fulfilment begins from the verified paid order.

Never mark an order paid because the browser returned to a "success" URL. The signed server-to-server webhook is the source of truth.

## V4 — inventory-driven storefront

V4 uses the uploaded `carpet_inventory_extracted(1).xlsx` as the catalog basis:

- 53 unique product names are seeded as products.
- 251 source rows supply the recorded sizes and prices.
- Storefront categories are reorganized for easier discovery: Egyptian, Belgian & silk, Turkish, wool, kitchen/runners, round rugs, Royal/classic, modern collections, rolls/carpet, and PVC/flooring.
- Product pages now support **color + نقشة + size** before adding an item to the cart.
- The cart and WhatsApp message preserve the selected color, pattern and size.
- Representative Unsplash category photos are used until exact product photography is uploaded. See `IMAGE_SOURCES.md`.

### Important inventory note

The uploaded spreadsheet contains names, sizes, prices, status and source-image codes, but it does **not** contain unit quantities. V4 therefore seeds a demo quantity of `10` per generated variant so the local checkout can be tested. Replace those quantities with real stock before production.

### Upgrade an existing V3 local database

Stop the dev server first, then run:

```powershell
npx.cmd prisma migrate dev --name add_pattern_and_inventory_catalog
npx.cmd prisma generate
npm.cmd run seed
npm.cmd run dev
```

If this is a disposable local test database and you want a completely clean catalog, you can instead create a fresh database and run the normal initial migration + seed.

## V5 UX/UI refresh

V5 reduces navigation clutter and makes the customer's next action clearer. It adds a stronger search-first header, simplified category discovery, visual category/room browsing, improved product cards, sorting/filter chips on the shop page, and a cleaner product page with gallery thumbnails, color + pattern selection, size selection, a quantity stepper, clearer availability, and stronger purchase feedback.

## V6 admin control center

V6 swaps the desktop header placement so the Atabeh logo sits on the left and customer/account/cart controls sit on the right.

The admin panel now provides business-data management for:
- products/listings: create, edit, hide/show and delete;
- product galleries and merchandising flags;
- variants: SKU, color, color HEX, pattern, image, size, price, stock and active state;
- categories: create, edit, order, show/hide and delete when unused;
- orders: inspect items, edit customer/delivery details, change status/payment reference and delete;
- users: view accounts, change CUSTOMER/ADMIN roles and delete accounts with safeguards against deleting the current/last admin.

Security internals such as sessions and rate-limit records are intentionally not editable from the dashboard. Every mutation endpoint performs server-side admin authorization and same-origin checking. Products/variants referenced by historical orders are protected from deletion; hide/deactivate them instead.

## V7 homepage / navigation update

- Added a local, muted, autoplaying, looping MP4 hero at `public/videos/hero-loop.mp4` with a poster fallback.
- Removed the header quick-access/discovery rail.
- Simplified customer-facing header actions; the **الإدارة** control is rendered only when the authenticated session role is `ADMIN`. Admin routes remain protected server-side by `requireAdmin()`.
- Reduced homepage clutter and shifted visual density into larger category, room, best-seller and size sections.
- Added reduced-motion fallback: browsers/users requesting reduced motion receive the static hero poster instead of autoplay video.


## V8 — WhatsApp order handoff

The storefront now includes a fixed WhatsApp bubble that opens the Atabeh business chat at `+972599085646` (configured as `972599085646` for wa.me). If the cart contains products, the bubble pre-fills product, color, pattern, size, quantity and displayed line totals.

After a checkout is successfully created and verified by the server, the checkout confirmation screen shows **إرسال الطلب إلى واتساب**. The generated message includes the server-created order number, customer delivery details, verified order items and server-calculated total. The customer reviews the message in WhatsApp and presses Send.

The database remains the source of truth for prices and stock; the WhatsApp message is a communication copy, not the authority that creates or prices the order.


## V9 registration

Public customer registration is available at `/register`. New public accounts are always created server-side with `role: CUSTOMER`; the browser cannot choose an admin role. Registration validates name, phone, email, password and confirmation, hashes passwords with bcrypt, rate-limits registration attempts, auto-creates a secure session, and redirects the customer to `/account`.

No Prisma schema migration is required from V8 because the existing `User` model already contains name, phone, email, passwordHash and role.

## V10 clean catalog + camera uploads

V10 no longer seeds demo categories, products, colors, patterns, or sizes. The admin builds the catalog manually.

To clear an existing TEST catalog one time (this also removes test orders, but preserves user/admin accounts):

```bash
npm run catalog:clear
npm run seed
```

Admin category/product/variant forms support image upload and mobile camera capture. Images are resized/compressed in the browser and stored as image data URLs in PostgreSQL for this deployment-friendly version.

## V11 updates

- Carpet prices are now treated as **price per square meter**. A size such as `2.40x3.30` has an area of 7.92 m², so the displayed/checkout price is `7.92 × price-per-m²`.
- Sizes are entered manually by the admin per product/variant. Accepted format examples: `2.40x3.30`, `2.4 × 3.3`.
- The product **slug** is only the URL identifier (for example `super-hilton`). The type/origin such as `Turkish` should be created under **Types / Origin** and then selected from the product dropdown. The category/type itself also has its own slug such as `turkish`.
- Login and registration now show inline Arabic validation/errors and loading states instead of navigating to raw JSON error pages.
- A global skeleton loading UI is included for slower navigation.
- New customer registrations require email verification before login.

### Email verification with Resend

Add these server-side environment variables locally and in Vercel:

```env
RESEND_API_KEY="re_..."
EMAIL_FROM="Atabeh Royal Carpet <verify@yourdomain.com>"
APP_URL="https://your-production-domain.com"
```

For local testing, `APP_URL` can be `http://localhost:3000`. In production, use the actual HTTPS site URL. Verify your sending domain in Resend before using a custom `EMAIL_FROM` address.

After upgrading an existing database to V11, run:

```powershell
npx.cmd prisma generate
npx.cmd prisma db push
npm.cmd run seed
```

`npm.cmd run seed` ensures the admin account is marked as email-verified.

## V13 UX & performance pass
- Streamed homepage catalog sections with Suspense so the hero appears immediately while database-backed sections load.
- Streamed shop results with a filter/results skeleton instead of a blank wait.
- Reworked global route loading to remain visibly present long enough to be perceived and removed the mutation-observer behavior that could hide it too early.
- Added branded navigation loading panel, shimmer skeleton cards, filters, forms, product and admin placeholders.
- Reduced shop catalog database round trips by loading size/pattern options in one variant query.
- Limited a single shop result page to 60 products to prevent an unbounded first render.
- Added customer guidance with a three-step shopping journey and clearer empty states.
- Added content-visibility hints for product/category cards and reduced animation work for users who prefer reduced motion.

## V14 homepage/search UX
- Homepage hero remains a looping video and can now be configured from Admin > الصفحة الرئيسية.
- Admin can change the hero video URL/path, hero poster, and two homepage promotional images/text/links.
- Header search submit is icon-only and a Home button is available in the main navigation.
- Header categories are loaded from admin-created categories instead of a hardcoded list.
- Search uses fuzzy matching across product names, category/type, colors, patterns, sizes and SKU, so close spellings can still produce results.
- V14 adds the SiteSetting Prisma model; run `npx.cmd prisma db push` after upgrading.

## V16: homepage video upload
The admin homepage editor can upload MP4/WebM/MOV videos directly to Vercel Blob. Connect a **Vercel Blob** store to the Vercel project so `BLOB_READ_WRITE_TOKEN` is added automatically. Client uploads are used so large videos do not pass through the Vercel Function body limit.

The **Add Type** form now submits in-place with inline Arabic validation. Invalid input or duplicate slugs no longer reload/reset the entire form.


## V18 final polish
- Admin homepage/product forms show inline Arabic validation instead of raw error responses.
- Homepage hero requires both video and poster image before saving.
- Promo sections cannot be saved empty.
- Customer carpet totals are rounded to the nearest 5 ILS (317→315, 318→320).
- Customer-facing final prices are shown without decimal .00 values.
