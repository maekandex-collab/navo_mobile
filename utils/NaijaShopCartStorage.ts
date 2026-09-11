import { MMKV } from 'react-native-mmkv'

export const storage = new MMKV()

type StoreItemType = {
  id: any
  quantity: number,
};

export const NaijaShopAddItem = (newItem: StoreItemType) => {
  try {
    const existing = storage.getString("NaijaShopCartItems");
    const items: StoreItemType[] = existing ? JSON.parse(existing) : [];

    // Check for duplicates (based on id)
    const exists = items.find(item => item.id === newItem.id);
    if (exists) {
      console.warn("Item already in cart");
      return;
    }

    items.push(newItem);
    storage.set("NaijaShopCartItems", JSON.stringify(items));
  } catch (error) {
    console.error("Error storing cart item:", error);
  }
};

export const NaijaShopGetItems = (): StoreItemType[] => {
  const data = storage.getString("NaijaShopCartItems");
  return data ? JSON.parse(data) : [];
};

export const NaijaShopGetItemById = (id: string): StoreItemType | undefined => {
  const data = storage.getString("NaijaShopCartItems");
  if (!data) return undefined;

  const items: StoreItemType[] = JSON.parse(data);
  return items.find(item => item.id === id);
};

export const NaijaShopIncreaseItemQuantity = (id: string): void => {
  const data = storage.getString("NaijaShopCartItems");
  if (!data) return;

  const items: StoreItemType[] = JSON.parse(data);
  const updatedItems = items.map(item =>
    item.id === id ? { ...item, quantity: item.quantity + 1 } : item
  );

  storage.set("NaijaShopCartItems", JSON.stringify(updatedItems));
};

export const NaijaShopDecreaseItemQuantity = (id: string): void => {
  const data = storage.getString("NaijaShopCartItems");
  if (!data) return;

  let items: StoreItemType[] = JSON.parse(data);
  const item = items.find(item => item.id === id);

  if (item) {

    if (item.quantity > 1) {
      items = items.map(item =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      );
    }

    storage.set("NaijaShopCartItems", JSON.stringify(items));
  }
};

export const NaijaShopUpdateItem = (updatedItem: StoreItemType) => {
  const items = NaijaShopGetItems();
  const updatedItems = items.map(item =>
    item.id === updatedItem.id ? updatedItem : item
  );
  storage.set("NaijaShopCartItems", JSON.stringify(updatedItems));
};

export const NaijaShopDeleteItem = (id: string) => {
  const items = NaijaShopGetItems();

  const exists = items.some(item => item.id === id);
  if (!exists) {
    return;
  }

  const filtered = items.filter(item => item.id !== id);
  storage.set("NaijaShopCartItems", JSON.stringify(filtered));
};

export const NaijaShopClearItems = () => {
  storage.delete("NaijaShopCartItems");
};

export const NaijaShopGetCartTotal = (products: any[]) => {
  const cart = NaijaShopGetItems();
  let total = 0;

  products.forEach(product => {
    const cartItem = cart.find(item => item.id === product.id);
    const quantity = cartItem?.quantity || 1;
    total += product.price * quantity;
  });

  return total.toFixed(2);
};

