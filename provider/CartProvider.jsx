'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(undefined);

export const CartProvider = ({ children }) => {
  // ✅ Lazy initialization (NO setState in effect)
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // ✅ Effect ONLY syncs to external system (localStorage)
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item, openSlider = true) => {
    if (!item?.variantId) {
      console.error("Missing variantId in addToCart item:", item);
      return;
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(ci => ci.variantId === item.variantId);

      if (existingItem) {
        return prevItems.map(ci =>
          ci.variantId === item.variantId
            ? {
              ...ci,
              // keep metadata updated
              brand: item.brand ?? ci.brand ?? null,
              sku: item.sku ?? ci.sku ?? null,
              barcode: item.barcode ?? ci.barcode ?? null,
              // quantity add
              quantity: ci.quantity + (item.quantity || 1),
              checked: ci.checked ?? true,
              vatType: item.vatType ?? "",
              vat: Number(item.vat || 0),
            }
            : ci
        );
      }

      return [
        ...prevItems,
        {
          ...item,
          quantity: item.quantity || 1,
          checked: true,
          vatType: item.vatType ?? "",
          vat: Number(item.vat || 0),
        },
      ];
    });

    if (openSlider) setIsCartOpen(true);
  };

  const removeFromCart = (variantId) => {
    setCartItems(prev => prev.filter(item => item.variantId !== variantId));
  };

  const updateQuantity = (variantId, quantity) => {
    if (quantity < 1) return removeFromCart(variantId);
    setCartItems(prev =>
      prev.map(item =>
        item.variantId === variantId ? { ...item, quantity } : item
      )
    );
  };

  const toggleCheck = (variantId) => {
    setCartItems(prev =>
      prev.map(item =>
        item.variantId === variantId
          ? { ...item, checked: !(item.checked ?? true) }
          : item
      )
    );
  };
  const removeAllItems = () => setCartItems([]);

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const itemCount = cartItems.reduce(
    (count, item) => count + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        cartTotal,
        itemCount,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCheck,
        removeAllItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
