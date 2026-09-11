import { MMKV } from 'react-native-mmkv'

export const storage = new MMKV()

type Shop4MeCartItemType = {
  id: string
  goodSize: string
  color: string
  item: string
  details: string
  quantity: number
  amount: number
  onlineStoreLink: string
};

type StoreItemType = {
  id: any
  quantity: number,
};

//shop4Me
export const Shop4MeAddItem = (newItem: Shop4MeCartItemType) => {
  const existing = storage.getString("Shop4MeCartItems");
  let items: Shop4MeCartItemType[] = existing ? JSON.parse(existing) : [];

  // skip if already in cart
  // const exists = items.find(item => item.id === newItem.id);
  // if (!exists) {
  //   items.push(newItem);
  //   storage.set("Shop4MeCartItems", JSON.stringify(items));
  // }

  //increase quantity if exists
  const index = items.findIndex(item => item.id === newItem.id);
  if (index !== -1) {
    items[index].quantity += newItem.quantity;
  } else {
    items.push(newItem);
  }

  storage.set("Shop4MeCartItems", JSON.stringify(items));
};

export const Shop4MeGetItems = (): Shop4MeCartItemType[] => {
  const data = storage.getString("Shop4MeCartItems");
  return data ? JSON.parse(data) : [];
};

export const Shop4MeUpdateItem = (updatedItem: Shop4MeCartItemType) => {
  const items = Shop4MeGetItems();
  const updatedItems = items.map(item =>
    item.id === updatedItem.id ? updatedItem : item
  );
  storage.set("Shop4MeCartItems", JSON.stringify(updatedItems));
};

export const Shop4MeDeleteItem = (id: string) => {
  const items = Shop4MeGetItems();
  const filtered = items.filter(item => item.id !== id);
  storage.set("Shop4MeCartItems", JSON.stringify(filtered));
};

export const Shop4MeClearItems = () => {
  storage.delete("Shop4MeCartItems");
};


//store
export const StoreAddItem = (newItem: StoreItemType) => {
  try {
    const existing = storage.getString("StoreCartItems");
    const items: StoreItemType[] = existing ? JSON.parse(existing) : [];

    // Check for duplicates (based on id)
    const exists = items.find(item => item.id === newItem.id);
    if (exists) {
      console.warn("Item already in cart");
      return;
    }

    items.push(newItem);
    storage.set("StoreCartItems", JSON.stringify(items));
  } catch (error) {
    console.error("Error storing cart item:", error);
  }
};

export const StoreGetItems = (): StoreItemType[] => {
  const data = storage.getString("StoreCartItems");
  return data ? JSON.parse(data) : [];
};

export const StoreGetItemById = (id: string): StoreItemType | undefined => {
  const data = storage.getString("StoreCartItems");
  if (!data) return undefined;

  const items: StoreItemType[] = JSON.parse(data);
  return items.find(item => item.id === id);
};

export const StoreIncreaseItemQuantity = (id: string): void => {
  const data = storage.getString("StoreCartItems");
  if (!data) return;

  const items: StoreItemType[] = JSON.parse(data);
  const updatedItems = items.map(item =>
    item.id === id ? { ...item, quantity: item.quantity + 1 } : item
  );

  storage.set("StoreCartItems", JSON.stringify(updatedItems));
};

export const StoreDecreaseItemQuantity = (id: string): void => {
  const data = storage.getString("StoreCartItems");
  if (!data) return;

  let items: StoreItemType[] = JSON.parse(data);
  const item = items.find(item => item.id === id);

  if (item) {
    // if (item.quantity > 1) {
    //   items = items.map(item =>
    //     item.id === id ? { ...item, quantity: item.quantity - 1 } : item
    //   );
    // } else {
    //   // If quantity is 1, remove the item from cart
    //   items = items.filter(item => item.id !== id);
    // }

    if (item.quantity > 1) {
      items = items.map(item =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      );
    }

    storage.set("StoreCartItems", JSON.stringify(items));
  }
};

export const StoreUpdateItem = (updatedItem: StoreItemType) => {
  const items = StoreGetItems();
  const updatedItems = items.map(item =>
    item.id === updatedItem.id ? updatedItem : item
  );
  storage.set("StoreCartItems", JSON.stringify(updatedItems));
};

export const StoreDeleteItem = (id: string) => {
  const items = StoreGetItems();

  const exists = items.some(item => item.id === id);
  if (!exists) {
    return;
  }

  const filtered = items.filter(item => item.id !== id);
  storage.set("StoreCartItems", JSON.stringify(filtered));
};

export const StoreClearItems = () => {
  storage.delete("StoreCartItems");
};

export const storeGetCartTotal = (products: any[]) => {
  const cart = StoreGetItems();
  let total = 0;

  products.forEach(product => {
    const cartItem = cart.find(item => item.id === product.id);
    const quantity = cartItem?.quantity || 1;
    total += product.price * quantity;
  });

  return total.toFixed(2);
};

