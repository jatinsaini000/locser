export const formatPrice = (price) => {
  if (price === undefined || price === null) return '';
  const val = parseFloat(price);
  if (isNaN(val)) return price;
  
  // Always return INR (₹)
  return `₹${Number.isInteger(val) ? val : val.toFixed(2)}`;
};
