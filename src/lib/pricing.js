// Price calculation helpers
export const VAT_RATE = 0.21;

// Calculate selling price with VAT from purchase price and markup
export const calcPriceWithVat = (purchasePrice, markup) => {
  const sellingWithoutVat = purchasePrice * (1 + (markup / 100));
  return sellingWithoutVat * (1 + VAT_RATE);
};

// Calculate markup from purchase price and selling price with VAT
export const calcMarkupFromPriceWithVat = (purchasePrice, priceWithVat) => {
  if (!purchasePrice || purchasePrice === 0) return 0;
  const sellingWithoutVat = priceWithVat / (1 + VAT_RATE);
  return ((sellingWithoutVat / purchasePrice) - 1) * 100;
};

// Calculate markup from purchase price and selling price without VAT
export const calcMarkupFromPriceWithoutVat = (purchasePrice, priceWithoutVat) => {
  if (!purchasePrice || purchasePrice === 0) return 0;
  return ((priceWithoutVat / purchasePrice) - 1) * 100;
};

// Calculate selling price without VAT from price with VAT
export const calcPriceWithoutVat = (priceWithVat) => priceWithVat / (1 + VAT_RATE);

// Calculate selling price with VAT from price without VAT
export const calcPriceWithVatFromWithout = (priceWithoutVat) => priceWithoutVat * (1 + VAT_RATE);
