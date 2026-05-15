export const formatPrice = (price) => {
  if (price === undefined || price === null) return '';
  const currencySetting = localStorage.getItem('currency');
  // Default to INR if not set
  const isINR = currencySetting === null || currencySetting === 'INR';
  const val = parseFloat(price);
  if (isNaN(val)) return price;
  
  // Assuming base price in DB is already in a logical format (we won't multiply by 10 anymore to keep it clean)
  const converted = val; 
  const symbol = isINR ? '₹' : '$';
  
  return `${symbol}${Number.isInteger(converted) ? converted : converted.toFixed(2)}`;
};
