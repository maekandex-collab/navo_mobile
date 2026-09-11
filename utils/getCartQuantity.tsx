export const getCartQuantity = (cart: any[]) => {
    
  if (!cart || cart.length === 0) return 0;

  return cart.reduce((total, item) => {
    return total + (item.quantity ?? 0);
  }, 0);

};
