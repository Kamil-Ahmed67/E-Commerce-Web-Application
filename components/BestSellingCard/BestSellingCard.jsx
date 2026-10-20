'use client';
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const BestSellingProductCard = ({ product, isAboveTheFold = false }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="product-card group bg-white border border-gray-200 hover:border-gray-300 shadow-sm transition-all duration-300 w-full flex flex-col">
      {/* Image section */}
      <div className="relative aspect-3/4 bg-gray-100 overflow-hidden">
        {/* New badge */}
        {product.status === 'New' && (
          <div className="absolute top-2 left-2 z-10 bg-black text-white text-[10px] px-2 py-2px uppercase tracking-wider">
            New
          </div>
        )}
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          {imageError ? (
            <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">
              Image Not Available
            </div>
          ) : (
            <div className="aspect-3/4 bg-gray-100 overflow-hidden relative">
              <Image
                src={product.image ||'Image'}
                alt={product.description || 'Item Name'}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-500"
                onError={() => setImageError(true)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={isAboveTheFold}
              />
            </div>
          )}
        </Link>

        {/* View Details Button on Hover */}
        <div className="absolute inset-0 flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
          <Link
            href={`/product/${product.slug}`}
            className="bg-white text-black text-xs font-medium px-4 py-2 uppercase tracking-wide hover:bg-black hover:text-white transition-all"
          >
            View Details
          </Link>
        </div>
      </div>

      {/* Text content */}
      <div className="p-3 flex flex-col grow">
        <h3 className="text-sm font-semibold text-gray-900 mb-1 leading-tight line-clamp-2">
          <Link href={`/product/${product.slug}`}>{product.description}</Link>
        </h3>
        <p className="text-xs text-gray-500 capitalize mb-1.5">{product.productType}</p>

        {/* Price */}
        <div className="mt-auto flex items-center gap-2">
          {/* <span className="text-sm font-semibold text-gray-900">
            {product.discountedPrice.toFixed(2)}Tk
          </span>
          {product.discountedPrice < product.price && (
            <span className="text-xs text-gray-400 line-through">
              {product.price.toFixed(2)}Tk
            </span>
          )} */}
          Tk{" "}
          {Number(product.sellingPrice).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>
    </div>
  );
};

export default BestSellingProductCard;
