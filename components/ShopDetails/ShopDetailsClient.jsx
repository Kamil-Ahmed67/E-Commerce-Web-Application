'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronRight, FiShare2, FiCopy, FiX, FiMapPin, FiPhone, FiMail, FiClock, FiNavigation } from 'react-icons/fi';
import { FaHeart, FaRegHeart, FaFacebook, FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useWishlist } from '@/provider/WishlistProvider';
import RelatedProducts from '@/components/RelatedProducts/RelatedProducts';
import { useCart } from '@/provider/CartProvider';
import { getProductById } from '@/lib/server/getProductById';
import { HiSparkles } from 'react-icons/hi2';
import { useFeatures } from '@/hooks/useFeatures';
import { AnimatePresence, motion } from 'framer-motion';
import MingleLoader from '@/components/MingleLoader/MingleLoader';
import { trackEvent } from '@/lib/trackEvent';
import { getGenderDisplayName, isMenCategory, isWomenCategory } from '@/utils/genderHelpers';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import ProductLightbox from '@/components/ShopDetails/ProductLightbox';

export default function ShopDetailsClient({ params, initialProduct, initialSpecs = [] }) {
    const [previewImg, setPreviewImg] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [availableSizes, setAvailableSizes] = useState([]);
    const [availableColors, setAvailableColors] = useState([]);
    const [product, setProduct] = useState(initialProduct || null);
    const [loading, setLoading] = useState(!initialProduct);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('details');
    const [showFullDesc, setShowFullDesc] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const { features } = useFeatures();
    const { addToWishlist, isInWishlist, subscribeToWishlistChanges, removeFromWishlist } = useWishlist();
    const { addToCart, setBuyNowItem } = useCart();
    const router = useRouter();

    const [showMagnifier, setShowMagnifier] = useState(false);
    const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
    const [imgRect, setImgRect] = useState({ renderWidth: 0, renderHeight: 0, offsetX: 0, offsetY: 0 });
    const [imgNaturalSize, setImgNaturalSize] = useState({ width: 0, height: 0 });
    const imgBoxRef = useRef(null);
    const ZOOM_LEVEL = 3.5;
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [showDescModal, setShowDescModal] = useState(false);
    const [showSizeChartModal, setShowSizeChartModal] = useState(false);
    const [styleCopied, setStyleCopied] = useState(false);
    const [showStoreModal, setShowStoreModal] = useState(false);
    const [showLightbox, setShowLightbox] = useState(false);
    const shareMenuRef = useRef(null);

    const getShareUrl = () => typeof window !== 'undefined' ? window.location.href : '';

    const handleShare = () => {
        setShowShareMenu(true);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(getShareUrl()).then(() => {
            toast.success('Link copied to clipboard!');
            setShowShareMenu(false);
        });
    };

    const handleCopyStyleNo = () => {
        if (!product?.styleNo) return;
        navigator.clipboard.writeText(product.styleNo).then(() => {
            setStyleCopied(true);
            toast.success('Style number copied!');
            setTimeout(() => setStyleCopied(false), 1500);
        });
    };

    const shareOn = (platform) => {
        const url = encodeURIComponent(getShareUrl());
        const text = encodeURIComponent(product?.title || 'Check out this product on Mingle Fashion');

        if (platform === 'tiktok' || platform === 'instagram') {
            const name = platform === 'tiktok' ? 'TikTok' : 'Instagram';
            navigator.clipboard.writeText(getShareUrl()).then(() => {
                toast.success(`Link copied! Open ${name} and paste it.`);
                setShowShareMenu(false);
            });
            return;
        }

        const links = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            whatsapp: `https://api.whatsapp.com/send?text=${text}%20${url}`,
        };
        window.open(links[platform], '_blank');
        setShowShareMenu(false);
    };

    useEffect(() => {
        const handler = (e) => {
            if (shareMenuRef.current && !shareMenuRef.current.contains(e.target)) {
                setShowShareMenu(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);
    const handleMouseEnter = () => setShowMagnifier(true);
    const handleMouseLeave = () => setShowMagnifier(false);

    const handlePreviewImageLoad = (e) => {
        setImgNaturalSize({ width: e.target.naturalWidth, height: e.target.naturalHeight });
    };

    // `object-contain` letterboxes the image inside the box whenever the aspect
    // ratios differ, so cursor math must use the actual rendered image rect,
    // not the container's — otherwise the zoom drifts from where the cursor is.
    const getRenderedImageRect = (boxWidth, boxHeight) => {
        const { width: naturalWidth, height: naturalHeight } = imgNaturalSize;
        if (!naturalWidth || !naturalHeight) {
            return { renderWidth: boxWidth, renderHeight: boxHeight, offsetX: 0, offsetY: 0 };
        }
        const boxRatio = boxWidth / boxHeight;
        const imageRatio = naturalWidth / naturalHeight;
        let renderWidth, renderHeight;
        if (imageRatio > boxRatio) {
            renderWidth = boxWidth;
            renderHeight = boxWidth / imageRatio;
        } else {
            renderHeight = boxHeight;
            renderWidth = boxHeight * imageRatio;
        }
        return {
            renderWidth,
            renderHeight,
            offsetX: (boxWidth - renderWidth) / 2,
            offsetY: (boxHeight - renderHeight) / 2,
        };
    };

    const handleMouseMove = (e) => {
        if (!imgBoxRef.current) return;
        const { left, top, width, height } = imgBoxRef.current.getBoundingClientRect();
        const rect = getRenderedImageRect(width, height);

        const xInImage = e.clientX - left - rect.offsetX;
        const yInImage = e.clientY - top - rect.offsetY;

        if (xInImage < 0 || yInImage < 0 || xInImage > rect.renderWidth || yInImage > rect.renderHeight) {
            setShowMagnifier(false);
            return;
        }

        setImgRect(rect);
        setLensPos({ x: xInImage, y: yInImage });
        setShowMagnifier(true);
    };

    useEffect(() => {
        if (initialProduct) {
            if (initialProduct.variants && initialProduct.variants.length > 0) {
                const colors = [...new Set(initialProduct.variants.map(v => v.color).filter(Boolean))];
                const sizes = [...new Set(initialProduct.variants.map(v => v.size).filter(Boolean))];
                setAvailableColors(colors);
                setAvailableSizes(sizes);
                if (colors.length > 0) setSelectedColor(colors[0]);
            }
            const price = initialProduct.variants?.[0]?.sellingPrice ?? initialProduct.price ?? 0;
            const totalStock = initialProduct.stock?.reduce((sum, s) => sum + (s.stockQty || 0), 0) ?? 0;
            trackEvent('view_item', {
                value: price,
                contentIds: [String(initialProduct.id)],
                contents: [{
                    id: initialProduct.id,
                    title: initialProduct.title,
                    price,
                    quantity: 1,
                    brand: initialProduct.brand,
                    category: initialProduct.productType,
                    stock: totalStock,
                }],
                numItems: 1,
            });
            return;
        }
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const resolvedParams = await params;
                const data = await getProductById(resolvedParams.id);
                setProduct(data);
                if (data.variants && data.variants.length > 0) {
                    const colors = [...new Set(data.variants.map(v => v.color).filter(Boolean))];
                    const sizes = [...new Set(data.variants.map(v => v.size).filter(Boolean))];
                    setAvailableColors(colors);
                    setAvailableSizes(sizes);
                    if (colors.length > 0) setSelectedColor(colors[0]);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load product details');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [params, initialProduct]);

    useEffect(() => {
        if (!product || !product.variants) return;
        const variant = product.variants.find(
            v => v.color === selectedColor && v.size === selectedSize
        );
        setSelectedVariant(variant || null);
        setQuantity(1);
    }, [selectedColor, selectedSize, product]);

    useEffect(() => {
        if (!product || !product.variants || !selectedColor) return;
        const sizesForColor = product.variants
            .filter(v => v.color === selectedColor)
            .map(v => v.size)
            .filter(Boolean);
        setAvailableSizes([...new Set(sizesForColor)]);
        if (selectedSize && !sizesForColor.includes(selectedSize)) {
            setSelectedSize('');
        }
    }, [selectedColor, selectedSize, product]);

    const getVariantStock = () => {
        if (!selectedVariant || !product || !product.stock) return 0;
        return product.stock
            .filter(s => s.variantId === selectedVariant.variantId)
            .reduce((sum, s) => sum + (s.stockQty || 0), 0);
    };

    const handleQuantityChange = (value) => {
        if (!product) return;
        const maxStock = getVariantStock();
        const newValue = quantity + value;
        if (newValue > 0 && newValue <= maxStock) setQuantity(newValue);
    };

    const handleAddToCart = () => {
        if (!product) return;
        if (!selectedSize) { toast.error('Please select a size'); return; }
        if (!selectedVariant) return;
        const stockQty = getVariantStock();
        if (stockQty === 0) { toast.error('Selected variant is out of stock'); return; }
        const price = selectedVariant.sellingPrice;
        addToCart({
            id: product.id,
            title: product.title,
            variantId: selectedVariant.variantId,
            brand: product.brand,
            vatType: selectedVariant?.vatType || "",
            vat: Number(selectedVariant?.vat || 0),
            sku: selectedVariant?.sku || null,
            barcode: selectedVariant?.barcode || null,
            price,
            image: product.imgs?.thumbnails[previewImg] || '/images/placeholder-product.png',
            color: selectedColor,
            size: selectedSize,
            quantity,
        }, true);
        trackEvent('add_to_cart', {
            value: price * quantity,
            contentIds: [String(product.id)],
            contents: [{
                id: product.id,
                title: product.title,
                price,
                quantity,
                brand: product.brand,
                category: product.productType,
                sku: selectedVariant?.sku,
                stock: stockQty,
            }],
            numItems: quantity,
        });
        toast.success('Added to cart!');
    };

    useEffect(() => {
        if (!product) return;
        let mounted = true;
        setIsWishlisted(isInWishlist(product.id));
        const unsubscribe = subscribeToWishlistChanges((id, inWishlist) => {
            if (mounted && id === product.id) setIsWishlisted(inWishlist);
        });
        return () => { mounted = false; unsubscribe(); };
    }, [product, isInWishlist, subscribeToWishlistChanges]);

    const handleItemToWishList = () => {
        if (!product) return;
        const totalStock = product.stock?.reduce((sum, s) => sum + (s.stockQty || 0), 0) || 0;
        if (totalStock === 0) { toast.error('The item is out of stock'); return; }
        if (isWishlisted) {
            removeFromWishlist(product.id);
            toast.success('Item removed from wishlist!');
        } else {
            addToWishlist({
                id: product.id,
                title: product.title,
                price: product.price,
                brand: product.brand,
                image: product.imgs?.thumbnails[previewImg] || '/images/placeholder-product.png',
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
            toast.success('Item added to wishlist!');
        }
    };

    const handleBuyNow = () => {
        if (!product) return;
        if (!selectedSize) { toast.error('Please select a size'); return; }
        if (!selectedVariant) return;
        const stockQty = getVariantStock();
        if (stockQty === 0) { toast.error('Selected variant is out of stock'); return; }
        setBuyNowItem({
            id: product.id,
            title: product.title,
            variantId: selectedVariant.variantId,
            price: selectedVariant.sellingPrice,
            brand: product.brand,
            vatType: selectedVariant?.vatType || "",
            vat: Number(selectedVariant?.vat || 0),
            sku: selectedVariant?.sku || null,
            barcode: selectedVariant?.barcode || null,
            image: product.imgs?.thumbnails[previewImg] || '/images/placeholder-product.png',
            color: selectedColor,
            size: selectedSize,
            quantity,
            checked: true,
        });
        router.push('/checkout');
    };

    const getTruncatedText = (text, wordLimit = 100) => {
        if (!text) return "";
        const words = text.split(" ");
        if (words.length <= wordLimit) return text;
        return words.slice(0, wordLimit).join(" ");
    };

    const getVariantVatInfo = () => {
        if (!selectedVariant) return { vatType: "", vat: 0 };
        return { vatType: selectedVariant.vatType || "", vat: Number(selectedVariant.vat || 0) };
    };

    const { vatType, vat } = getVariantVatInfo();
    const showVatExclusive = vatType?.toLowerCase() === "exclusive";

    if (loading) {
        return <MingleLoader />;
    }

    if (error || !product) {
        return (
            <div className="pt-[var(--header-height)] pb-16 text-center">
                <p className="text-red-600">{error || 'Product not found'}</p>
                <Link href="/shop" className="text-[#32BBAB]">Back to shop</Link>
            </div>
        );
    }

    const totalStock = product.stock?.reduce((sum, s) => sum + (s.stockQty || 0), 0) || 0;
    const variantStock = getVariantStock();
    const currentPrice = selectedVariant?.sellingPrice || product.price;
    const isVirtualTryEnabled = !loading && features?.enable_virtual_try === true;

    // Breadcrumb trail — Home / Gender / Category / Product, matching the men/women category pages
    const genderSlug = isMenCategory(product.category) ? 'men' : isWomenCategory(product.category) ? 'women' : null;
    const breadcrumbs = [
        { label: 'Home', href: '/' },
        ...(genderSlug ? [{ label: getGenderDisplayName(product.category), href: `/${genderSlug}` }] : []),
        ...(product.productType ? [{
            label: product.productType,
            href: genderSlug ? `/${genderSlug}/${encodeURIComponent(product.productType)}` : `/shop/${encodeURIComponent(product.productType)}`,
        }] : []),
        { label: product.Description || product.styleNo, href: null },
    ];

    const LENS_RADIUS = 100; // px, half the circle diameter
    const lensBox = (showMagnifier && imgRect.renderWidth > 0) ? { lensX: lensPos.x, lensY: lensPos.y } : null;

    return (
        <>
            <div className="pt-[152px] manrope pb-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-9">
                    <Breadcrumb items={breadcrumbs} className="mb-8" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="grid grid-cols-1 lg:grid-cols-13 gap-2 items-start">
                            <div className="thumb-scroll hidden lg:flex lg:col-span-3 flex-col gap-2 overflow-y-auto overflow-x-hidden pr-2"
                                style={{ height: "624px" }}>
                                <style jsx>{`
                                    div.thumb-scroll { scrollbar-width: thin; scrollbar-color: rgba(50,187,171,0.35) transparent; transition: scrollbar-color 0.2s ease; }
                                    div.thumb-scroll:hover { scrollbar-color: rgba(50,187,171,0.7) transparent; }
                                    div.thumb-scroll::-webkit-scrollbar { width: 6px; }
                                    div.thumb-scroll::-webkit-scrollbar-track { background: transparent; margin: 4px 0; }
                                    div.thumb-scroll::-webkit-scrollbar-thumb {
                                        background-color: rgba(50,187,171,0.35);
                                        border-radius: 999px;
                                        background-clip: padding-box;
                                        border: 1.5px solid transparent;
                                        transition: background-color 0.2s ease;
                                    }
                                    div.thumb-scroll:hover::-webkit-scrollbar-thumb { background-color: rgba(50,187,171,0.65); }
                                    div.thumb-scroll::-webkit-scrollbar-thumb:hover { background-color: #32BBAB; }
                                `}</style>
                                {product.imgs?.thumbnails?.map((item, key) => (
                                    <button key={key} onClick={() => setPreviewImg(key)}
                                        className={`relative w-full h-37.5 flex-none overflow-hidden border-2 transition-all duration-200
                                            ${key === previewImg ? 'border-black opacity-100 shadow-sm' : 'border-gray-200 hover:border-black opacity-65 hover:opacity-85'}`}>
                                        <Image src={item} alt={`Thumbnail ${key + 1}`} fill className="object-contain" sizes="220px" />
                                    </button>
                                ))}
                            </div>

                            <div className="lg:col-span-10">
                                <div className="relative mx-auto" style={{ width: "100%" }}>

                                    <div ref={imgBoxRef} className="relative w-full bg-white border border-gray-200 overflow-hidden mx-auto"
                                        style={{ height: "624px" }}
                                        onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onMouseMove={handleMouseMove}
                                        onClick={() => setShowLightbox(true)}>
                                        {product.imgs?.previews?.[previewImg] ? (
                                            <>
                                                <Image src={product.imgs.previews[previewImg]} alt={product.title} fill priority
                                                    className="object-contain" sizes="(max-width: 758px) 100vw, 60vw"
                                                    onLoad={handlePreviewImageLoad} />
                                                {lensBox && (
                                                    /* Circular magnifier lens — desktop & mobile */
                                                    <div
                                                        className="pointer-events-none absolute"
                                                        style={{
                                                            width: LENS_RADIUS * 2,
                                                            height: LENS_RADIUS * 2,
                                                            borderRadius: '50%',
                                                            left: imgRect.offsetX + lensBox.lensX - LENS_RADIUS,
                                                            top: imgRect.offsetY + lensBox.lensY - LENS_RADIUS,
                                                            backgroundImage: `url(${product.imgs.previews[previewImg]})`,
                                                            backgroundRepeat: 'no-repeat',
                                                            backgroundSize: `${imgRect.renderWidth * ZOOM_LEVEL}px ${imgRect.renderHeight * ZOOM_LEVEL}px`,
                                                            backgroundPosition: `-${lensPos.x * ZOOM_LEVEL - LENS_RADIUS}px -${lensPos.y * ZOOM_LEVEL - LENS_RADIUS}px`,
                                                            border: '3px solid rgba(255,255,255,0.95)',
                                                            boxShadow: '0 8px 32px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.10)',
                                                            zIndex: 30,
                                                        }}
                                                    />
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400">No image available</div>
                                        )}
                                        {product.status === "New" && (
                                            <div className="absolute top-4 left-4 bg-black/70 text-white text-xs px-3 py-1">NEW</div>
                                        )}
                                        <button onClick={(e) => { e.stopPropagation(); handleItemToWishList(); }}
                                            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition">
                                            {isWishlisted ? <FaHeart className="text-gray-900" /> : <FaRegHeart className="text-gray-600" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="thumb-scroll-mobile flex lg:hidden flex-nowrap gap-2 mt-6 overflow-x-auto overflow-y-hidden px-1 pb-2">
                                    <style jsx>{`
                                        div.thumb-scroll-mobile { scrollbar-width: thin; scrollbar-color: rgba(50,187,171,0.35) transparent; }
                                        div.thumb-scroll-mobile::-webkit-scrollbar { height: 6px; }
                                        div.thumb-scroll-mobile::-webkit-scrollbar-track { background: transparent; margin: 0 4px; }
                                        div.thumb-scroll-mobile::-webkit-scrollbar-thumb {
                                            background-color: rgba(50,187,171,0.45);
                                            border-radius: 999px;
                                            background-clip: padding-box;
                                            border: 1.5px solid transparent;
                                            transition: background-color 0.2s ease;
                                        }
                                        div.thumb-scroll-mobile::-webkit-scrollbar-thumb:hover { background-color: #32BBAB; }
                                    `}</style>
                                    {product.imgs?.thumbnails?.map((item, key) => (
                                        <button key={key} onClick={() => setPreviewImg(key)}
                                            className={`relative w-22.5 h-30 flex-none rounded-xs overflow-hidden border-2 transition-all duration-200
                                                ${key === previewImg ? 'border-black opacity-100 shadow-sm scale-[1.03]' : 'border-gray-200 hover:border-black opacity-70 hover:opacity-90'}`}>
                                            <Image src={item} alt={`Thumbnail ${key + 1}`} fill className="object-contain transition-transform duration-300" sizes="90px" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            {/* Title */}
                            <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-1">
                                {product.Description || product.styleNo}
                            </h1>

                            {/* Price */}
                            <p className="text-xl text-gray-800 mb-2">
                                {(() => {
                                    const isOutOfStock = selectedVariant ? variantStock === 0 : totalStock === 0;
                                    const displayPrice = isOutOfStock ? 0 : currentPrice;
                                    return (
                                        <>
                                            Tk {Number(displayPrice).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            {!isOutOfStock && showVatExclusive && <span className="text-sm text-gray-500 ml-1">+ VAT</span>}
                                        </>
                                    );
                                })()}
                            </p>

                            {/* Stock */}
                            {(selectedVariant ? variantStock === 0 : totalStock === 0) && (
                                <p className="text-sm text-red-500 mb-6">This item is currently unavailable</p>
                            )}

                            {/* Gender */}
                            {getGenderDisplayName(product.category) && (
                                <div className="mb-5 flex flex-col sm:flex-row sm:items-center gap-2">
                                    <p className="text-sm font-semibold text-gray-800 sm:w-16 shrink-0">Gender</p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-4 py-2 border-none text-sm bg-white text-gray-700 border-gray-300">
                                            {getGenderDisplayName(product.category)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Color picker */}
                            {availableColors.length > 0 && (
                                <div className="mb-5 flex flex-col sm:flex-row sm:items-center gap-2">
                                    <p className="text-sm font-semibold text-gray-800 sm:w-16 shrink-0">Color</p>
                                    <div className="flex flex-wrap gap-2">
                                        {availableColors.map((color, i) => (
                                            <button key={i}
                                                onClick={() => {
                                                    setSelectedColor(color);
                                                    trackEvent('customize_product', {
                                                        contentIds: [String(product.id)],
                                                        contents: [{
                                                            id: product.id,
                                                            title: product.title,
                                                            price: product.price,
                                                            quantity: 1,
                                                            brand: product.brand,
                                                            category: product.productType,
                                                            stock: variantStock,
                                                        }],
                                                    });
                                                }}
                                                className={`px-4 py-2 border text-sm transition ${selectedColor === color ? 'bg-[#32BBAB] text-white border-[#32BBAB]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#32BBAB]'}`}>
                                                {color}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity + Size row */}
                            <div className="flex gap-4 mb-6">
                                <div>
                                    <p className="text-sm font-semibold text-gray-800 mb-2">Quantity</p>
                                    <div className={`flex items-center border border-gray-300 ${variantStock === 0 ? 'opacity-50' : ''}`}>
                                        <button onClick={() => handleQuantityChange(-1)} disabled={variantStock === 0}
                                            className="px-4 py-2.5 text-gray-600 hover:bg-[#32BBAB]/10 hover:text-[#32BBAB] disabled:text-gray-400 text-lg leading-none transition">
                                            −
                                        </button>
                                        <span className="px-5 py-2.5 text-gray-900 min-w-[40px] text-center text-sm">{quantity}</span>
                                        <button onClick={() => handleQuantityChange(1)} disabled={variantStock === 0}
                                            className="px-4 py-2.5 text-gray-600 hover:bg-[#32BBAB]/10 hover:text-[#32BBAB] text-lg leading-none transition">
                                            +
                                        </button>
                                    </div>
                                </div>

                                {availableSizes.length > 0 && (
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-800 mb-2">Size</p>
                                        <div className="relative">
                                            <select
                                                value={selectedSize}
                                                onChange={(e) => {
                                                    setSelectedSize(e.target.value);
                                                    trackEvent('customize_product', {
                                                        contentIds: [String(product.id)],
                                                        contents: [{
                                                            id: product.id,
                                                            title: product.title,
                                                            price: product.price,
                                                            quantity: 1,
                                                            brand: product.brand,
                                                            category: product.productType,
                                                            stock: variantStock,
                                                        }],
                                                    });
                                                }}
                                                className="w-full border border-gray-300 px-3 py-2.5 text-sm text-gray-600 appearance-none bg-white focus:outline-none focus:border-[#32BBAB] cursor-pointer"
                                            >
                                                <option value="">Choose an Option...</option>
                                                {availableSizes.map((size, i) => (
                                                    <option key={i} value={size}>{size}</option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Info rows */}
                            <div className="border-t border-gray-200 mb-6">
                                {product.styleNo && (
                                    <div className="flex items-center justify-between py-3.5 border-b border-gray-200">
                                        <span className="text-sm font-semibold text-gray-700">Product Style</span>
                                        <button
                                            type="button"
                                            onClick={handleCopyStyleNo}
                                            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#32BBAB] transition"
                                            title="Copy style number"
                                        >
                                            {product.styleNo}
                                            {styleCopied ? (
                                                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <FiCopy className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    </div>
                                )}
                                {product.sizeChartUrl && (
                                    <button onClick={() => setShowSizeChartModal(true)}
                                        className="w-full flex items-center justify-between py-3.5 border-b border-gray-200 hover:text-[#32BBAB] text-left transition group">
                                        <span className="text-sm font-semibold text-gray-700 group-hover:text-[#32BBAB] transition">Size Chart</span>
                                        <FiChevronRight className="text-gray-400 group-hover:text-[#32BBAB] transition" />
                                    </button>
                                )}
                                {/* <button onClick={() => setShowDetailsModal(true)}
                                    className="w-full flex items-center justify-between py-3.5 border-b border-gray-200 hover:text-[#32BBAB] text-left transition group">
                                    <span className="text-sm font-semibold text-gray-700 group-hover:text-[#32BBAB] transition">Additional Details</span>
                                    <FiChevronRight className="text-gray-400 group-hover:text-[#32BBAB] transition" />
                                </button> */}
                                <button onClick={() => setShowDescModal(true)}
                                    className="w-full flex items-center justify-between py-3.5 border-b border-gray-200 hover:text-[#32BBAB] text-left transition group">
                                    <span className="text-sm font-semibold text-gray-700 group-hover:text-[#32BBAB] transition">Product Description</span>
                                    <FiChevronRight className="text-gray-400 group-hover:text-[#32BBAB] transition" />
                                </button>
                                <button onClick={() => setShowReviewsModal(true)}
                                    className="w-full flex items-center justify-between py-3.5 border-b border-gray-200 hover:text-[#32BBAB] text-left transition group">
                                    <span className="text-sm font-semibold text-gray-700 group-hover:text-[#32BBAB] transition">Reviews</span>
                                    <FiChevronRight className="text-gray-400 group-hover:text-[#32BBAB] transition" />
                                </button>
                                <button onClick={() => setShowStoreModal(true)}
                                    className="w-full flex items-center justify-between py-3.5 border-b border-gray-200 hover:text-[#32BBAB] text-left transition group">
                                    <span className="text-sm font-semibold text-gray-700 group-hover:text-[#32BBAB] transition">Store Location</span>
                                    <FiChevronRight className="text-gray-400 group-hover:text-[#32BBAB] transition" />
                                </button>
                            </div>

                            {/* ADD TO CART + BUY NOW + icons */}
                            <div className="flex items-stretch gap-2">
                                <button onClick={handleAddToCart} disabled={variantStock === 0 && !!selectedVariant}
                                    className={`flex-1 py-4 text-sm font-bold tracking-widest transition ${!selectedVariant || variantStock === 0 ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-[#32BBAB] text-white hover:bg-[#279487]'}`}>
                                    {!selectedVariant ? 'SELECT OPTIONS' : variantStock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
                                </button>
                                <button onClick={handleBuyNow} disabled={variantStock === 0 && !!selectedVariant}
                                    className={`flex-1 py-4 text-sm font-bold tracking-widest transition ${!selectedVariant || variantStock === 0 ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                                    BUY NOW
                                </button>
                                <button onClick={handleItemToWishList}
                                    className="border border-gray-300 px-4 hover:border-[#32BBAB] hover:text-[#32BBAB] transition flex items-center justify-center">
                                    {isWishlisted ? <FaHeart className="text-[#32BBAB]" /> : <FaRegHeart className="text-gray-600" />}
                                </button>
                                <button onClick={handleShare}
                                    className="border border-gray-300 px-4 hover:border-[#32BBAB] hover:text-[#32BBAB] transition flex items-center justify-center">
                                    <FiShare2 className="text-gray-600" />
                                </button>
                            </div>

                            {/* Virtual Try-On */}
                            {!loading && isVirtualTryEnabled && (
                                <div className="mt-3">
                                    <button onClick={() => {
                                        trackEvent('start_trial', {
                                            contentIds: [String(product.id)],
                                            contents: [{
                                                id: product.id,
                                                title: product.title,
                                                price: product.price,
                                                quantity: 1,
                                                brand: product.brand,
                                                category: product.productType,
                                                stock: variantStock,
                                            }],
                                        });
                                        router.push(`/vto/${product.id}`);
                                    }}
                                        className="w-full flex items-center justify-center gap-2 py-3 px-6 font-bold text-[#32BBAB] border-2 border-[#32BBAB] hover:bg-[#32BBAB] hover:text-white transition-all duration-300 group">
                                        <HiSparkles className="w-5 h-5 group-hover:animate-pulse" />
                                        Virtual Try-On
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* <div className="bg-black/85 manrope">
                <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="space-y-6">
                            // Shipping & Returns
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                <h3 className="text-base font-semibold text-white mb-5 uppercase tracking-widest">Shipping &amp; Returns</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="flex gap-4">
                                        <div className="shrink-0 w-10 h-10 rounded-full bg-[#32BBAB]/15 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-[#32BBAB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 3H8l-2 4h12l-2-4z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-200 mb-1">Delivery Options</h4>
                                            <p className="text-sm text-gray-400">Standard: 7–10 business days</p>
                                            <p className="text-sm text-gray-400">Express: 3–5 business days</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="shrink-0 w-10 h-10 rounded-full bg-[#32BBAB]/15 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-[#32BBAB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 15l-4 4-4-4M12 4v15" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-200 mb-1">Return Policy</h4>
                                            <p className="text-sm text-gray-400">Easy 10-day returns. Item must be unworn with tags attached.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            // Quality Assurance
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                <h3 className="text-base font-semibold text-white mb-5 uppercase tracking-widest">Quality Assurance</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                    {[
                                        {
                                            title: 'Premium Materials',
                                            desc: 'Only the finest fabrics selected for durability and comfort.',
                                            icon: <path strokeLinecap="round" strokeLinejoin="round" d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5zm7 4v8m-4-4h8" />,
                                        },
                                        {
                                            title: 'Ethical Production',
                                            desc: 'Responsibly manufactured in certified facilities.',
                                            icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9zm0 5v4l3 3" />,
                                        },
                                        {
                                            title: 'Quality Guarantee',
                                            desc: 'We stand behind the quality of all our products.',
                                            icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />,
                                        },
                                    ].map(({ title, desc, icon }) => (
                                        <div key={title} className="flex gap-4">
                                            <div className="shrink-0 w-10 h-10 rounded-full bg-[#32BBAB]/15 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-[#32BBAB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                    {icon}
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-200 mb-1">{title}</h4>
                                                <p className="text-sm text-gray-400">{desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                    </div>
                </div>
            </div> */}

            <div className="pt-16 pb-16 bg-white">
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


            {/* Product Description — right drawer (desktop) / bottom sheet (mobile) */}
            <AnimatePresence>
                {showDescModal && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDescModal(false)}
                            className="fixed inset-0 z-50 bg-black/50"
                        />

                        {/* Mobile: bottom sheet */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col"
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                                <h2 className="text-base font-semibold text-gray-900">Product Description</h2>
                                <button onClick={() => setShowDescModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
                            </div>
                            <div className="overflow-y-auto p-6 space-y-6">
                                <DescDrawerBody product={product} initialSpecs={initialSpecs} />
                            </div>
                        </motion.div>

                        {/* Desktop: right-side drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="hidden sm:flex fixed top-0 right-0 h-full z-50 bg-white shadow-2xl w-[420px] flex-col"
                        >
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                                <h2 className="text-base font-semibold text-gray-900">Product Description</h2>
                                <button onClick={() => setShowDescModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
                            </div>
                            <div className="overflow-y-auto p-6 space-y-6 flex-1">
                                <DescDrawerBody product={product} initialSpecs={initialSpecs} />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Size Chart drawer */}
            <AnimatePresence>
                {showSizeChartModal && product.sizeChartUrl && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSizeChartModal(false)}
                            className="fixed inset-0 z-50 bg-black/50"
                        />

                        {/* Mobile: bottom sheet */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col"
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                                <h2 className="text-base font-semibold text-gray-900">Size Chart</h2>
                                <button onClick={() => setShowSizeChartModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
                            </div>
                            <div className="overflow-y-auto p-6">
                                <div className="relative w-full" style={{ minHeight: '300px' }}>
                                    <Image
                                        src={product.sizeChartUrl}
                                        alt="Size chart"
                                        width={800}
                                        height={1000}
                                        className="w-full h-auto object-contain"
                                        unoptimized
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Desktop: right-side drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="hidden sm:flex fixed top-0 right-0 h-full z-50 bg-white shadow-2xl w-[420px] flex-col"
                        >
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                                <h2 className="text-base font-semibold text-gray-900">Size Chart</h2>
                                <button onClick={() => setShowSizeChartModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
                            </div>
                            <div className="overflow-y-auto p-6 flex-1">
                                <div className="relative w-full" style={{ minHeight: '300px' }}>
                                    <Image
                                        src={product.sizeChartUrl}
                                        alt="Size chart"
                                        width={800}
                                        height={1000}
                                        className="w-full h-auto object-contain"
                                        unoptimized
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Product Details drawer */}
            <AnimatePresence>
                {showDetailsModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDetailsModal(false)}
                            className="fixed inset-0 z-50 bg-black/50"
                        />

                        {/* Mobile: bottom sheet */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col"
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                                <h2 className="text-base font-semibold text-gray-900">Product Details</h2>
                                <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
                            </div>
                            <div className="overflow-y-auto p-6">
                                <DetailsDrawerBody product={product} selectedVariant={selectedVariant} />
                            </div>
                        </motion.div>

                        {/* Desktop: right-side drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="hidden sm:flex fixed top-0 right-0 h-full z-50 bg-white shadow-2xl w-[420px] flex-col"
                        >
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                                <h2 className="text-base font-semibold text-gray-900">Product Details</h2>
                                <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
                            </div>
                            <div className="overflow-y-auto p-6 flex-1">
                                <DetailsDrawerBody product={product} selectedVariant={selectedVariant} />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Reviews drawer */}
            <AnimatePresence>
                {showReviewsModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowReviewsModal(false)}
                            className="fixed inset-0 z-50 bg-black/50"
                        />

                        {/* Mobile: bottom sheet */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col"
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                                <h2 className="text-base font-semibold text-gray-900">Reviews</h2>
                                <button onClick={() => setShowReviewsModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
                            </div>
                            <div className="overflow-y-auto p-6 flex-1">
                                <ReviewsDrawerBody />
                            </div>
                        </motion.div>

                        {/* Desktop: right-side drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="hidden sm:flex fixed top-0 right-0 h-full z-50 bg-white shadow-2xl w-[420px] flex-col"
                        >
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                                <h2 className="text-base font-semibold text-gray-900">Reviews</h2>
                                <button onClick={() => setShowReviewsModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
                            </div>
                            <div className="overflow-y-auto p-6 flex-1">
                                <ReviewsDrawerBody />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Store Location drawer */}
            <AnimatePresence>
                {showStoreModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowStoreModal(false)}
                            className="fixed inset-0 z-50 bg-black/60"
                        />

                        {/* Mobile: bottom sheet */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col"
                        >
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                                <div className="flex items-center gap-2">
                                    <FiMapPin className="text-[#32BBAB]" size={16} />
                                    <h2 className="text-sm font-semibold text-gray-900">Store Location</h2>
                                </div>
                                <button onClick={() => setShowStoreModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
                            </div>
                            <div className="overflow-y-auto flex-1">
                                <StoreDrawerBody />
                            </div>
                        </motion.div>

                        {/* Desktop: right-side drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="hidden sm:flex fixed top-0 right-0 h-full z-50 bg-white shadow-2xl w-[420px] flex-col"
                        >
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                                <div className="flex items-center gap-2">
                                    <FiMapPin className="text-[#32BBAB]" size={16} />
                                    <h2 className="text-sm font-semibold text-gray-900">Store Location</h2>
                                </div>
                                <button onClick={() => setShowStoreModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
                            </div>
                            <div className="overflow-y-auto flex-1">
                                <StoreDrawerBody />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Full-screen image lightbox */}
            <ProductLightbox
                images={product.imgs?.previews || []}
                altTexts={product.imgs?.altTexts || []}
                title={product.title}
                index={previewImg}
                onIndexChange={setPreviewImg}
                open={showLightbox}
                onClose={() => setShowLightbox(false)}
            />

            {/* Share Modal */}
            {showShareMenu && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowShareMenu(false)} />
                    <div ref={shareMenuRef} className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                        <button onClick={() => setShowShareMenu(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                            <FiX size={20} />
                        </button>

                        <p className="text-sm font-semibold text-gray-700 mb-2">Copy Link</p>
                        <div className="flex items-center gap-2 mb-5">
                            <input
                                readOnly
                                value={getShareUrl()}
                                className="flex-1 text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 outline-none truncate"
                            />
                            <button
                                onClick={handleCopyLink}
                                className="bg-gray-900 hover:bg-gray-700 text-white p-2.5 rounded-lg transition"
                            >
                                <FiCopy size={18} />
                            </button>
                        </div>

                        <p className="text-sm font-semibold text-gray-700 mb-3">Share</p>
                        <div className="flex items-center gap-5">
                            <button onClick={() => shareOn('facebook')} title="Share on Facebook" className="text-gray-700 hover:text-blue-600 transition">
                                <FaFacebook size={28} />
                            </button>
                            <button onClick={() => shareOn('tiktok')} title="Share on TikTok" className="text-gray-700 hover:text-black transition">
                                <FaTiktok size={26} />
                            </button>
                            <button onClick={() => shareOn('instagram')} title="Share on Instagram" className="text-gray-700 hover:text-pink-500 transition">
                                <FaInstagram size={28} />
                            </button>
                            <button onClick={() => shareOn('whatsapp')} title="Share on WhatsApp" className="text-gray-700 hover:text-green-500 transition">
                                <FaWhatsapp size={28} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function StoreDrawerBody() {
    const now = new Date();
    const day = now.getDay(); // 0=Sun,1=Mon,...,3=Wed,...,6=Sat
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentMins = hour * 60 + minute;
    const openMins = 10 * 60;
    const closeMins = 22 * 60;
    const isWednesday = day === 3;
    const isOpen = !isWednesday && currentMins >= openMins && currentMins < closeMins;

    return (
        <div className="flex flex-col">
            {/* Branch header */}
            <div className="relative bg-gradient-to-br from-[#0f2a2a] via-[#1a3d3d] to-[#0d2020] px-6 py-5">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #32BBAB 0%, transparent 50%), radial-gradient(circle at 80% 20%, #32BBAB 0%, transparent 50%)' }} />
                <div className="relative flex items-center justify-between">
                    <div>
                        <p className="text-[#32BBAB] text-[10px] font-semibold tracking-widest uppercase mb-0.5">Mingle Fashion</p>
                        <h3 className="text-white text-base font-semibold">Uttara Branch — Dhaka</h3>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${isOpen ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                        {isOpen ? 'Open Now' : 'Closed'}
                    </div>
                </div>
            </div>

            {/* Info rows */}
            <div className="px-6 py-5 space-y-5">
                <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-[#32BBAB]/10 flex items-center justify-center shrink-0">
                        <FiMapPin className="text-[#32BBAB]" size={15} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Address</p>
                        <p className="text-sm font-medium text-gray-800">ROAD-33, SECTOR-3, BALY COMPLEX</p>
                        <p className="text-sm text-gray-500">Ajampur, Uttara, Dhaka-1230</p>
                        <p className="text-sm text-gray-500">Bangladesh</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-[#32BBAB]/10 flex items-center justify-center shrink-0">
                        <FiPhone className="text-[#32BBAB]" size={15} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Phone</p>
                        <a href="tel:+8801302815322" className="text-sm font-medium text-gray-800 hover:text-[#32BBAB] transition-colors">
                            +880 1302-815322
                        </a>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-[#32BBAB]/10 flex items-center justify-center shrink-0">
                        <FiMail className="text-[#32BBAB]" size={15} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Email</p>
                        <a href="mailto:info@minglefashionbd.com" className="text-sm font-medium text-gray-800 hover:text-[#32BBAB] transition-colors">
                            info@minglefashionbd.com
                        </a>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-[#32BBAB]/10 flex items-center justify-center shrink-0">
                        <FiClock className="text-[#32BBAB]" size={15} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Store Hours</p>
                        <p className="text-sm font-medium text-gray-800">Thu – Tue: 10:00 AM – 10:00 PM</p>
                        <p className="text-xs text-red-400 mt-0.5">Closed on Wednesdays</p>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="px-6 pb-8 flex gap-3">
                <a
                    href="https://www.google.com/maps/dir/?api=1&destination=23.8657703,90.3997771"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#32BBAB] text-white text-sm font-semibold hover:bg-[#279487] transition-colors"
                >
                    <FiNavigation size={14} />
                    Get Directions
                </a>
                <a
                    href="tel:+8801302815322"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors"
                >
                    <FiPhone size={14} />
                    Call Now
                </a>
            </div>
        </div>
    );
}

function DescDrawerBody({ product, initialSpecs }) {
    return (
        <>
            {product.AdditionalDescription && (
                <div
                    className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.AdditionalDescription }}
                />
            )}
            <div>
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-3">Specifications</h3>
                {initialSpecs.length > 0 ? (
                    <table className="w-full text-sm">
                        <tbody className="divide-y divide-gray-100">
                            {initialSpecs.map((spec, i) => (
                                <tr key={spec.Id ?? i}>
                                    <td className="py-2.5 pr-6 font-medium text-gray-500 w-2/5">{spec.Header}</td>
                                    <td className="py-2.5 text-gray-800">{spec.Details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-sm text-gray-400">No specification yet.</p>
                )}
            </div>
        </>
    );
}

function ReviewsDrawerBody() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-[#32BBAB]/10 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-[#32BBAB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">No reviews yet</p>
            {/* <p className="text-sm text-gray-400">You cannot Review This Product</p> */}
        </div>
    );
}

function DetailsDrawerBody({ product, selectedVariant }) {
    const rows = [
        { label: 'Brand', value: product?.brand },
        { label: 'Category', value: product?.type },
        { label: 'Variant SKU', value: selectedVariant?.sku },
        { label: 'Barcode', value: selectedVariant?.barcode },
    ].filter(r => r.value);

    return (
        <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
                {rows.length > 0 ? rows.map(({ label, value }) => (
                    <tr key={label}>
                        <td className="py-3 pr-6 font-medium text-gray-500 w-2/5">{label}</td>
                        <td className="py-3 text-gray-800">{value}</td>
                    </tr>
                )) : (
                    <tr>
                        <td className="py-3 text-gray-400" colSpan={2}>No details available.</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}
