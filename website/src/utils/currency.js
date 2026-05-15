export const formatPrice = (price) => {
  if (price === undefined || price === null) return '';
  const isINR = localStorage.getItem('currency') === 'INR';
  const val = parseFloat(price);
  if (isNaN(val)) return price;
  
  const converted = isINR ? val * 10 : val;
  const symbol = isINR ? '₹' : '$';
  
  // Return without decimals if it's a whole number, otherwise 2 decimal places
  return `${symbol}${Number.isInteger(converted) ? converted : converted.toFixed(2)}`;
};
