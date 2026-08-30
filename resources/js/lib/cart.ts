import { useSyncExternalStore } from 'react';

export type CartProduct = {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    price: string;
    priceAmount: number;
    imageUrl: string | null;
    imageAlt: string;
    fallbackCategory: string | null;
};

export type CartItem = {
    product: CartProduct;
    quantity: number;
};

const cartStorageKey = 'koz-kebab-cart';
const cartChangeEvent = 'koz-kebab-cart-change';
const emptyCart: CartItem[] = [];

let cachedValue: string | null | undefined;
let cachedItems: CartItem[] = emptyCart;

function readCart(): CartItem[] {
    if (typeof window === 'undefined') {
        return emptyCart;
    }

    const value = window.localStorage.getItem(cartStorageKey);

    if (value === cachedValue) {
        return cachedItems;
    }

    cachedValue = value;

    if (value === null) {
        cachedItems = emptyCart;

        return cachedItems;
    }

    try {
        const parsedValue: unknown = JSON.parse(value);
        cachedItems = Array.isArray(parsedValue)
            ? (parsedValue as CartItem[])
            : emptyCart;
    } catch {
        cachedItems = emptyCart;
    }

    return cachedItems;
}

function writeCart(items: CartItem[]) {
    cachedItems = items;

    try {
        const value = JSON.stringify(items);
        window.localStorage.setItem(cartStorageKey, value);
        cachedValue = value;
    } catch {
        cachedValue = null;
    }

    window.dispatchEvent(new Event(cartChangeEvent));
}

function subscribe(listener: () => void): () => void {
    const handleStorage = (event: StorageEvent) => {
        if (event.key === cartStorageKey) {
            cachedValue = undefined;
            listener();
        }
    };

    window.addEventListener(cartChangeEvent, listener);
    window.addEventListener('storage', handleStorage);

    return () => {
        window.removeEventListener(cartChangeEvent, listener);
        window.removeEventListener('storage', handleStorage);
    };
}

export function useCart() {
    const items = useSyncExternalStore(subscribe, readCart, () => emptyCart);
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const totalAmount = items.reduce(
        (total, item) => total + item.product.priceAmount * item.quantity,
        0,
    );

    function addItem(product: CartProduct) {
        const currentItems = readCart();
        const currentItem = currentItems.find(
            (item) => item.product.id === product.id,
        );

        writeCart(
            currentItem
                ? currentItems.map((item) =>
                      item.product.id === product.id
                          ? { ...item, product, quantity: item.quantity + 1 }
                          : item,
                  )
                : [...currentItems, { product, quantity: 1 }],
        );
    }

    function updateQuantity(productId: number, quantity: number) {
        const currentItems = readCart();

        writeCart(
            quantity < 1
                ? currentItems.filter((item) => item.product.id !== productId)
                : currentItems.map((item) =>
                      item.product.id === productId
                          ? { ...item, quantity }
                          : item,
                  ),
        );
    }

    function clearCart() {
        writeCart(emptyCart);
    }

    return {
        items,
        itemCount,
        totalAmount,
        addItem,
        updateQuantity,
        clearCart,
    };
}
