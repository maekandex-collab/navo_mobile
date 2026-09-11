import { formatCount } from "./FormatCount";
import { getCartQuantity } from "./getCartQuantity";

export const getFormattedCartCount = (cart: any[]) => {
  return formatCount(getCartQuantity(cart));
};
