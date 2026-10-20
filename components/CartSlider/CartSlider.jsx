'use client'
import { useEffect } from 'react'
import { FiLock, FiMinus, FiPlus, FiShoppingCart, FiTrash2, FiX } from 'react-icons/fi'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/provider/CartProvider'
import { trackEvent } from '@/lib/trackEvent'
export default function CartSlider({ isOpen, onClose }) {
    const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart()

    useEffect(() => {
        if (!isOpen || cartItems.length === 0) return;
        trackEvent('view_cart', {
            value: cartTotal,
            contentIds: cartItems.map((i) => String(i.id)),
            contents: cartItems.map((i) => ({
                id: i.id,
                title: i.title,
                price: Number(i.discountedPrice ?? i.price ?? 0),
                quantity: i.quantity,
                brand: i.brand,
                sku: i.sku,
            })),
            numItems: cartItems.reduce((s, i) => s + i.quantity, 0),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);
    return (
        <div className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`}>
            {/* Background overlay */}
            <div
                className={`fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Slider container */}
            <div
                className={`fixed right-0 top-0 h-full w-full sm:max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 sm:p-6 bg-linear-to-r from-teal-600 to-teal-700 text-white">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold">Your Cart</h2>
                            <p className="text-xs sm:text-sm opacity-90">
                                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 sm:p-2 rounded-full hover:bg-white/10 transition-colors"
                            aria-label="Close cart"
                        >
                            <FiX size={20} className="stroke-[1.5]" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto">
                        {cartItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full p-6 sm:p-8 text-center">
                                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                                    <FiShoppingCart size={30} className="text-gray-400" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-2">Your cart is empty</h3>
                                <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">Looks like you haven&apos;t added anything yet</p>
                                <Link
                                    href="/shop"
                                    className="px-4 py-2 sm:px-6 sm:py-3 bg-black text-white rounded-xs hover:bg-teal-600 transition-colors ease-in-out duration-300 font-medium text-sm sm:text-base"
                                    onClick={onClose}
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {cartItems.map((item) => (
                                    <li key={item.variantId} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex gap-3 sm:gap-4">
                                            {/* Image */}
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 relative">
                                                <Image
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover rounded-lg border border-gray-200"
                                                    width={80}
                                                    height={80}
                                                />
                                                {item.quantity > 1 && (
                                                    <span className="absolute -top-2 -left-2 bg-[#32BBAB] text-white text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                                                        {item.quantity}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Product info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">{item.title}</h3>
                                                <p className="text-xs sm:text-sm text-gray-500 mt-1">Size: {item.size || 'Standard'}</p>
                                                <p className="text-xs sm:text-sm text-gray-500">Color: {item.color || 'Default'}</p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col items-end">
                                                <p className="text-sm sm:text-base font-bold text-gray-900">{item.price * item.quantity} Taka</p>
                                                <div className="flex items-center mt-2 sm:mt-3 space-x-2 sm:space-x-3">
                                                    <button
                                                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                                        className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <FiMinus size={12} className={item.quantity <= 1 ? 'text-gray-300' : 'text-gray-600'} />
                                                    </button>
                                                    <span className="text-xs sm:text-sm font-medium w-4 sm:w-6 text-gray-700 text-center">{item.quantity}</span>
                                                    <button
                                                       onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                                        className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                                                    >
                                                        <FiPlus size={12} className="text-gray-600" />
                                                    </button>
                                                </div>
                                                <button
                                                   onClick={() => removeFromCart(item.variantId)}
                                                    className="mt-1 sm:mt-2 text-xs text-red-500 hover:text-red-700 flex items-center transition-colors"
                                                >
                                                    <FiTrash2 size={12} className="mr-1" />
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Footer */}
                    {cartItems.length > 0 && (
                        <div className="p-4 sm:p-6 bg-white border-t border-gray-100">
                            <div className="space-y-3 mb-4 sm:mb-6">
                                <div className="border-t border-gray-200 my-2" />
                                <div className="flex justify-between text-gray-700 text-base sm:text-lg font-bold">
                                    <span>Total</span>
                                    <span>{cartTotal.toFixed(2)} Taka</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-2">
                                <Link
                                    href={{
                                        pathname: '/checkout',
                                        query: { fromCart: true }
                                    }}
                                    className="block w-full px-4 py-2 sm:px-6 sm:py-3 bg-teal-600 text-white rounded-xs hover:bg-teal-800 transition-colors font-medium text-sm sm:text-base text-center"
                                    onClick={onClose}
                                >
                                    Checkout
                                </Link>
                                <Link
                                    href="/shop"
                                    className="block w-full px-4 py-2 sm:px-6 sm:py-3 border text-gray-700 border-gray-300 rounded-xs hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base text-center"
                                    onClick={onClose}
                                >
                                    Continue Shopping
                                </Link>
                            </div>

                            <div className="mt-3 sm:mt-4 flex items-center justify-center text-xs text-gray-500">
                                <FiLock className="mr-1" size={12} />
                                Secure checkout
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
