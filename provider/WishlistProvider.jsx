"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

const WishlistContext = createContext(undefined);

// ✅ one place to decide the key (product-based by default)
const getWishlistKey = (itemOrId) => {
  if (typeof itemOrId === "string" || typeof itemOrId === "number") {
    return itemOrId;
  }
  return itemOrId?.productId ?? itemOrId?.id ?? itemOrId?.variantId;
};

export const WishlistProvider = ({ children }) => {
  // ✅ Lazy init from localStorage (NO setState in effect)
  const [wishlistItems, setWishlistItems] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("wishlist");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const subscribersRef = useRef([]);

  // ✅ Sync to localStorage (external system only)
  useEffect(() => {
    try {
      localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
    } catch {}
  }, [wishlistItems]);

  const subscribeToWishlistChanges = useCallback((callback) => {
    subscribersRef.current = [...subscribersRef.current, callback];

    return () => {
      subscribersRef.current = subscribersRef.current.filter(
        (cb) => cb !== callback
      );
    };
  }, []);

  const notifySubscribers = useCallback((key, isInWishlist) => {
    subscribersRef.current.forEach((callback) => {
      try {
        callback(key, isInWishlist);
      } catch (error) {
        console.error("Error in wishlist subscriber:", error);
      }
    });
  }, []);

  const addToWishlist = useCallback(
    (item) => {
      const key = getWishlistKey(item);
      if (!key) {
        console.error("Missing id/productId/variantId in addToWishlist:", item);
        return;
      }

      setWishlistItems((prev) => {
        // ✅ uniqueness check by key (productId/id/variantId)
        if (prev.some((i) => getWishlistKey(i) === key)) return prev;

        const newItem = {
          ...item,
          // ✅ normalize so future reads are consistent
          productId: item.productId ?? item.id,
          image:
            item.image ||
            item.imgs?.thumbnails?.[0] ||
            "/images/placeholder-product.png",
          stockStatus:
            item.StockQty && item.StockQty > 0 ? "In Stock" : "Out of Stock",
        };

        queueMicrotask(() => notifySubscribers(key, true));
        return [...prev, newItem];
      });
    },
    [notifySubscribers]
  );

  const removeFromWishlist = useCallback(
    (idOrKey) => {
      const key = getWishlistKey(idOrKey);
      if (!key) return;

      setWishlistItems((prev) => {
        const next = prev.filter((item) => getWishlistKey(item) !== key);
        queueMicrotask(() => notifySubscribers(key, false));
        return next;
      });
    },
    [notifySubscribers]
  );

  const clearWishlist = useCallback(() => {
    setWishlistItems((prev) => {
      const keys = prev.map((item) => getWishlistKey(item)).filter(Boolean);
      queueMicrotask(() => keys.forEach((k) => notifySubscribers(k, false)));
      return [];
    });
  }, [notifySubscribers]);

  const isInWishlist = useCallback(
    (idOrKey) => {
      const key = getWishlistKey(idOrKey);
      if (!key) return false;
      return wishlistItems.some((item) => getWishlistKey(item) === key);
    },
    [wishlistItems]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        subscribeToWishlistChanges,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
};