# Atabeh Payment Integration Guide

The safe goal is **not** to build our own card vault. The goal is to connect a regulated payment gateway.

## 1. What the customer sees

At checkout the customer enters delivery/contact information and clicks **Pay securely**. The Atabeh backend creates a payment session and either redirects the customer to the provider's hosted checkout page or renders the provider's tokenized payment component.

Card number, expiry, and CVV must be handled by the provider, not stored in PostgreSQL and not posted to Atabeh's own API.

## 2. Server-side flow

- Re-load every requested variant from PostgreSQL.
- Verify product/variant is active and stock is available.
- Calculate subtotal/shipping/total on the server.
- Create an Atabeh order as `PENDING`.
- Call the payment provider from the server using `PAYMENT_SECRET_KEY`.
- Store the provider payment/session reference in `paymentRef`.
- Return only the provider redirect URL/client token that is safe for the browser.

## 3. Webhook is the authority

Create a route such as `/api/payments/webhook`.

The route must:
- read the provider's signed webhook;
- verify the signature with `PAYMENT_WEBHOOK_SECRET`;
- look up the local order by a provider reference/metadata;
- verify amount and currency match the local order;
- be idempotent (processing the same webhook twice must not double-process an order);
- mark the order `PAID` only after a verified successful payment event;
- log a safe audit record (never card data or secrets).

The customer-facing return URL is UX only. It must never be trusted as proof of payment.

## 4. Secrets

Keep these server-side only:

```env
PAYMENT_PROVIDER=""
PAYMENT_SECRET_KEY=""
PAYMENT_WEBHOOK_SECRET=""
```

Never create variables such as:

```env
NEXT_PUBLIC_PAYMENT_SECRET_KEY=
```

Anything prefixed `NEXT_PUBLIC_` is intended to be visible to browser code.

## 5. Production requirements

Before enabling real payments:
- create and verify a merchant account with the chosen gateway;
- use HTTPS only;
- use the provider's test/sandbox mode first;
- test successful, declined, cancelled, duplicate and delayed webhook cases;
- implement refunds through the provider's API/admin workflow;
- reconcile gateway settlements against Atabeh orders;
- restrict admin access and protect payment/refund actions with role checks and MFA;
- enable database backups and monitoring.

## 6. Provider adapter

When a gateway is chosen, implement a small server-side adapter, for example:

```js
export async function createPayment({ orderNumber, amount, currency, returnUrl }) {
  // provider-specific server SDK call
  return { paymentRef: 'provider_ref', redirectUrl: 'https://provider.example/...' };
}

export function verifyWebhook(rawBody, signature) {
  // provider-specific signature verification
}
```

This keeps checkout/order logic independent from a particular gateway and makes it easier to change providers later.
