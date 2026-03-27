'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useWishlist } from '@/provider/WishlistProvider';
import { getProducts } from '@/lib/server/shopData';
import { useCart } from '@/provider/CartProvider';

// Base64 placeholder for blur effect
const blurDataURL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

export default function RelatedProducts({
  currentProductId,
  currentProductType,
  addToWishlist: propAddToWishlist,
  isInWishlist: propIsInWishlist,
}) {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addToCart: contextAddToCart } = useCart();
  const {
    addToWishlist: contextAddToWishlist,
    isInWishlist: contextIsInWishlist,
    removeFromWishlist: contextRemoveFromWishlist,
  } = useWishlist();

  const addToWishlist = propAddToWishlist || contextAddToWishlist;
  const isInWishlist = propIsInWishlist || contextIsInWishlist;

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const allProducts = await getProducts();

        const sameTypeProducts = allProducts.filter(
          (p) =>
            p.productType === currentProductType &&
            String(p.id) !== String(currentProductId)
        );

        if (sameTypeProducts.length === 0) {
          setRelatedProducts([]);
          return;
        }

        const sorted = sameTypeProducts.sort((a, b) => {
          const dateA = a.EntryDate ? new Date(a.EntryDate) : new Date(0);
          const dateB = b.EntryDate ? new Date(b.EntryDate) : new Date(0);
          return dateB - dateA;
        });

        setRelatedProducts(sorted.slice(0, 5));
      } catch (err) {
        console.error('Related products fetch error:', err);
        setError('Could not load similar products');
      } finally {
        setLoading(false);
      }
    };

    if (currentProductType) {
      fetchRelatedProducts();
    }
  }, [currentProductId, currentProductType]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-3/4 bg-gray-200 rounded-lg" />
            <div className="mt-3 h-4 bg-gray-200 rounded w-3/4" />
            <div className="mt-2 h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-gray-600">
        <p>{error}</p>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No similar products found in this category.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-4">
      {relatedProducts.map((product) => {
        const price = product.sellingPrice || 0;

        // Prepare images — same logic as SingleGridItem
        const thumbnails = product.imgs?.thumbnails?.length
          ? product.imgs.thumbnails
          : ['/images/placeholder-product.png'];

        const defaultImage = thumbnails[0];
        const hoverImage = thumbnails[1] ?? thumbnails[0]; // fallback to first if no second image

        return (
          <div
            key={product.id}
            className="group relative bg-white border border-gray-200 hover:border-gray-300 rounded transition-shadow hover:shadow-md overflow-hidden"
          >
            <div className="relative aspect-3/4 overflow-hidden">
              <Link href={`/shop-details/${product.id}`} className="block w-full h-full">
                {/* Default image */}
                <Image
                  src={defaultImage}
                  alt={product.styleNo || 'Product'}
                  fill
                  className="object-cover transition-opacity duration-500 ease-in-out group-hover:opacity-0"
                  placeholder="blur"
                  blurDataURL={blurDataURL}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />

                {/* Hover image - appears on hover */}
                <Image
                  src={hoverImage}
                  alt={product.styleNo || 'Product'}
                  fill
                  className="object-cover transition-opacity duration-500 ease-in-out opacity-0 group-hover:opacity-100 absolute inset-0"
                  placeholder="blur"
                  blurDataURL={blurDataURL}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
              </Link>

              {/* Wishlist button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (isInWishlist(product.id)) {
                    contextRemoveFromWishlist?.(product.id);
                    toast.success('Removed from wishlist');
                  } else {
                    addToWishlist({
                      id: product.id,
                      title: product.styleNo || product.description || 'Product',
                      price: product.sellingPrice,
                      image: defaultImage,
                      brand: product.brand,
                      imgs: product.imgs,
                    });
                    toast.success('Added to wishlist');
                  }
                }}
                className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition"
              >
                {isInWishlist(product.id) ? (
                  <FaHeart className="w-4 h-4 text-red-500" />
                ) : (
                  <FiHeart className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>

            <div className="p-3">
              <h3 className="text-sm manrope font-medium truncate">
                {product.description?.substring(0, 40) || product.styleNo  || 'Product'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{product.brand || '—'}</p>

              <div className="mt-2">
                <span className="text-base text-gray-700 manrope font-bold">
                  Tk {Number(price).toLocaleString(("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }))}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}