"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import QuickViewModal from "../QuickViewModal/QuickViewModal";
import { useWishlist } from "../../provider/WishlistProvider";

const SingleGridItem = ({ product, onQuickView }) => {
  const [showQuickView, setShowQuickView] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [hovered, setHovered] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [enableTransition, setEnableTransition] = useState(true);

  const intervalRef = useRef(null);

  const {
    addToWishlist,
    isInWishlist,
    removeFromWishlist,
    subscribeToWishlistChanges,
  } = useWishlist();

  const images = product.imgs?.thumbnails?.length
    ? product.imgs.thumbnails
    : ["/images/placeholder-product.png"];

  // clone first image for seamless loop
  const sliderImages = images.length > 1 ? [...images, images[0]] : images;

  const initialImage = images[0] || "/images/placeholder-product.png";

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

  // useEffect(() => {
  //   if (intervalRef.current) {
  //     clearInterval(intervalRef.current);
  //     intervalRef.current = null;
  //   }

  //   if (hovered && images.length > 1) {
  //     intervalRef.current = setInterval(() => {
  //       setCurrentImageIndex((prev) => prev + 1);
  //       setEnableTransition(true);
  //     }, 1400);
  //   }

  //   return () => {
  //     if (intervalRef.current) clearInterval(intervalRef.current);
  //   };
  // }, [hovered, images.length]);
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (hovered && images.length > 1) {
      // Start the slideshow IMMEDIATELY with a small timeout for the first change
      // Set a timeout for the first slide change (faster than the interval)
      const firstChangeTimeout = setTimeout(() => {
        setCurrentImageIndex((prev) => prev + 1);
        setEnableTransition(true);
      }, 400); // First change after 300ms instead of waiting for interval

      // Then set up the regular interval for subsequent changes
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => prev + 1);
        setEnableTransition(true);
      }, 1400);

      // Store both in ref for cleanup
      intervalRef.current = {
        firstTimeout: firstChangeTimeout,
        interval: intervalRef.current
      };
    }

    return () => {
      if (intervalRef.current) {
        if (intervalRef.current.firstTimeout) {
          clearTimeout(intervalRef.current.firstTimeout);
        }
        if (intervalRef.current.interval) {
          clearInterval(intervalRef.current.interval);
        }
      }
    };
  }, [hovered, images.length]);
  const handleTransitionEnd = () => {
    // when we reach the cloned first slide
    if (currentImageIndex === images.length) {
      setEnableTransition(false);
      setCurrentImageIndex(0);
    }
  };

  // re-enable transition after instant reset
  useEffect(() => {
    if (!enableTransition) {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEnableTransition(true);
        });
      });
      return () => cancelAnimationFrame(id);
    }
  }, [enableTransition]);

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
      });
      toast.success("Item added to wishlist!");
    }
  };

  const handleQuickView = () => {
    setShowQuickView(true);
    onQuickView?.(product);
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setEnableTransition(false);
    setCurrentImageIndex(0);
  };

  return (
    <div
      className="product-card group relative w-full h-full flex flex-col bg-white border border-gray-100 hover:border-gray-200 rounded-none overflow-hidden transition-all duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative aspect-3/4 bg-gray-50 overflow-hidden">
        {product.status === "New" && (
          <div className="absolute top-4 left-0 z-10 bg-black text-white px-3 py-1 text-xs font-medium tracking-wider transform -translate-x-1">
            NEW
          </div>
        )}

        {product.StockQty === 0 && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
            <span className="text-black uppercase tracking-widest text-sm font-medium opacity-90">
              Sold Out
            </span>
          </div>
        )}

        <button
          onClick={handleItemToWishList}
          className={`absolute top-3 right-3 lg:top-2.5 lg:right-2.5 z-20 p-2 lg:p-1.5 rounded-full transition-all duration-200 ${isWishlisted
            ? "text-gray-900 bg-white/90 shadow-sm"
            : "text-gray-400 hover:text-gray-900 bg-white/80 hover:bg-white/90 shadow-sm"
            }`}
          disabled={product.StockQty === 0}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isWishlisted ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.5}
            className="w-5 h-5 lg:w-4 lg:h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </button>

        <Link prefetch={false} href={`/product/${product.slug}`} className="block w-full h-full">
          <div className="relative w-full h-full overflow-hidden">
            <div
              className="flex h-full"
              onTransitionEnd={handleTransitionEnd}
              style={{
                width: `${sliderImages.length * 100}%`,
                transform: `translateX(-${currentImageIndex * (100 / sliderImages.length)}%)`,
                transition: enableTransition ? "transform 550ms ease-in-out" : "none",
              }}
            >
              {sliderImages.map((img, index) => (
                <div
                  key={`${img}-${index}`}
                  className="relative h-full shrink-0"
                  style={{ width: `${100 / sliderImages.length}%` }}
                >
                  <Image
                    src={img}
                    alt={`${product.styleNo || product.description} - image ${index + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          </div>
        </Link>

        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white py-2 transform md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300 z-10">
          <button
            onClick={handleQuickView}
            className="w-full flex manrope items-center justify-center gap-1 text-xs uppercase tracking-wider font-medium"
          >
            QUICK VIEW
          </button>
        </div>
      </div>

      <div className="p-2 flex-1 flex flex-col">
        <div className="mb-1">
          <p className="text-[10px] font-light text-gray-500 uppercase tracking-widest min-h-[1em]">
            {product.brand ? product.brand.replace(/([a-z])([A-Z])/g, "$1 $2") : " "}
          </p>
        </div>

        <h3 className="text-xs text-gray-700 mb-1.5 leading-tight tracking-tight line-clamp-2">
          <Link prefetch={false} href={`/product/${product.slug}`} className="hover:underline">
            {product.description}
          </Link>
        </h3>

        <div className="mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs manrope font-medium text-gray-900">
                Tk{" "}
                {Number(product.sellingPrice).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            {product.colors && product.colors.length > 0 && (
              <div className="flex space-x-1">
                {product.colors.slice(0, 3).map((color, index) => (
                  <span
                    key={index}
                    className="w-3.5 h-3.5 rounded-full border border-gray-200"
                    style={{ backgroundColor: color }}
                    aria-label={`Color option ${color}`}
                  />
                ))}
                {product.colors.length > 3 && (
                  <span className="text-[10px] text-gray-500 flex items-center">
                    +{product.colors.length - 3}
                  </span>
                )}
              </div>
            )}
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

export default SingleGridItem;