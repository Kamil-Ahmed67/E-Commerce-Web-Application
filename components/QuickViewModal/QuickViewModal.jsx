'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiStar } from 'react-icons/fi';
import { FaHeart, FaRegHeart, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/provider/CartProvider';
import { useWishlist } from '@/provider/WishlistProvider';
import { getProductById } from '@/lib/server/getProductById';
import { trackEvent } from '@/lib/trackEvent';

const QuickViewModal = ({ product: initialProduct, isOpen, onClose }) => {
    const [previewImg, setPreviewImg] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [availableSizes, setAvailableSizes] = useState([]);
    const [availableColors, setAvailableColors] = useState([]);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showFullDesc, setShowFullDesc] = useState(false);
    const [product, setProduct] = useState(initialProduct);
    // const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { addToCart, setBuyNowItem } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist, subscribeToWishlistChanges } = useWishlist();

    // Fetch full product details when modal opens
    useEffect(() => {
        if (isOpen && initialProduct?.id) {
            const fetchFullProduct = async () => {
                // setLoading(true);
                try {
                    const fullProduct = await getProductById(initialProduct.id);
                    setProduct({ ...fullProduct, slug: initialProduct.slug || fullProduct.slug });
                } catch (error) {
                    console.error('Error fetching product details:', error);
                    toast.error('Failed to load product details');
                } finally {
                    //setLoading(false);
                }
            };
            fetchFullProduct();
        }
    }, [isOpen, initialProduct?.id]);

    // Initialize available colors and sizes from product variants
    useEffect(() => {
        if (!product || !product.variants || product.variants.length === 0) return;

        const colors = [...new Set(product.variants.map(v => v.color).filter(Boolean))];
        const sizes = [...new Set(product.variants.map(v => v.size).filter(Boolean))];

        setAvailableColors(colors);
        setAvailableSizes(sizes);

        // Set default selections
        if (colors.length > 0 && !selectedColor) setSelectedColor(colors[0]);
        if (sizes.length > 0 && !selectedSize) setSelectedSize(sizes[0]);
    }, [product, selectedSize, selectedColor]);

    // Update selected variant when color or size changes
    useEffect(() => {
        if (!product || !product.variants || !selectedColor || !selectedSize) return;

        const variant = product.variants.find(
            v => v.color === selectedColor && v.size === selectedSize
        );

        setSelectedVariant(variant || null);
        setQuantity(1); // Reset quantity when variant changes
    }, [selectedColor, selectedSize, product]);

    // Get available sizes for selected color
    useEffect(() => {
        if (!product || !product.variants || !selectedColor) return;

        const sizesForColor = product.variants
            .filter(v => v.color === selectedColor)
            .map(v => v.size)
            .filter(Boolean);

        setAvailableSizes([...new Set(sizesForColor)]);

        // Reset size if current selection not available for this color
        if (selectedSize && !sizesForColor.includes(selectedSize)) {
            setSelectedSize(sizesForColor[0] || '');
        }
    }, [selectedColor, product, selectedSize]);

    // Get stock quantity for selected variant
    const getVariantStock = () => {
        if (!selectedVariant || !product || !product.stock) return 0;

        const variantStock = product.stock
            .filter(s => s.variantId === selectedVariant.variantId)
            .reduce((sum, s) => sum + (s.stockQty || 0), 0);

        return variantStock;
    };

    const variantStock = getVariantStock();
    const totalStock = product?.stock?.reduce((sum, s) => sum + (s.stockQty || 0), 0) || 0;

    // Calculate display price from selected variant or fallback to product price
    const displayPrice = selectedVariant?.sellingPrice || product?.price || 0;

    // VAT helpers
    const getVariantVatInfo = () => {
        if (!selectedVariant) {
            return { vatType: "", vat: 0 };
        }
        return {
            vatType: selectedVariant.vatType || "",
            vat: Number(selectedVariant.vat || 0),
        };
    };

    const { vatType } = getVariantVatInfo();
    const showVatExclusive = vatType?.toLowerCase() === "exclusive";

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    // Wishlist state subscription
    useEffect(() => {
        if (!product || !isOpen) return;

        setIsWishlisted(isInWishlist(product.id));

        const unsubscribe = subscribeToWishlistChanges((id, inWishlist) => {
            if (id === product.id) setIsWishlisted(inWishlist);
        });

        return () => unsubscribe();
    }, [product, isOpen, isInWishlist, subscribeToWishlistChanges]);

    const handleQuantityChange = (value) => {
        const newValue = quantity + value;
        if (newValue > 0 && newValue <= variantStock) {
            setQuantity(newValue);
        }
    };

    const handleAddToCart = () => {
        if (!product || !selectedVariant) {
            toast.error('Please select color and size');
            return;
        }

        if (variantStock === 0) {
            toast.error('Selected variant is out of stock');
            return;
        }

        const cartImage = product.imgs?.thumbnails?.[0] || '/images/placeholder-product.png';

        addToCart({
            id: product.id,
            title: product.title,
            variantId: selectedVariant.variantId,
            brand: product.brand,
            vatType: selectedVariant?.vatType || "",
            vat: Number(selectedVariant?.vat || 0),
            sku: selectedVariant?.sku || null,
            barcode: selectedVariant?.barcode || null,
            price: selectedVariant.sellingPrice,
            image: cartImage,
            color: selectedColor,
            size: selectedSize,
            quantity,
        }, true);

        trackEvent('add_to_cart', {
            value: selectedVariant.sellingPrice * quantity,
            contentIds: [String(product.id)],
            contents: [{
                id: product.id,
                title: product.title,
                price: selectedVariant.sellingPrice,
                quantity,
                brand: product.brand,
                category: product.productType,
                sku: selectedVariant?.sku,
                stock: variantStock,
            }],
        });

        toast.success('Added to cart!');
        onClose();
    };

    const handleWishlist = () => {
        if (!product) return;

        if (totalStock === 0) {
            toast.error('The item is out of stock');
            return;
        }

        if (isWishlisted) {
            removeFromWishlist(product.id);
            toast.success("Item removed from wishlist!");
        } else {
            addToWishlist({
                id: product.id,
                title: product.title,
                price: product.price,
                discountedPrice: product.discountedPrice > 0 ? product.discountedPrice : undefined,
                image: product.imgs?.thumbnails?.[0] || '/images/placeholder-product.png',
                brand: product.brand,
                imgs: product.imgs,
            });
            trackEvent('add_to_wishlist', {
                value: product.price,
                contentIds: [String(product.id)],
                contents: [{
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    quantity: 1,
                    brand: product.brand,
                    category: product.productType,
                    stock: totalStock,
                }],
            });
            toast.success("Item added to wishlist!");
        }
    };

    const handleBuyNow = () => {
        if (!product || !selectedVariant) {
            toast.error('Please select color and size');
            return;
        }

        if (variantStock === 0) {
            toast.error('Selected variant is out of stock');
            return;
        }

        setBuyNowItem({
            id: product.id,
            title: product.title,
            variantId: selectedVariant.variantId,
            brand: product.brand,
            vatType: selectedVariant?.vatType || "",
            vat: Number(selectedVariant?.vat || 0),
            sku: selectedVariant?.sku || null,
            barcode: selectedVariant?.barcode || null,
            price: selectedVariant.sellingPrice,
            image: product.imgs?.thumbnails[0] || '/images/placeholder-product.png',
            color: selectedColor,
            size: selectedSize,
            quantity,
            checked: true,
        });

        onClose();
        router.push('/checkout');
    };

    const getTruncatedText = (text, wordLimit = 30) => {
        if (!text) return "";
        const words = text.split(" ");
        if (words.length <= wordLimit) return text;
        return words.slice(0, wordLimit).join(" ") + "...";
    };

    if (!isOpen) return null;

    // if (loading) {
    //     return (
    //         <div className="fixed inset-0 z-50 overflow-y-auto">
    //             <div className="fixed inset-0 bg-black/80" onClick={onClose} />
    //             <div className="flex items-center justify-center min-h-screen p-4">
    //                 <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto p-12">
    //                     <div className="flex flex-col items-center justify-center">
    //                         <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-teal-500 mb-4" />
    //                         <p className="text-gray-600">Loading product details...</p>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // }

    if (!product) return null;

    const mainImage = product.imgs?.previews?.[previewImg] ||
        product.imgs?.thumbnails?.[previewImg] ||
        product.imgs?.thumbnails?.[0] ||
        '/images/placeholder-product.png';

    const thumbnails = product.imgs?.thumbnails?.length ? product.imgs.thumbnails :
        product.imgs?.previews?.length ? product.imgs.previews :
            ['/images/placeholder-product.png'];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Background overlay */}
            <div
                className="fixed inset-0 bg-black/60 transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal container */}
            <div className="flex items-start md:items-center justify-center min-h-screen p-2 sm:p-4">
                <div
                    className="relative bg-white rounded-xs shadow-xl w-full max-w-5xl mx-auto overflow-hidden transform transition-all mt-2 md:mt-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
                        aria-label="Close modal"
                    >
                        <FaTimes className="text-gray-600" />
                    </button>

                    {/* Modal content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6 max-h-[92vh] overflow-y-auto">
                        {/* Product Images */}
                        <div className="space-y-4">
                            <div className="relative w-full bg-white rounded-xs border border-gray-200 overflow-hidden" style={{ aspectRatio: '4 / 5' }}>
                                <Image
                                    src={mainImage}
                                    alt={product.title || 'Product image'}
                                    fill
                                    className="object-cover rounded"
                                    priority
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    onError={(e) => {
                                        e.currentTarget.src = '/images/placeholder-product.png';
                                    }}
                                />

                                {/* Badges */}
                                <div className="absolute top-4 left-4 flex gap-2 z-10">
                                    {product.status === 'New' && (
                                        <div className="bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded-xs">
                                            NEW
                                        </div>
                                    )}
                                </div>

                                {/* Out of Stock Overlay */}
                                {totalStock === 0 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                        <span className="text-gray-100 font-thin px-3 py-1 rounded text-xl lg:text-2xl">
                                            OUT OF STOCK
                                        </span>
                                    </div>
                                )}

                                {/* Wishlist Button */}
                                <button
                                    className={`absolute top-4 right-4 z-10 p-2 rounded-full shadow-md transition ${totalStock === 0
                                            ? 'bg-gray-100 cursor-not-allowed'
                                            : 'bg-white hover:bg-gray-100'
                                        }`}
                                    onClick={handleWishlist}
                                    disabled={totalStock === 0}
                                    title={totalStock === 0
                                        ? "Cannot add out of stock items to wishlist"
                                        : isWishlisted
                                            ? "Remove from wishlist"
                                            : "Add to wishlist"
                                    }
                                >
                                    {isWishlisted
                                        ? <FaHeart className={totalStock === 0 ? 'text-gray-400' : 'text-red-500'} />
                                        : <FaRegHeart className={totalStock === 0 ? 'text-gray-400' : 'text-gray-600'} />
                                    }
                                </button>
                            </div>

                            {/* Thumbnails */}
                            {thumbnails.length > 1 && (
                                <div className="flex flex-wrap gap-2">
                                    {thumbnails.map((item, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setPreviewImg(index)}
                                            className={`w-12 h-12 sm:w-16 sm:h-16 overflow-hidden rounded-xs bg-gray-100 shadow-sm transition-all duration-200 border-2 ${index === previewImg
                                                    ? "border-[#32BBAB]"
                                                    : "border-transparent hover:border-gray-300"
                                                }`}
                                            aria-label={`View image ${index + 1}`}
                                        >
                                            <Image
                                                src={item}
                                                alt={`Thumbnail ${index + 1}`}
                                                width={64}
                                                height={64}
                                                className="object-cover w-full h-full"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/images/placeholder-product.png';
                                                }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Details */}
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{product.Description || product.styleNo}</h2>
                                <div className="flex items-center mt-2">
                                    {totalStock > 0 ? (
                                        <span className="text-sm text-green-600">
                                            {variantStock > 0
                                                ? `In Stock (${variantStock} available)`
                                                : <span className="text-sm text-red-600">Selected variant out of stock</span>}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-red-600">Out of Stock</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <span className="text-2xl font-bold text-gray-900">
                                    Tk {Number(displayPrice).toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                                {showVatExclusive && (
                                    <span className="text-sm text-gray-500 font-thin">+ VAT</span>
                                )}
                            </div>

                            <div className="pt-2">
                                {product.AdditionalDescription && (
                                    <div className="mt-2 text-sm text-gray-600 leading-relaxed">
                                        {showFullDesc
                                            ? product.AdditionalDescription
                                            : getTruncatedText(product.AdditionalDescription, 40)}

                                        {product.AdditionalDescription.split(" ").length > 40 && (
                                            <button
                                                onClick={() => setShowFullDesc(!showFullDesc)}
                                                className="ml-2 text-teal-700 font-medium hover:underline"
                                            >
                                                {showFullDesc ? "Show Less" : "...Load More"}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Color Selection */}
                            {availableColors.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Color</h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {availableColors.map((color, index) => (
                                            <button
                                                key={index}
                                                className={`px-4 py-1.5 border rounded text-sm 
                                                    ${selectedColor === color
                                                        ? 'bg-[#32BBAB] text-white border-[#32BBAB]'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                onClick={() => setSelectedColor(color)}
                                                disabled={totalStock === 0}
                                            >
                                                {color}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Size Selection */}
                            {availableSizes.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Size</h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {availableSizes.map((size, index) => (
                                            <button
                                                key={index}
                                                className={`px-4 py-1.5 border rounded text-sm 
                                                    ${selectedSize === size
                                                        ? 'bg-[#32BBAB] text-white border-[#32BBAB]'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                onClick={() => setSelectedSize(size)}
                                                disabled={totalStock === 0}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity Selector */}
                            {selectedVariant && (
                                <div className="flex items-center gap-4">
                                    <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
                                    <div className={`flex items-center border border-gray-300 rounded ${variantStock === 0 ? 'opacity-50' : ''
                                        }`}>
                                        <button
                                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                            onClick={() => handleQuantityChange(-1)}
                                            disabled={variantStock === 0 || quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <span className="px-4 py-1 text-center text-gray-700 w-12">
                                            {quantity}
                                        </span>
                                        <button
                                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                            onClick={() => handleQuantityChange(1)}
                                            disabled={variantStock === 0 || quantity >= variantStock}
                                        >
                                            +
                                        </button>
                                    </div>
                                    {variantStock > 0 && (
                                        <span className="text-xs text-gray-500">
                                            Max: {variantStock}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 pt-4">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={!selectedVariant || variantStock === 0}
                                        className={`flex-1 py-3 px-4 rounded font-medium transition-colors duration-300 text-sm ${!selectedVariant || variantStock === 0
                                                ? 'bg-gray-300 cursor-not-allowed'
                                                : 'bg-[#32BBAB] hover:bg-[#5b9790] text-white'
                                            }`}
                                    >
                                        {!selectedVariant
                                            ? 'Select Options'
                                            : variantStock === 0
                                                ? 'Out of Stock'
                                                : 'Add to Cart'}
                                    </button>
                                    <button
                                        onClick={handleBuyNow}
                                        disabled={!selectedVariant || variantStock === 0}
                                        className={`flex-1 py-3 px-4 rounded font-medium transition-colors duration-300 text-sm ${!selectedVariant || variantStock === 0
                                                ? 'bg-gray-300 cursor-not-allowed'
                                                : 'bg-gray-900 hover:bg-gray-800 text-white'
                                            }`}
                                    >
                                        Buy Now
                                    </button>
                                </div>
                                <Link
                                    href={`/product/${product.slug}`}
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded font-medium transition-colors duration-300 text-center text-sm"
                                    onClick={onClose}
                                >
                                    View Full Details
                                </Link>
                                <button
                                    onClick={() => {
                                        trackEvent('start_trial', {
                                            contentIds: [String(product.id)],
                                            contents: [{
                                                id: product.id,
                                                title: product.title,
                                                price: product.price,
                                                quantity: 1,
                                                brand: product.brand,
                                                category: product.productType,
                                                stock: totalStock,
                                            }],
                                        });
                                        onClose();
                                        router.push(`/vto/${product.id}`);
                                    }}
                                    disabled={totalStock === 0}
                                    className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-md font-bold text-[#32BBAB] border-2 border-[#32BBAB] transition-all duration-300 shadow-sm group text-sm ${totalStock === 0
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'hover:bg-[#32BBAB] hover:text-white'
                                        }`}
                                >
                                    <span className="text-xl group-hover:animate-pulse">✨</span>
                                    Virtual Try-On
                                </button>
                            </div>

                            {/* Additional Info */}
                            <div className="pt-4 border-t border-gray-200">
                                <div className="space-y-2">
                                    <div className="flex">
                                        <span className="text-sm text-gray-500 w-20">Brand:</span>
                                        <span className="text-sm text-gray-700">{product.brand}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-sm text-gray-500 w-20">Category:</span>
                                        <span className="text-sm text-gray-700">{product.type}</span>
                                    </div>
                                    {selectedVariant && (
                                        <>
                                            <div className="flex">
                                                <span className="text-sm text-gray-500 w-20">SKU:</span>
                                                <span className="text-sm text-gray-700">{selectedVariant.sku || 'N/A'}</span>
                                            </div>
                                            <div className="flex">
                                                <span className="text-sm text-gray-500 w-20">Barcode:</span>
                                                <span className="text-sm text-gray-700">{selectedVariant.barcode || 'N/A'}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default QuickViewModal;