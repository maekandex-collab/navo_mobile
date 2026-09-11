const currencySymbols: Record<string, string> = {
  NGN: '₦',
  GBP: '£',
  USD: '$',
  EUR: '€'
};

const displayCurrency = (num: number, currency: 'GBP' | 'NGN' | 'USD' | 'EUR' = 'GBP') => {
  const normalizedCurrency = (currency?.toUpperCase() as 'GBP' | 'NGN' | 'USD' | 'EUR') ?? 'GBP';

  // Strictly ensure num is a number
  if (typeof num !== 'number' || isNaN(num) || num === undefined || num === null) {
    return `${currencySymbols[normalizedCurrency]}0.00`;
  }

  let formatted = '';

  // Handling other currency (use Intl.NumberFormat)
  if (normalizedCurrency === 'GBP' || normalizedCurrency === 'USD' || normalizedCurrency === 'EUR') {
    
    // formatted = new Intl.NumberFormat('en-GB', {
    //   style: 'currency',
    //   currency: 'GBP',
    //   minimumFractionDigits: 2,
    //   maximumFractionDigits: 2,
    // }).format(num);

    formatted = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: normalizedCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }

  // Handling NGN (Manually format for NGN)
  if (normalizedCurrency === 'NGN') {
    // Force 2 decimal places
    formatted = num.toFixed(2);
    // Add commas for thousands manually
    formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    // Prepend the ₦ symbol manually (override any previous formatting)
    formatted = currencySymbols['NGN'] + formatted;
  }

  return formatted;
};

export default displayCurrency;
