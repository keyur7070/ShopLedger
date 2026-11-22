# ShopLedger Agent Guide

## Stack
- Node.js application using Express 4 and body-parser; browser UI is static HTML, CSS, and JavaScript in `public/`.
- Application data is stored in `data/db.json` through `lib/store.js`.

## Module map
- `routes/customers.js` - customer list and Khata settlement endpoints.
- `routes/orders.js` - order list/read, placement, and cancellation endpoints.
- `routes/products.js` - product list and active coupon endpoints.
- `routes/reports.js` - dashboard, GST reconciliation, pricing preview, and data export endpoints.
- `lib/coupons.js` - coupon lookup, validation, normalization, and discount calculation.
- `lib/dates.js` - today's date, date-key normalization, and fiscal-year formatting.
- `lib/inventory.js` - product lookup, sellable stock, stock checks, reserve/release, and summary.
- `lib/invoice.js` - invoice figures and printable invoice HTML.
- `lib/ledger.js` - customer balances, Khata charges/reversals, and settlements.
- `lib/orders.js` - order creation, lookup, cancellation, and filtered listing.
- `lib/pricing.js` - subtotal, coupon discount, and order total calculation.
- `lib/reports.js` - dashboard summary and invoice-to-ledger GST reconciliation.
- `lib/store.js` - reads and writes `data/db.json` and appends audit entries.
- `lib/tax.js` - item GST rate lookup, slab percentage, and CGST/SGST split.

## Commands
- Start the app: `node server.js` (also available as `npm start`).
- Run tests: `node --test`. No test files were found during this inspection; `npm test` is currently a placeholder that exits with an error.

## Rules
1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket
- Invoice total and GST breakdown do not match what the customer was billed.
- Allowed files: `lib/invoice.js`; `lib/tax.js` only if truly needed.
