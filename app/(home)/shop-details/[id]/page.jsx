'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiShare2 } from 'react-icons/fi';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useWishlist } from '@/provider/WishlistProvider';
import RelatedProducts from '@/components/RelatedProducts/RelatedProducts';
import { useCart } from '@/provider/CartProvider';
import { getProductById } from '@/lib/server/getProductById';
import VTOModal from '@/components/VTOModal/VTOModal';
import { HiSparkles } from 'react-icons/hi2';
import { useFeatures } from '@/hooks/useFeatures';

export default function ShopDetails({ params }) {
    const [previewImg, setPreviewImg] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [availableSizes, setAvailableSizes] = useState([]);
    const [availableColors, setAvailableColors] = useState([]);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('details');
    const [showVTOModal, setShowVTOModal] = useState(false);
    const [showFullDesc, setShowFullDesc] = useState(false);
    // Use the features hook
    const { features } = useFeatures();
    const { addToWishlist, isInWishlist, subscribeToWishlistChanges, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const router = useRouter();

    const [showMagnifier, setShowMagnifier] = useState(false);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const imgBoxRef = useRef(null);
    const handleMouseEnter = () => setShowMagnifier(true);
    const handleMouseLeave = () => setShowMagnifier(false);
    const handleMouseMove = (e) => {
        if (!imgBoxRef.current) return;

        const { left, top, width, height } = imgBoxRef.current.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;

        // clamp
        const clampedX = Math.max(0, Math.min(x, width));
        const clampedY = Math.max(0, Math.min(y, height));

        setCursorPosition({
            x: (clampedX / width) * 100,
            y: (clampedY / height) * 100,
        });
    };
    const imgRef = useRef(null);

    // const handleMouseMove = (e) => {
    //     if (!imgRef.current) return;

    //     const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    //     const x = e.clientX - left;
    //     const y = e.clientY - top;

    //     setCursorPosition({
    //         x: (x / width) * 100,
    //         y: (y / height) * 100,
    //     });

    //     setMagnifierPosition({ x: e.clientX, y: e.clientY });
    // };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const resolvedParams = await params;
                const data = await getProductById(resolvedParams.id);
                setProduct(data);

                // Extract unique colors and sizes from variants
                if (data.variants && data.variants.length > 0) {
                    const colors = [...new Set(data.variants.map(v => v.color).filter(Boolean))];
                    const sizes = [...new Set(data.variants.map(v => v.size).filter(Boolean))];

                    setAvailableColors(colors);
                    setAvailableSizes(sizes);

                    // Set default selections
                    if (colors.length > 0) setSelectedColor(colors[0]);
                    if (sizes.length > 0) setSelectedSize(sizes[0]);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load product details');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [params]);

    // Update selected variant when color or size changes
    useEffect(() => {
        if (!product || !product.variants) return;

        // Find variant matching selected color and size
        const variant = product.variants.find(
            v => v.color === selectedColor && v.size === selectedSize
        );

        setSelectedVariant(variant || null);

        // Reset quantity when variant changes
        setQuantity(1);
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
    }, [selectedColor, selectedSize, product]);

    // Get stock quantity for selected variant
    const getVariantStock = () => {
        if (!selectedVariant || !product || !product.stock) return 0;

        const variantStock = product.stock
            .filter(s => s.variantId === selectedVariant.variantId)
            .reduce((sum, s) => sum + (s.stockQty || 0), 0);

        return variantStock;
    };

    const handleQuantityChange = (value) => {
        if (!product) return;
        const maxStock = getVariantStock();
        const newValue = quantity + value;
        if (newValue > 0 && newValue <= maxStock) {
            setQuantity(newValue);
        }
    };

    const handleAddToCart = () => {
        if (!product || !selectedVariant) return;

        const stockQty = getVariantStock();
        if (stockQty === 0) {
            toast.error('Selected variant is out of stock');
            return;
        }

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
            image: product.imgs?.thumbnails[0] || '/images/placeholder-product.png',
            color: selectedColor,
            size: selectedSize,
            quantity,
        }, true);

        toast.success('Added to cart!');
    };

    useEffect(() => {
        if (!product) return;

        let mounted = true;

        setIsWishlisted(isInWishlist(product.id));

        const unsubscribe = subscribeToWishlistChanges((id, inWishlist) => {
            if (mounted && id === product.id) {
                setIsWishlisted(inWishlist);
            }
        });

        return () => {
            mounted = false;
            unsubscribe();
        };
    }, [product, isInWishlist, subscribeToWishlistChanges]);

    const handleItemToWishList = () => {
        if (!product) return;

        const totalStock = product.stock?.reduce((sum, s) => sum + (s.stockQty || 0), 0) || 0;

        if (totalStock === 0) {
            toast.error('The item is out of stock');
            return;
        }

        if (isWishlisted) {
            removeFromWishlist(product.id);
            toast.success('Item removed from wishlist!');
        } else {
            addToWishlist({
                id: product.id,
                title: product.title,
                price: product.price,
                brand: product.brand,
                image: product.imgs?.thumbnails[0] || '/images/placeholder-product.png',
                brand: product.brand,
                imgs: product.imgs,
                //StockQty: totalStock,
            });
            toast.success('Item added to wishlist!');
        }
    };

    const handleBuyNow = () => {
        if (!product || !selectedVariant) return;

        const stockQty = getVariantStock();
        if (stockQty === 0) {
            toast.error('Selected variant is out of stock');
            return;
        }

        addToCart({
            id: product.id,
            title: product.title,
            variantId: selectedVariant.variantId,
            price: selectedVariant.sellingPrice,
            brand: product.brand,
            vatType: selectedVariant?.vatType || "",
            vat: Number(selectedVariant?.vat || 0),
            sku: selectedVariant?.sku || null,
            barcode: selectedVariant?.barcode || null,
            image: product.imgs?.thumbnails[0] || '/images/placeholder-product.png',
            color: selectedColor,
            size: selectedSize,
            quantity,
        }, false);

        router.push('/checkout');
    };
    const getTruncatedText = (text, wordLimit = 100) => {
        if (!text) return "";

        const words = text.split(" ");
        if (words.length <= wordLimit) return text;

        return words.slice(0, wordLimit).join(" ");
    };
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

    const { vatType, vat } = getVariantVatInfo();
    const showVatExclusive = vatType?.toLowerCase() === "exclusive";
    if (loading) {
        return (
            <div className="pt-40 pb-16 bg-gray-50 flex justify-center">
                <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-teal-500" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="pt-24 pb-16 text-center">
                <p className="text-red-600">{error || 'Product not found'}</p>
                <Link href="/shop" className="text-[#32BBAB]">Back to shop</Link>
            </div>
        );
    }

    const totalStock = product.stock?.reduce((sum, s) => sum + (s.stockQty || 0), 0) || 0;
    const variantStock = getVariantStock();
    const currentPrice = selectedVariant?.sellingPrice || product.price;
    // Check if banner content is enabled
    const isVirtualTryEnabled =
        !loading && features?.enable_virtual_try === true;
    return (
        <>
            <div className="pt-38 manrope pb-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-9">
                    {/* Breadcrumbs */}
                    <nav className="flex mb-8" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-1 md:space-x-1.5">
                            <li className="inline-flex items-center">
                                <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                                    <FiChevronLeft className="mr-2 " /> Home
                                </Link>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <span className="mx-2 text-gray-400">/</span>
                                    <Link href="/shop" className="ml-1 text-sm font-medium text-gray-700 hover:text-[#32BBAB] md:ml-2">
                                        Shop
                                    </Link>
                                </div>
                            </li>
                            <li aria-current="page">
                                <div className="flex items-center">
                                    <span className="mx-2 text-gray-400">/</span>
                                    <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                                        {product.Description || product.styleNo}
                                    </span>
                                </div>
                            </li>
                        </ol>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Product Images */}
                        {/* ================= PRODUCT IMAGES ================= */}
                        <div className="grid grid-cols-1 lg:grid-cols-13 gap-2 items-start">

                            {/* ================= THUMBNAILS (LEFT - LARGE SCREENS) ================= */}
                            <div
                                className="hidden lg:flex lg:col-span-3 flex-col gap-2 overflow-y-auto overflow-x-hidden pr-2"
                                style={{
                                    height: "624px",
                                    scrollbarWidth: "none",       // Firefox
                                    msOverflowStyle: "none",      // IE/Edge
                                }}
                            >
                                {/* Hide scrollbar for Chrome/Safari */}
                                <style jsx>{`
                                div::-webkit-scrollbar {
                                display: none;
                                 }
                                `}</style>

                                {product.imgs?.thumbnails?.map((item, key) => (
                                    <button
                                        key={key}
                                        onClick={() => setPreviewImg(key)}
                                        className={`
                                         relative w-full h-37.5 flex-none overflow-hidden border-2 transition-all duration-200
                                          ${key === previewImg
                                                ? 'border-black opacity-100 shadow-sm'
                                                : 'border-gray-200 hover:border-black opacity-65 hover:opacity-85'}
                                        `}
                                    >
                                        <Image
                                            src={item}
                                            alt={`Thumbnail ${key + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="220px"
                                        />
                                    </button>
                                ))}
                            </div>
                            {/* ================= MAIN IMAGE ================= */}
                            <div className="lg:col-span-10">
                                <div
                                    ref={imgBoxRef}
                                    className="relative w-full bg-white border border-gray-200 overflow-hidden mx-auto"
                                    style={{ height: "624px" }}
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                    onMouseMove={handleMouseMove}
                                >
                                    {product.imgs?.previews?.[previewImg] ? (
                                        <>
                                            <Image
                                                src={product.imgs.previews[previewImg]}
                                                alt={product.title}
                                                fill
                                                priority
                                                className="object-cover"
                                                sizes="(max-width: 758px) 100vw, 60vw"
                                            />

                                            {/* Magnifier Lens */}
                                            {showMagnifier && (
                                                <div
                                                    className="pointer-events-none absolute rounded-full border border-gray-300 shadow-lg"
                                                    style={{
                                                        width: 180,
                                                        height: 180,
                                                        left: `calc(${cursorPosition.x}% - 90px)`,
                                                        top: `calc(${cursorPosition.y}% - 90px)`,
                                                        backgroundImage: `url(${product.imgs.previews[previewImg]})`,
                                                        backgroundRepeat: "no-repeat",
                                                        backgroundSize: "450% 450%", // zoom level
                                                        backgroundPosition: `${cursorPosition.x}% ${cursorPosition.y}%`,
                                                    }}
                                                />
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            No image available
                                        </div>
                                    )}

                                    {/* NEW BADGE */}
                                    {product.status === "New" && (
                                        <div className="absolute top-4 left-4 bg-black/70 text-white text-xs px-3 py-1">
                                            NEW
                                        </div>
                                    )}

                                    {/* WISHLIST BUTTON */}
                                    <button
                                        onClick={handleItemToWishList}
                                        className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
                                    >
                                        {isWishlisted ? (
                                            <FaHeart className="text-gray-900" />
                                        ) : (
                                            <FaRegHeart className="text-gray-600" />
                                        )}
                                    </button>
                                </div>

                                {/* ================= THUMBNAILS (MOBILE - BELOW IMAGE) ================= */}
                                <div
                                    className="flex lg:hidden flex-nowrap gap-2 mt-6 overflow-x-auto overflow-y-hidden px-1"
                                    style={{
                                        scrollbarWidth: "none",      // Firefox
                                        msOverflowStyle: "none",     // IE/Edge
                                    }}
                                >
                                    {/* Hide scrollbar for Chrome/Safari */}
                                    <style jsx>{`
    div::-webkit-scrollbar {
      display: none;
    }
  `}</style>

                                    {product.imgs?.thumbnails?.map((item, key) => (
                                        <button
                                            key={key}
                                            onClick={() => setPreviewImg(key)}
                                            className={`
        relative w-22.5 h-30 flex-none rounded-xs overflow-hidden border-2 transition-all duration-200
        ${key === previewImg
                                                    ? 'border-black opacity-100 shadow-sm scale-[1.03]'
                                                    : 'border-gray-200 hover:border-black opacity-70 hover:opacity-90'}
      `}
                                        >
                                            <Image
                                                src={item}
                                                alt={`Thumbnail ${key + 1}`}
                                                fill
                                                className="object-cover transition-transform duration-300"
                                                sizes="90px"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Product Details */}
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{product.Description || product.styleNo}</h1>
                                <div className="flex items-center mt-2">
                                    {totalStock > 0 ? (
                                        <span className="text-sm text-green-600">
                                            {variantStock > 0
                                                // ? `In Stock (${variantStock} available for selected variant)`
                                                ? `In Stock (${variantStock} available)`
                                                : <span className="text-sm text-red-600">Out of Stock</span>}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-red-600">Out of Stock</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <span className="text-3xl  text-gray-500">
                                    Tk {Number(currentPrice).toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                                {showVatExclusive && (
                                    // <span className="text-sm text-gray-500 font-thin">
                                    //     + VAT {vat ? `(${vat}%)` : ""}
                                    // </span>
                                    <span className="text-sm text-gray-500">
                                        + VAT
                                    </span>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-200">
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
                                                className={`px-4 py-2 border rounded-xs text-sm 
                                                    ${selectedColor === color
                                                        ? 'bg-[#32BBAB] text-white border-[#32BBAB]'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                onClick={() => setSelectedColor(color)}
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
                                                className={`px-4 py-2 border rounded-xs 
                                                    ${selectedSize === size
                                                        ? 'bg-[#32BBAB] text-white border-[#32BBAB]'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                onClick={() => setSelectedSize(size)}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity Selector */}
                            {selectedVariant && (
                                <div className="flex items-center space-x-4">
                                    <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
                                    <div className={`flex items-center border border-gray-300 rounded-xs ${variantStock === 0 ? 'opacity-50' : ''}`}>
                                        <button
                                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                            onClick={() => handleQuantityChange(-1)}
                                            disabled={variantStock === 0}
                                        >
                                            -
                                        </button>
                                        <span className="px-4 py-1 text-center text-gray-700 w-12">{quantity}</span>
                                        <button
                                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                            onClick={() => handleQuantityChange(1)}
                                            disabled={variantStock === 0}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex space-x-4 pt-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!selectedVariant || variantStock === 0}
                                    className={`flex-1 py-3 px-6 rounded-xs font-medium transition duration-300 
                                        ${!selectedVariant || variantStock === 0
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : 'bg-[#32BBAB] hover:bg-[#5b9790] text-white'
                                        }`}
                                >
                                    {!selectedVariant
                                        ? 'Select Options'
                                        : variantStock === 0
                                            ? 'OUT OF STOCK'
                                            : 'ADD TO CART'}
                                </button>
                                <button
                                    disabled={!selectedVariant || variantStock === 0}
                                    onClick={handleBuyNow}
                                    className={`flex-1 py-3 px-6 rounded-xs font-medium transition duration-300 
                                        ${!selectedVariant || variantStock === 0
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : 'bg-gray-900 hover:bg-gray-800 text-white'
                                        }`}
                                >
                                    BUY NOW
                                </button>
                            </div>

                            {/* Virtual Try-On Button */}
                            {!loading && isVirtualTryEnabled && (
                                <div className="pt-2">
                                    <button
                                        onClick={() => setShowVTOModal(true)}
                                        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xs font-bold text-[#32BBAB] border-2 border-[#32BBAB] hover:bg-[#32BBAB] hover:text-white transition-all duration-300 shadow-sm group"
                                    >
                                        <span className="text-xl group-hover:animate-pulse"><HiSparkles className="w-5 h-5" /></span>
                                        Virtual Try-On
                                    </button>
                                </div>
                            )}
                            {/* Share and More Info */}
                            <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                                <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                                    <FiShare2 className="mr-2" /> Share
                                </button>
                                <button
                                    className="flex gap-1.5 items-center text-sm text-gray-600 hover:text-gray-900"
                                    onClick={handleItemToWishList}
                                >
                                    {isWishlisted ? (
                                        <FaHeart className="text-gray-900" />
                                    ) : (
                                        <FaRegHeart className="text-gray-600" />
                                    )} Save for later
                                </button>
                            </div>

                            {/* Additional Info */}
                            <div className="pt-4 border-t border-gray-200">
                                <div className="space-y-2">
                                    <div className="flex">
                                        <span className="text-sm text-gray-500 w-24">Brand:</span>
                                        <span className="text-sm text-gray-700">{product.brand}</span>
                                    </div>
                                    <div className="flex">
                                        <label className="text-sm text-gray-500 w-24">Category:</label>
                                        <span className="text-sm text-gray-700">{product.type}</span>
                                    </div>
                                    {selectedVariant && (
                                        <>
                                            <div className="flex">
                                                <span className="text-sm text-gray-500 w-24">Variant SKU:</span>
                                                <span className="text-sm text-gray-700">{selectedVariant.sku || 'N/A'}</span>
                                            </div>
                                            <div className="flex">
                                                <span className="text-sm text-gray-500 w-24">Barcode:</span>
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

            {/* Product Tabs */}
            <div className="bg-black/85 manrope">
                <div className="border-b max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-gray-500">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`py-4 px-1 border-b-3 font-medium text-sm transition-colors ${activeTab === 'details'
                                ? 'border-[#32BBAB] text-[#32BBAB]'
                                : 'border-transparent text-gray-100 hover:text-gray-200 hover:border-gray-300'
                                }`}
                        >
                            Product Details
                        </button>
                        <button
                            onClick={() => setActiveTab('specs')}
                            className={`py-4 px-1 border-b-3 font-medium text-sm transition-colors ${activeTab === 'specs'
                                ? 'border-[#32BBAB] text-[#32BBAB]'
                                : 'border-transparent text-gray-100 hover:text-gray-200 hover:border-gray-300'
                                }`}
                        >
                            Specifications
                        </button>
                    </nav>
                </div>

                <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Product Details Tab */}
                    {activeTab === 'details' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-200 mb-4">Product Details</h3>
                                <div className="text-sm lg:text-base text-gray-300">
                                    <p>{product.Description}</p>
                                    <ul className="mt-6 space-y-3">
                                        <li className="flex items-start">
                                            <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Premium {product.type} crafted from high-quality materials</span>
                                        </li>
                                        <li className="flex items-start">
                                            <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Designed for comfort and durability</span>
                                        </li>
                                        <li className="flex items-start">
                                            <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Available in multiple colors and sizes</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-200 mb-4">Additional Information</h3>
                                <div className="text-sm lg:text-base text-gray-300">
                                    <p>{product.Specification || "Professional care instructions for your garment."}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Specifications Tab */}
                    {activeTab === 'specs' && (
                        <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
                            <div className="divide-y divide-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Product Specifications</h3>
                                        <dl className="space-y-2.5">
                                            <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                                                <dt className="text-sm font-medium text-gray-600">Brand</dt>
                                                <dd className="mt-1 text-sm text-gray-700 font-semibold sm:col-span-2">{product.brand}</dd>
                                            </div>
                                            <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                                                <dt className="text-sm font-medium text-gray-600">Type</dt>
                                                <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 capitalize">{product.type}</dd>
                                            </div>
                                            <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                                                <dt className="text-sm font-medium text-gray-600">Style No.</dt>
                                                <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 capitalize">{product.styleNo}</dd>
                                            </div>
                                            <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                                                <dt className="text-sm font-medium text-gray-600">Gender</dt>
                                                <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 capitalize">{product.category}</dd>
                                            </div>
                                            <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                                                <dt className="text-sm font-medium text-gray-600">Available Sizes</dt>
                                                <dd className="mt-1 text-sm text-gray-700 sm:col-span-2">
                                                    {availableSizes?.join(', ') || 'N/A'}
                                                </dd>
                                            </div>
                                            <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                                                <dt className="text-sm font-medium text-gray-600">Available Colors</dt>
                                                <dd className="mt-1 text-sm text-gray-700 sm:col-span-2">
                                                    {availableColors?.join(', ') || 'N/A'}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Shipping & Returns</h3>
                                        <div className="text-sm text-gray-600">
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="font-medium text-gray-700">Delivery Options</h4>
                                                    <p className="mt-1">Standard shipping: 3-5 business days</p>
                                                    <p>Express shipping: 1-2 business days</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-700">Return Policy</h4>
                                                    <p className="mt-1">Easy 30-day returns. Item must be unworn with tags attached.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Quality Assurance</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="flex items-start">
                                            <div className="shrink-0 bg-purple-50 rounded-md p-2">
                                                <svg className="h-6 w-6 text-purple-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h4 className="text-sm font-medium text-gray-700">Premium Materials</h4>
                                                <p className="mt-1 text-sm text-gray-500">Only the finest fabrics selected for durability and comfort.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="shrink-0 bg-purple-50 rounded-md p-2">
                                                <svg className="h-6 w-6 text-purple-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h4 className="text-sm font-medium text-gray-700">Ethical Production</h4>
                                                <p className="mt-1 text-sm text-gray-500">Responsibly manufactured in certified facilities.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="shrink-0 bg-purple-50 rounded-md p-2">
                                                <svg className="h-6 w-6 text-purple-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h4 className="text-sm font-medium text-gray-700">Quality Guarantee</h4>
                                                <p className="mt-1 text-sm text-gray-500">We stand behind the quality of all our products.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-16 pb-16 bg-white">
                {/* Related Products */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl lg:text-3xl manrope font-bold text-center uppercase text-gray-700 mb-8">You May Also Like</h2>
                    <RelatedProducts
                        currentProductId={product.id}
                        currentProductType={product.type}
                        addToWishlist={addToWishlist}
                        isInWishlist={isInWishlist}
                    />
                </div>
            </div>

            <VTOModal
                isOpen={showVTOModal}
                onClose={() => setShowVTOModal(false)}
                onConfirm={() => {
                    setShowVTOModal(false);
                    router.push(`/vto/${product.id}`);
                }}
            />
        </>
    );
}