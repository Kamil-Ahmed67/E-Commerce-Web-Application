"use client";
import React from "react";
import toast from "react-hot-toast";
import { HiOutlineHeart } from "react-icons/hi";
import Link from "next/link";
import { useWishlist } from "@/provider/WishlistProvider";
import SingleItem from "./SingleItem";
const Wishlist = () => {
  const { wishlistItems, clearWishlist } = useWishlist();

  const handleClearWishlist = () => {
    if (wishlistItems.length === 0) {
      toast.error("Wishlist is already empty");
      return;
    }
    clearWishlist();
    toast.success("Wishlist cleared successfully");
  };

  return (
    <section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Your Wishlist</h1>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <span className="text-sm text-gray-500">
              {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"}
            </span>
            <button
              onClick={handleClearWishlist}
              className="text-sm text-teal-600 hover:text-teal-800"
            >
              Clear Wishlist
            </button>
          </div>
        </div>

        {/* Empty Wishlist */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border-2 shadow-sm border-dashed border-gray-200">
            <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gray-100 mb-4">
              <HiOutlineHeart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Save your favorite items here for later</p>
            <Link
              href="/shop"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#32BBAB] hover:bg-[#2c9d90]"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {/* Table Header for Desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 py-3 px-6 bg-linear-to-r from-teal-600 to-teal-800 text-sm font-medium text-gray-100 uppercase tracking-wider">
              <div className="col-span-5">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>

            {/* Wishlist Items */}
            <div className="divide-y divide-gray-200">
              {wishlistItems.map((item) => (
                <SingleItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Wishlist;
