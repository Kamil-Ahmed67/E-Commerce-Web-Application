"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import QuickViewModal from "../QuickViewModal/QuickViewModal";
import { useWishlist } from "../../provider/WishlistProvider";

const SingleListItem = ({ product, onQuickView }) => {
  const [showQuickView, setShowQuickView] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { addToWishlist, isInWishlist, removeFromWishlist, subscribeToWishlistChanges } = useWishlist();

  useEffect(() => {
    if (!product) return;
    let isMounted = true;

    const checkWishlistStatus = () => {
      if (isMounted) setIsWishlisted(isInWishlist(product.id));
    };

    checkWishlistStatus();

    const unsubscribe = subscribeToWishlistChanges((id, inWishlist) => {
      if (isMounted && id === product.id) setIsWishlisted(inWishlist);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [product, isInWishlist, subscribeToWishlistChanges]);

  const handleItemToWishList = () => {
    if (!product) return;

    if (product.StockQty === 0) {
      toast.error("The item is out of stock");
      return;
    }

    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast.success("Item removed from wishlist!");
    } else {
      addToWishlist({
        id: product.id,
        productId: product.id,
        title: product.description,
        sellingPrice: product.sellingPrice,
        image: initialImage,
        brand: product.brand,
        imgs: product.imgs,
        // StockQty: product.StockQty,
      });
      toast.success("Item added to wishlist!");
    }
  };

  const handleQuickView = () => {
    setShowQuickView(true);
    onQuickView?.(product);
  };

  return (
    <div className="product-card group relative bg-white border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row">
        {/* Product Image Container */}
        <div className="relative w-full sm:w-72 h-96 sm:h-auto overflow-hidden">
          {/* Badges */}
          <div className="absolute top-3 left-0 z-10 flex flex-col items-start gap-1">
            {product.StockQty === 0 && (
              <span className="px-3 py-1 text-xs font-medium uppercase tracking-wider text-white bg-gray-600 rounded-none">
                Sold Out
              </span>
            )}
            {product.IsNewArraival && (
              <span className="px-3 py-1 text-xs font-medium uppercase tracking-wider text-white bg-black rounded-none">
                New
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleItemToWishList}
            className={`absolute top-3 right-3 z-10 p-2 transition-all ${isWishlisted ? 'text-rose-600' : 'text-gray-400 hover:text-rose-600'}`}
            disabled={product.StockQty === 0}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={isWishlisted ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>

          {/* Product Image */}
          <Link prefetch={false} href={`/product/${product.slug}`} className="block w-full h-full relative">
            <Image
              src={product.imgs?.previews?.[0] || '/images/placeholder-product.png'}
              alt={product.styleNo}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              className="object-contain transition-transform duration-500 group-hover:scale-105"
              priority
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg=="
            />
          </Link>

          {/* Quick View Button */}
          <button
            onClick={handleQuickView}
            className="absolute bottom-0 left-0 right-0 bg-black/70 text-white py-3 text-sm uppercase tracking-widest font-light opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          >
            Quick View
          </button>
        </div>

        {/* Product Details */}
        <div className="flex-1 p-8 flex flex-col">
          {/* Brand and Title */}
          <div className="mb-2">
            <p className="text-xs font-light text-gray-500 uppercase tracking-widest mb-1">
              {product.brand}
            </p>
            <h3 className="text-xl font-light text-gray-900 mb-2 leading-snug">
              <Link prefetch={false} href={`/product/${product.slug}`} className="hover:underline">
                {/* {product.styleNo} */}
                {product.description}
              </Link>
            </h3>
            <p className="text-sm text-gray-500 mb-1">{product.type} for {product.gender}</p>
          </div>

          {/* Additional Product Info */}
          <div className="mb-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
            {product.sizes?.length > 0 && (
              <div className="col-span-2">
                <span className="font-medium mr-2">Available Sizes:</span>
                <div className="inline-flex flex-wrap gap-1 mt-1">
                  {product.sizes.map((size, index) => (
                    <span key={index} className="px-2 py-1 text-xs border border-gray-200">
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Price and Action Buttons */}
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className={`text-lg manrope lg:text-2xl font-medium text-gray-900`}>
                  Tk{" "}
                  {Number(product.sellingPrice).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <div className="flex space-x-4">
              <Link
                href={`/product/${product.slug}`}
                className="flex-1 text-center py-3 px-4 border border-black hover:border-teal-600 hover:bg-teal-600 text-sm uppercase tracking-widest font-light text-black hover:text-white transition-colors duration-300"
              >
                View Details
              </Link>
              <button
                onClick={handleQuickView}
                className="flex-1 py-3 px-4 bg-teal-600 text-sm uppercase tracking-widest font-light text-white hover:bg-teal-700 transition-colors duration-300"
                disabled={product.StockQty === 0}
              >
                {product.StockQty === 0 ? 'Out of Stock' : 'Quick Shop'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <QuickViewModal
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
        isInWishlist={(productId) => isInWishlist(productId)}
      />
    </div>
  );
};

export default SingleListItem;
