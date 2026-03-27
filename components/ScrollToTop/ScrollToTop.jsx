"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineHeart, HiOutlineShoppingCart, HiOutlineTrash } from "react-icons/hi";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useWishlist } from "../../provider/WishlistProvider";
import { useCart } from "../../provider/CartProvider";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  const { wishlistItems, clearWishlist, removeFromWishlist } = useWishlist();
  const { addToCart, cartItems } = useCart();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const handleClearWishlist = () => {
    if (wishlistItems.length === 0) {
      toast.error("Wishlist is already empty");
      return;
    }
    clearWishlist();
    toast.success("Wishlist cleared!");
  };

  const handleAddToCart = (item) => {
    const exists = cartItems.some((cartItem) => cartItem.id === item.id);

    if (exists) {
      toast.error("Item already in cart");
      return;
    }

    addToCart({
      id: item.id,
      title: item.title,
      price:
        item.discountedPrice && item.discountedPrice < item.price
          ? item.discountedPrice
          : item.price,
      image:
        item.image ||
        item.imgs?.thumbnails?.[0] ||
        "/images/placeholder-product.png",
      quantity: 1,
    });

    removeFromWishlist(item.id);
    toast.success("Added to cart & removed from wishlist");
  };


  const isInStock = (item) => {
    if (item.StockQty === undefined && !item.stockStatus) return true;
    if (item.StockQty !== undefined) return item.StockQty > 0;
    return item.stockStatus === "In Stock";
  };

  return (
    <>
      {/* Scroll To Top + Wishlist Button */}
      {isVisible && (
        <div className="fixed bottom-8 right-8 z-9999 flex flex-col gap-3">
          <button
            onClick={() => setWishlistOpen(true)}
            className="relative flex items-center justify-center w-12 h-12 rounded-full shadow-xl bg-gray-800 hover:bg-gray-900 text-white transition-all"
            aria-label="Open wishlist"
          >
            <HiOutlineHeart className="w-7 h-7" />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                {wishlistItems.length}
              </span>
            )}
          </button>
          <button
            onClick={scrollToTop}
            className="flex items-center justify-center w-12 h-12 rounded-full shadow-xl bg-teal-600 hover:bg-teal-700 text-white transition-all"
            aria-label="Scroll to top"
          >
            <svg className="fill-white w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M233.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L256 173.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z" />
            </svg>
          </button>
        </div>
      )}

      {/* Wishlist Modal */}
      <AnimatePresence>
        {wishlistOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-9998 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setWishlistOpen(false)}
          >
            <motion.div
              className="w-full max-w-4xl max-h-screen bg-white rounded overflow-hidden flex flex-col"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ type: "spring", damping: 20, stiffness: 250 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h3></h3>
                <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-700">
                  My Wishlist
                </h2>
                <button
                  onClick={() => setWishlistOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl transition"
                >
                 x
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1 space-y-3 max-h-[calc(90vh-120px)]">
                {wishlistItems.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <div className="w-20 h-20 mx-auto rounded flex items-center justify-center">
                      <HiOutlineHeart className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Your wishlist is empty</h3>
                    <p className="text-gray-500">Save items you love for later</p>
                    <Link
                      href="/shop"
                      onClick={() => setWishlistOpen(false)}
                      className="inline-block px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded hover:bg-teal-600 transition"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                ) : (
                  <>
                    <div>
                      {wishlistItems.map((item) => (
                        <div
                          key={item.id}
                          className="relative flex items-center gap-4 px-4 py-2 bg-white border-b border-gray-200 hover:bg-gray-50 transition"
                        >
                          {/* Image */}
                          <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-50">
                            <Image
                              src={item.image || "/images/placeholder-product.png"}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 line-clamp-2 text-sm">
                              {item.title}
                            </h4>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="font-bold text-teal-600">
                                {(item.discountedPrice || item.price).toFixed(2)}
                              </span>
                              {item.discountedPrice && item.discountedPrice < item.price && (
                                <span className="text-sm text-gray-400 line-through">
                                  {item.price.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Stock Badge */}
                          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none">
                            <span
                              className={`inline-block px-3 py-1 text-xs font-medium rounded shadow-sm ${isInStock(item)
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}
                            >
                              {isInStock(item) ? "In Stock" : "Out of Stock"}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center ml-auto">
                            <button
                              onClick={() => handleAddToCart(item)}
                              disabled={!isInStock(item)}
                              className={`p-2.5 rounded-lg transition-all ${isInStock(item)
                                ? "text-teal-600 hover:text-teal-700"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                            >
                              <HiOutlineShoppingCart className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                removeFromWishlist(item.id);
                                toast.success("Removed from wishlist");
                              }}
                              className="p-2.5 rounded-lg text-red-600 hover:text-red-800 transition-all"
                            >
                              <HiOutlineTrash className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex p-4 gap-2 border-t border-gray-200">
                      <button
                        onClick={handleClearWishlist}
                        className="flex-1 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition"
                      >
                        Clear All
                      </button>
                      <Link
                        href="/wishlist"
                        onClick={() => setWishlistOpen(false)}
                        className="flex-1 py-2 bg-teal-500 text-white text-sm rounded text-center hover:bg-teal-600 transition"
                      >
                        View Full Wishlist
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
