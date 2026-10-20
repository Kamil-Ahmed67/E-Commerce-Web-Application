"use client";
import Image from "next/image";
import toast from "react-hot-toast";
import { HiOutlineTrash, HiOutlineShoppingCart } from "react-icons/hi";
import Link from "next/link";
import { useWishlist } from "@/provider/WishlistProvider";
import { useCart } from "@/provider/CartProvider";
import { FaEye } from "react-icons/fa";
import { slugify } from "@/utils/slugify";

const SingleItem = ({ item }) => {
  const { removeFromWishlist } = useWishlist();
  const { addToCart, cartItems } = useCart();
  const productId = item.productId ?? item.id;
  const productSlug = item.slug || (item.title ? slugify(item.title) : null);
  const productUrl = productSlug ? `/product/${productSlug}` : `/shop-details/${productId}`;

  const handleRemove = () => {
    removeFromWishlist(productId);
    toast.success("Removed from wishlist");
  };

  const handleAddToCart = () => {
    const exists = cartItems.some((cartItem) => cartItem.id === productId);
    if (exists) {
      toast.error("Item already in cart");
      return;
    }

    const price = Number(item.sellingPrice ?? item.price ?? 0);

    addToCart({
      id: productId,
      title: item.title,
      price,
      image: item.image,
      quantity: 1,
    });

    removeFromWishlist(productId);
    toast.success("Added to cart & removed from wishlist");
  };

  const isInStock =
    (item.StockQty !== undefined && item.StockQty > 0) ||
    item.stockStatus === "In Stock";

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-4 px-6 hover:bg-gray-50 transition-colors">
      {/* Product Info */}
      <div className="col-span-5 flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100">
          <Image
            src={item.image || "/images/placeholder-product.png"}
            alt={item.title || 'Product Item'}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900">
            {/* ✅ use the SAME route everywhere */}
            <Link href={productUrl} className="hover:text-teal-600">
              {item.title}
            </Link>
          </h3>
          {item.brand && <p className="text-xs text-gray-500">{item.brand}</p>}
        </div>
      </div>

      {/* Price */}
      <div className="col-span-2 pl-12 flex items-center">
        <span className="text-sm  font-semibold text-gray-900">
          Tk {Number(item.sellingPrice ?? item.price ?? 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
      {/* Actions */}
      <div className="col-span-3 flex items-center justify-end gap-3">
        {/* <button
          onClick={handleAddToCart}
          disabled={!isInStock}
          className={`p-2 rounded-lg transition-all ${
            isInStock ? "text-teal-600 hover:bg-teal-50" : "text-gray-300 cursor-not-allowed"
          }`}
          title={isInStock ? "Add to cart" : "Out of stock"}
        >
          <HiOutlineShoppingCart className="w-5 h-5" />
        </button> */}
        <Link href={productUrl}>
          <button
            className={"p-2 rounded-lg transition-all text-teal-600 hover:bg-teal-50"}
          >
            <FaEye className="w-5 h-5" />
          </button>
        </Link>
        <button
          onClick={handleRemove}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
          title="Remove from wishlist"
        >
          <HiOutlineTrash className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SingleItem;