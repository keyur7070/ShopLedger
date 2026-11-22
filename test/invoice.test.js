'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function line(name, sku, price, qty, hsn) {
  return { name, sku, price, qty, hsn, gstRate: null };
}

function assertCurrentFigures(order, expectedInvoice, expectedCheckout) {
  const invoiceFigures = invoice.computeInvoiceFigures(order);
  const checkoutFigures = pricing.computeTotals(order.items, order.coupon);

  assert.deepEqual({
    subtotal: invoiceFigures.subtotal,
    discount: invoiceFigures.discount,
    tax: invoiceFigures.tax,
    cgst: invoiceFigures.cgst,
    sgst: invoiceFigures.sgst,
    total: invoiceFigures.total,
    rows: invoiceFigures.rows.map(({ gstPercent, gross, discount, taxable, line, lineTax }) => ({
      gstPercent, gross, discount, taxable, line, lineTax
    }))
  }, expectedInvoice);

  assert.deepEqual({
    subtotal: checkoutFigures.subtotal,
    discount: checkoutFigures.discount,
    tax: checkoutFigures.tax,
    cgst: checkoutFigures.cgst,
    sgst: checkoutFigures.sgst,
    total: checkoutFigures.total
  }, expectedCheckout);

  assert.deepEqual({
    subtotal: invoiceFigures.subtotal,
    discount: invoiceFigures.discount,
    tax: invoiceFigures.tax,
    cgst: invoiceFigures.cgst,
    sgst: invoiceFigures.sgst,
    total: invoiceFigures.total
  }, {
    subtotal: checkoutFigures.subtotal,
    discount: checkoutFigures.discount,
    tax: checkoutFigures.tax,
    cgst: checkoutFigures.cgst,
    sgst: checkoutFigures.sgst,
    total: checkoutFigures.total
  });

  assert.deepEqual(invoiceFigures.rows.map(({ gstPercent, gross, discount, taxable, lineTax }) => ({
    gstPercent, gross, discount, taxable, tax: lineTax
  })), checkoutFigures.lines.map(({ gstPercent, gross, discount, taxable, tax }) => ({
    gstPercent, gross, discount, taxable, tax
  })));
}

test('CURRENT BEHAVIOUR: #1001 invoice uses HSN rates for 5% and 12% items', () => {
  const order = {
    coupon: '',
    items: [
      line('5% item', 'SKU-5', 280, 1, '1006'),
      line('12% item', 'SKU-12', 330, 1, '0405')
    ]
  };

  assertCurrentFigures(order, {
    subtotal: 610,
    discount: 0,
    tax: 53.6,
    cgst: 26.8,
    sgst: 26.8,
    total: 663.6,
    rows: [
      { gstPercent: 5, gross: 280, discount: 0, taxable: 280, line: 280, lineTax: 14 },
      { gstPercent: 12, gross: 330, discount: 0, taxable: 330, line: 330, lineTax: 39.6 }
    ]
  }, {
    subtotal: 610,
    discount: 0,
    tax: 53.6,
    cgst: 26.8,
    sgst: 26.8,
    total: 663.6
  });
});

test('CURRENT BEHAVIOUR: #1002 SAVE10 invoice discounts subtotal and applies GST after discount', () => {
  const order = {
    coupon: 'SAVE10',
    items: [
      line('Rice', 'SKU-RICE', 640, 1, '1006'),
      line('Sunflower oil', 'SKU-OIL', 190, 2, '1512')
    ]
  };

  assertCurrentFigures(order, {
    subtotal: 1020,
    discount: 102,
    tax: 45.9,
    cgst: 22.95,
    sgst: 22.95,
    total: 963.9,
    rows: [
      { gstPercent: 5, gross: 640, discount: 64, taxable: 576, line: 640, lineTax: 28.8 },
      { gstPercent: 5, gross: 380, discount: 38, taxable: 342, line: 380, lineTax: 17.1 }
    ]
  }, {
    subtotal: 1020,
    discount: 102,
    tax: 45.9,
    cgst: 22.95,
    sgst: 22.95,
    total: 963.9
  });
});

test('CURRENT BEHAVIOUR: #1004 SAVE10 invoice applies the ₹150 maximum discount', () => {
  const order = {
    coupon: 'SAVE10',
    items: [line('Groundnut oil', 'SKU-GNOIL', 1120, 2, '1508')]
  };

  assertCurrentFigures(order, {
    subtotal: 2240,
    discount: 150,
    tax: 104.5,
    cgst: 52.25,
    sgst: 52.25,
    total: 2194.5,
    rows: [{ gstPercent: 5, gross: 2240, discount: 150, taxable: 2090, line: 2240, lineTax: 104.5 }]
  }, {
    subtotal: 2240,
    discount: 150,
    tax: 104.5,
    cgst: 52.25,
    sgst: 52.25,
    total: 2194.5
  });
});

test('CURRENT BEHAVIOUR: #1008 all-18% items without a coupon match checkout totals', () => {
  const order = {
    coupon: '',
    items: [
      line('Tea', 'SKU-TEA', 140, 1, '0902'),
      line('Sherbet concentrate', 'SKU-SYRUP', 180, 2, '2106')
    ]
  };

  assertCurrentFigures(order, {
    subtotal: 500,
    discount: 0,
    tax: 90,
    cgst: 45,
    sgst: 45,
    total: 590,
    rows: [
      { gstPercent: 18, gross: 140, discount: 0, taxable: 140, line: 140, lineTax: 25.2 },
      { gstPercent: 18, gross: 360, discount: 0, taxable: 360, line: 360, lineTax: 64.8 }
    ]
  }, {
    subtotal: 500,
    discount: 0,
    tax: 90,
    cgst: 45,
    sgst: 45,
    total: 590
  });
});
