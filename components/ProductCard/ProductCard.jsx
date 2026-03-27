'use client';
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

const ProductCard = ({ product }) => {
  const [hovered, setHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [enableTransition, setEnableTransition] = useState(true);
  const intervalRef = useRef(null);

  const images = product.imgs?.thumbnails?.length
    ? product.imgs.thumbnails
    : ['/images/placeholder.png'];

  // Clone first image for seamless loop
  const sliderImages = images.length > 1 ? [...images, images[0]] : images;

  // --- Effect for slideshow logic ---
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (hovered && images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => prev + 1);
        setEnableTransition(true);
      }, 1400);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hovered, images.length]);

  const handleTransitionEnd = () => {
    // When we reach the cloned first slide
    if (currentImageIndex === images.length) {
      setEnableTransition(false);
      setCurrentImageIndex(0);
    }
  };

  // Re-enable transition after instant reset
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
      className="group relative w-full flex flex-col bg-white border border-gray-200 rounded-none overflow-hidden transition-all duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Product Image */}
      <div className="relative aspect-3/4 bg-gray-50 overflow-hidden">
        {/* New Badge - CONSTANT */}
        {product.status === 'New' && (
          <div className="absolute top-3 left-0 z-20 bg-black text-white px-3 py-1 text-xs font-medium tracking-wider -translate-x-1">
            NEW
          </div>
        )}

        {/* Sold Out Overlay - CONSTANT */}
        {product.StockQty === 0 && (
          <div className="absolute inset-0 bg-white/60 z-20 flex items-center justify-center">
            <span className="text-black uppercase tracking-widest text-sm font-medium opacity-90">
              Sold Out
            </span>
          </div>
        )}

        {/* Image slider with seamless loop */}
        <Link href={`/shop-details/${product.id}`} passHref>
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
                    alt={`${product.styleNo || product.description} - ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          </div>
        </Link>

        {/* Buy Now Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white py-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-30">
          <Link
            href={`/shop-details/${product.id}`}
            className="w-full flex items-center justify-center text-xs uppercase tracking-wider font-medium"
          >
            BUY NOW
          </Link>
        </div>
      </div>

      {/* Product Info */}
      <div className="px-2.5 py-3 flex flex-col">
        {product.brand && (
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">
            {product.brand.replace(/([a-z])([A-Z])/g, '$1 $2')}
          </p>
        )}
        <h3 className="text-md manrope font-semibold text-gray-700 mb-2 leading-tight tracking-tight">
          <Link href={`/shop-details/${product.id}`} className="hover:underline">
            {product.description || product.styleNo}
          </Link>
        </h3>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm manrope font-medium text-gray-900">
              Tk {Number(product.sellingPrice).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;