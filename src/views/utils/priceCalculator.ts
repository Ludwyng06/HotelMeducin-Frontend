export const priceCalculator = (basePrice: number, taxRate: number = 0.1): number => {
    return basePrice + basePrice * taxRate;
  };