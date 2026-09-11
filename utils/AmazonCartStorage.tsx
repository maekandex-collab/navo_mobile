import { MMKV } from 'react-native-mmkv'

export const storage = new MMKV()

type AmazonItemType = {
  asin: any;
  quantity: number;
  title: string;
  price: string;
  image: string;
};

export const AmazonAddItem = (newItem: AmazonItemType) => {
  try {
    const existing = storage.getString("AmazonCartItems");
    const items: AmazonItemType[] = existing ? JSON.parse(existing) : [];

    // Check for duplicates (based on asin)
    const exists = items.find(item => item.asin === newItem.asin);
    if (exists) {
      console.warn("Item already in cart");
      return;
    }

    items.push(newItem);
    storage.set("AmazonCartItems", JSON.stringify(items));
  } catch (error) {
    console.error("Error storing cart item:", error);
  }
};

export const AmazonRandomAddItem = (newItem: AmazonItemType) => {
  try {
    const existing = storage.getString("AmazonCartItems");
    const items: AmazonItemType[] = existing ? JSON.parse(existing) : [];

    // Check for duplicates (based on asin)
    const exists = items.find(item => item.asin === newItem.asin);

    if (exists) {

      const updatedItems = items.map(item =>
        item.asin === newItem.asin ? { ...item, quantity: item.quantity + newItem.quantity } : item
      );

      storage.set("AmazonCartItems", JSON.stringify(updatedItems));
      console.warn("Item already in cart, so increment");
      return;
    }

    items.push(newItem);
    storage.set("AmazonCartItems", JSON.stringify(items));
  } catch (error) {
    console.error("Error storing cart item:", error);
  }
};

export const AmazonGetItems = (): AmazonItemType[] => {
  const data = storage.getString("AmazonCartItems");
  return data ? JSON.parse(data) : [];
};

export const AmazonGetItemByAsin = (asin: string): AmazonItemType | undefined => {
  const data = storage.getString("AmazonCartItems");
  if (!data) return undefined;

  const items: AmazonItemType[] = JSON.parse(data);
  return items.find(item => item.asin === asin);
};

export const AmazonIncreaseItemQuantity = (asin: string): void => {
  const data = storage.getString("AmazonCartItems");
  if (!data) return;

  const items: AmazonItemType[] = JSON.parse(data);
  const updatedItems = items.map(item =>
    item.asin === asin ? { ...item, quantity: item.quantity + 1 } : item
  );

  storage.set("AmazonCartItems", JSON.stringify(updatedItems));
};

export const AmazonDecreaseItemQuantity = (asin: string): void => {
  const data = storage.getString("AmazonCartItems");
  if (!data) return;

  let items: AmazonItemType[] = JSON.parse(data);
  const item = items.find(item => item.asin === asin);

  if (item) {

    if (item.quantity > 1) {
      items = items.map(item =>
        item.asin === asin ? { ...item, quantity: item.quantity - 1 } : item
      );
    }

    storage.set("AmazonCartItems", JSON.stringify(items));
  }
};

export const AmazonUpdateItem = (updatedItem: AmazonItemType) => {
  const items = AmazonGetItems();
  const updatedItems = items.map(item =>
    item.asin === updatedItem.asin ? updatedItem : item
  );
  storage.set("AmazonCartItems", JSON.stringify(updatedItems));
};

export const AmazonDeleteItem = (asin: string) => {
  const items = AmazonGetItems();

  const exists = items.some(item => item.asin === asin);
  if (!exists) {
    return;
  }

  const filtered = items.filter(item => item.asin !== asin);
  storage.set("AmazonCartItems", JSON.stringify(filtered));
};

export const AmazonClearItems = () => {
  storage.delete("AmazonCartItems");
};

export const AmazonGetCartTotal = (products: any[]) => {
  const cart = AmazonGetItems();
  let total = 0;

  products.forEach(product => {
    const cartItem = cart.find(item => item.asin === product.asin);
    const quantity = cartItem?.quantity || 1;
    total += product.price * quantity;
  });

  return total.toFixed(2);
};

