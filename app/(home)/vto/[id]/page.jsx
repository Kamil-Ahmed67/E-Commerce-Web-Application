'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
    FiArrowLeft,
    FiUpload,
    FiCamera,
    FiRefreshCw,
    FiDownload,
    FiMaximize2,
    FiMinimize2,
    FiX,
    FiShoppingCart,
    FiMinus,
    FiPlus,
} from 'react-icons/fi';
import { IoBagCheckOutline } from 'react-icons/io5';
import { HiSparkles } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductById } from '@/lib/server/getProductById';
import { useCart } from '@/provider/CartProvider';
import toast from 'react-hot-toast';

const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

export default function VirtualFittingRoom() {
    const params = useParams();
    const router = useRouter();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null); // object or null
    const [availableColors, setAvailableColors] = useState([]);
    const [availableSizes, setAvailableSizes] = useState([]);
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('upload');
    const [cameraActive, setCameraActive] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isGarmentExpanded, setIsGarmentExpanded] = useState(false);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const streamRef = useRef(null);

    // Fetch product
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await getProductById(params.id);
                if (data) {
                    setProduct(data);

                    if (data.variants?.length > 0) {
                        const colors = [...new Set(data.variants.map(v => v.color).filter(Boolean))];
                        const sizes = [...new Set(data.variants.map(v => v.size).filter(Boolean))];
                        setAvailableColors(colors);
                        setAvailableSizes(sizes);

                        if (colors.length) setSelectedColor(colors[0]);
                        if (sizes.length) setSelectedSize(sizes[0]);
                    }
                } else {
                    toast.error('Product not found');
                    router.push('/shop');
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load product');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [params.id, router]);

    // Update selected variant object
    useEffect(() => {
        if (!product?.variants) return;

        const variant = product.variants.find(
            v => v.color === selectedColor && v.size === selectedSize
        );

        setSelectedVariant(variant || null);
        setQuantity(1);
    }, [selectedColor, selectedSize, product]);

    const getVariantStock = () => {
        if (!selectedVariant || !product?.stock) return 0;
        return product.stock
            .filter(s => s.variantId === selectedVariant.variantId)
            .reduce((sum, s) => sum + (s.stockQty || 0), 0);
    };

    const variantStock = getVariantStock();
    const isOutOfStock = variantStock === 0;

    const currentPrice = selectedVariant?.sellingPrice || product?.price || 0;

    const handleQuantityChange = (delta) => {
        const newQty = quantity + delta;
        if (newQty >= 1 && newQty <= variantStock) {
            setQuantity(newQty);
        }
    };

    const handleAddToCart = () => {
        if (!product || !selectedVariant) {
            toast.error('Please select color and size');
            return;
        }
        if (isOutOfStock) {
            toast.error('Selected variant is out of stock');
            return;
        }

        addToCart(
            {
                id: product.id,
                title: product.title,
                variantId: selectedVariant.variantId,
                brand: product.brand,
                vatType: selectedVariant?.vatType || '',
                vat: Number(selectedVariant?.vat || 0),
                sku: selectedVariant?.sku || null,
                barcode: selectedVariant?.barcode || null,
                price: selectedVariant.sellingPrice,
                image: product.imgs?.thumbnails?.[0] || '/images/placeholder-product.png',
                color: selectedColor,
                size: selectedSize,
                quantity,
            },
            true
        );

        toast.success('Added to cart!');
    };

    const handleBuyNow = () => {
        handleAddToCart();
        router.push('/checkout');
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size exceeds 5MB');
            return;
        }
        const dataUrl = await fileToBase64(file);
        const [header, base64] = dataUrl.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || file.type;
        setSelectedImage({ dataUrl, mimeType, base64 });
        setProcessedImage(null);
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            streamRef.current = stream;
            setCameraActive(true);
        } catch {
            toast.error('Camera access denied');
        }
    };

    const stopCamera = () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        setCameraActive(false);
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        const base64 = dataUrl.split(',')[1];
        setSelectedImage({ dataUrl, mimeType: 'image/jpeg', base64 });
        setProcessedImage(null);
        stopCamera();
        setActiveTab('upload');
    };

    const handleTryOn = async () => {
        if (!selectedImage || processing) return;
        setProcessing(true);
        try {
            // Use first preview/thumbnail as fallback — adjust if needed
            const productImgUrl =
                product.imgs?.previews?.[0] ||
                product.imgs?.thumbnails?.[0] ||
                '/images/placeholder-product.png';

            const apiResponse = await fetch('/api/vertex-vto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ personImage: selectedImage.dataUrl, clothingImageUrl: productImgUrl }),
            });
            const response = await apiResponse.json();

            if (response.success && response.result) {
                setProcessedImage(response.result);
                toast.success('Your look is ready!');
            } else {
                throw new Error(response.error || 'Failed to generate image');
            }
        } catch (err) {
            console.error('VTO Error:', err);
            toast.error(err.message || 'Failed to generate try-on');
        } finally {
            setProcessing(false);
        }
    };

    useEffect(() => {
        return () => {
            if (streamRef.current) stopCamera();
        };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600" />
            </div>
        );
    }

    if (!product) return null;

    const effectivePrice = product.discountedPrice && product.discountedPrice < product.price
        ? product.discountedPrice
        : product.price;

    // Helper to get safe image URL
    const getPreviewImage = () => {
        if (!selectedVariant) return null;
        return (
            product.imgs?.previews?.[selectedVariant] ||
            product.imgs?.thumbnails?.[selectedVariant] ||
            product.imgs?.previews?.[0] ||
            product.imgs?.thumbnails?.[0] ||
            '/images/placeholder-product.png'
        );
    };

    const previewSrc = getPreviewImage();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <style>{`
                @keyframes teal-shift {
                    0%   { background-position: 0% 50%; }
                    50%  { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>

            {/* ── Top Nav Bar ── */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm shrink-0" style={{ paddingTop: '130px' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <Link
                        href={`/shop-details/${product.id}`}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-[#32BBAB] transition-colors font-outfit text-sm font-medium"
                    >
                        <FiArrowLeft className="w-4 h-4" />
                        Back to Shop
                    </Link>
                </div>
            </div>

            {/* ── Main 3-Column Grid ── */}
            <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

                    {/* ═══════════════════════════════════════
                        COLUMN 1 — GARMENT
                    ═══════════════════════════════════════ */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">

                        {/* Card Header */}
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 shrink-0">
                            <span className="w-5 h-5 rounded-full bg-[#32BBAB] text-white text-[10px] font-black flex items-center justify-center">1</span>
                            <span className="text-xs font-black text-gray-700 uppercase tracking-widest font-outfit">Garment</span>
                        </div>

                        {/* Product Image */}
                        <div className="relative bg-gray-50 shrink-0 group" style={{ height: '220px' }}>
                            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-50" />
                            {previewSrc ? (
                                <Image
                                    src={previewSrc}
                                    alt={product.title || 'Product image'}
                                    fill
                                    className="object-contain p-6"
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                    No image available
                                </div>
                            )}
                            <button
                                onClick={() => setIsGarmentExpanded(true)}
                                className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center border border-gray-200 shadow-sm text-gray-500 hover:text-[#32BBAB] transition-all opacity-0 group-hover:opacity-100 z-10"
                            >
                                <FiMaximize2 className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Product Info + Controls */}
                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 font-outfit line-clamp-2">{product.title}</h3>
                                <p className="text-[#32BBAB] font-black text-base font-outfit mt-1">৳{effectivePrice.toFixed(2)}</p>
                            </div>

                            {/* Color Selection */}
                            {availableColors.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 font-outfit">Color</p>
                                    <div className="flex flex-wrap gap-2">
                                        {availableColors.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={`h-8 px-3 rounded-lg text-xs font-bold transition-all border font-outfit
                                             ${selectedColor === color ? 'border-[#32BBAB] bg-[#32BBAB] text-white' : 'border-gray-200 text-gray-600 hover:border-[#32BBAB]/50'}`}
                                            >
                                                {color}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Variant Selector */}
                            {product.imgs?.thumbnails?.length > 1 && (
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 font-outfit">Variant</p>
                                    <div className="flex flex-wrap gap-2">
                                        {product.imgs.thumbnails.map((img, idx) => (
                                            <button key={idx} onClick={() => { setSelectedVariant(idx); setProcessedImage(null); }}
                                                className={`w-10 h-10 rounded-lg border-2 overflow-hidden transition-all
                                                    ${selectedVariant === idx ? 'border-[#32BBAB] shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
                                                <Image src={img} alt={`Variant ${idx + 1}`} width={40} height={40} className="object-cover w-full h-full" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Size Selection */}
                            {availableSizes.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 font-outfit">Size</p>
                                    <div className="flex flex-wrap gap-2">
                                        {availableSizes.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`h-8 px-3 rounded-lg text-xs font-bold transition-all border font-outfit
                                                ${selectedSize === size ? 'border-[#32BBAB] bg-[#32BBAB] text-white' : 'border-gray-200 text-gray-600 hover:border-[#32BBAB]/50'}`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Stock warning */}
                            {selectedVariant && (
                                <div className="text-xs">
                                    {isOutOfStock ? (
                                        <span className="text-red-600 font-medium">Out of stock</span>
                                    ) : (
                                        <span className="text-green-600">In stock ({variantStock} available)</span>
                                    )}
                                </div>
                            )}
                            {/* Quantity */}
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 font-outfit">Qty</p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= 1 || isOutOfStock}
                                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-[#32BBAB] transition-colors disabled:opacity-40"
                                    >
                                        <FiMinus className="w-3 h-3" />
                                    </button>
                                    <span className="w-8 text-center text-sm font-bold font-outfit">{quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange(1)}
                                        disabled={quantity >= variantStock || isOutOfStock}
                                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-[#32BBAB] transition-colors disabled:opacity-40"
                                    >
                                        <FiPlus className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Card Footer */}
                        <div className="p-3 border-t border-gray-100 flex gap-2 shrink-0">
                            <button
                                onClick={handleAddToCart}
                                disabled={!selectedVariant || isOutOfStock}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-all font-outfit
                                ${!selectedVariant || isOutOfStock
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'bg-[#32BBAB] hover:bg-[#1e9c8a] text-white shadow-md'}`}
                            >
                                <FiShoppingCart className="w-3.5 h-3.5" />
                                Add to Cart
                            </button>
                            <button
                                onClick={handleBuyNow}
                                disabled={!selectedVariant || isOutOfStock}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-all font-outfit
                  ${!selectedVariant || isOutOfStock
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'bg-gray-900 hover:bg-black text-white shadow-md'}`}
                            >
                                <IoBagCheckOutline className="w-3.5 h-3.5" />
                                Buy Now
                            </button>
                        </div>
                    </div>

                    {/* ═══════════════════════════════════════
                        COLUMN 2 — PORTRAIT
                    ═══════════════════════════════════════ */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden sticky top-47.5" style={{ height: 'calc(100vh - 210px)' }}>

                        {/* Card Header */}
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-full text-white text-[10px] font-black flex items-center justify-center transition-colors ${selectedImage ? 'bg-[#32BBAB]' : 'bg-gray-300'}`}>2</span>
                                <span className="text-xs font-black text-gray-700 uppercase tracking-widest font-outfit">Your Portrait</span>
                            </div>
                            {/* Upload / Camera Toggle */}
                            <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
                                <button onClick={() => { setActiveTab('upload'); stopCamera(); }}
                                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all font-outfit
                                        ${activeTab === 'upload' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                                    Upload
                                </button>
                                <button onClick={() => { setActiveTab('camera'); startCamera(); }}
                                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all font-outfit
                                        ${activeTab === 'camera' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                                    Camera
                                </button>
                            </div>
                        </div>

                        {/* Portrait Area — fills remaining space */}
                        <div className="relative bg-gray-50 flex-1 min-h-0">
                            {selectedImage ? (
                                <>
                                    <Image src={selectedImage.dataUrl} alt="Your portrait" fill className="object-contain p-3" />
                                    <button onClick={() => { setSelectedImage(null); setProcessedImage(null); }}
                                        className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm text-gray-500 rounded-lg flex items-center justify-center border border-gray-200 shadow-sm hover:text-red-500 transition-colors z-10">
                                        <FiX className="w-4 h-4" />
                                    </button>
                                </>
                            ) : activeTab === 'camera' && cameraActive ? (
                                <div className="w-full h-full bg-gray-900">
                                    <video
                                        ref={(el) => {
                                            videoRef.current = el;
                                            if (el && streamRef.current) {
                                                el.srcObject = streamRef.current;
                                                el.play().catch(() => { });
                                            }
                                        }}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-[#32BBAB]/5 transition-all p-8 text-center">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-gray-200">
                                        <FiUpload className="w-7 h-7 text-[#32BBAB]" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-700 font-outfit">Upload Your Photo</p>
                                    <p className="text-xs text-gray-400 mt-1 font-outfit">JPG, PNG up to 5MB</p>
                                    <p className="text-[10px] text-gray-300 mt-3 font-outfit">Neutral background works best</p>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                                </div>
                            )}
                        </div>
                        <canvas ref={canvasRef} className="hidden" />

                        {/* Card Footer — CAPTURE or GENERATE BUTTON */}
                        <div className="p-3 border-t border-gray-100 shrink-0">
                            {activeTab === 'camera' && cameraActive ? (
                                <button
                                    onClick={capturePhoto}
                                    className="w-full py-3.5 rounded-xl font-bold text-sm uppercase flex items-center justify-center gap-3 transition-all font-outfit bg-[#32BBAB] hover:bg-[#2a9d8f] text-white shadow-lg active:scale-95"
                                >
                                    <FiCamera className="w-5 h-5" />
                                    Capture Photo
                                </button>
                            ) : (
                                <button
                                    onClick={handleTryOn}
                                    disabled={!selectedImage || processing}
                                    className={`w-full py-3.5 rounded-xl font-bold text-sm uppercase flex items-center justify-center gap-2 transition-all font-outfit
                                        ${!selectedImage || processing
                                            ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                                            : 'hover:-translate-y-0.5 active:translate-y-0'}`}
                                    style={selectedImage && !processing ? {
                                        background: 'linear-gradient(270deg, #0d9488, #14b8a6, #2dd4bf, #32BBAB, #06b6d4, #0891b2, #22d3ee, #5eead4, #0d9488)',
                                        backgroundSize: '400% 400%',
                                        animation: 'teal-shift 4s ease infinite',
                                        color: '#ffffff',
                                        boxShadow: '0 10px 30px -5px rgba(50,187,171,0.35)',
                                    } : {}}
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Generating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <HiSparkles className="w-5 h-5" />
                                            <span>Generate Look</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ═══════════════════════════════════════
                        COLUMN 3 — RESULT
                    ═══════════════════════════════════════ */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden sticky top-47.5" style={{ height: 'calc(100vh - 210px)' }}>

                        {/* Card Header */}
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-full text-white text-[10px] font-black flex items-center justify-center transition-colors ${processedImage ? 'bg-[#32BBAB]' : 'bg-gray-300'}`}>3</span>
                                <span className="text-xs font-black text-gray-700 uppercase tracking-widest font-outfit">Result</span>
                            </div>
                            {processedImage && (
                                <button onClick={() => { setProcessedImage(null); }}
                                    className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-gray-200">
                                    <FiRefreshCw className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Result Canvas — fills remaining space */}
                        <div className="relative bg-gray-50 flex-1 min-h-0">
                            {processedImage ? (
                                <Image src={processedImage} alt="VTO Result" fill className="object-contain p-3" priority />
                            ) : processing ? (
                                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                                    <div className="relative w-16 h-16 mb-5">
                                        <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
                                        <div className="absolute inset-0 border-4 border-[#32BBAB] rounded-full border-t-transparent animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <HiSparkles className="w-6 h-6 text-[#32BBAB] animate-pulse" />
                                        </div>
                                    </div>
                                    <p className="text-sm font-bold text-gray-700 font-outfit animate-pulse">AI is rendering your look...</p>
                                    <p className="text-xs text-gray-400 mt-1 font-outfit">This may take a few seconds</p>
                                </div>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center opacity-40">
                                    <HiSparkles className="w-12 h-12 text-gray-300 mb-3" />
                                    <p className="text-sm font-bold text-gray-400 font-outfit">Your look will appear here</p>
                                    <p className="text-xs text-gray-300 mt-1 font-outfit">Upload a portrait and click Generate</p>
                                </div>
                            )}
                        </div>

                        {/* Status / Download row — only shown when result exists */}
                        {processedImage && (
                            <div className="p-3 border-t border-gray-100 flex gap-2 shrink-0">
                                <button
                                    onClick={() => { const a = document.createElement('a'); a.href = processedImage; a.download = 'mingle-vto.jpg'; a.click(); }}
                                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-all font-outfit">
                                    <FiDownload className="w-3.5 h-3.5" />
                                    Save
                                </button>
                                <button onClick={() => setIsExpanded(true)}
                                    className="flex-1 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-all font-outfit">
                                    <FiMaximize2 className="w-3.5 h-3.5" />
                                    Zoom
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* ── Garment Fullscreen Overlay ── */}
            <AnimatePresence>
                {isGarmentExpanded && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-200 bg-black/90 flex items-center justify-center p-4"
                        onClick={() => setIsGarmentExpanded(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="relative max-w-2xl w-full max-h-[90vh] aspect-3/4"
                            onClick={e => e.stopPropagation()}
                        >
                            <Image
                                src={product.imgs?.previews?.[selectedVariant] || product.imgs?.thumbnails?.[selectedVariant]}
                                alt={product.title}
                                fill
                                className="object-contain rounded-2xl"
                            />
                            <button onClick={() => setIsGarmentExpanded(false)}
                                className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all">
                                <FiMinimize2 className="w-5 h-5" />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Result Fullscreen Overlay ── */}
            <AnimatePresence>
                {isExpanded && processedImage && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-200 bg-black/90 flex items-center justify-center p-4"
                        onClick={() => setIsExpanded(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="relative max-w-2xl w-full max-h-[90vh] aspect-3/4"
                            onClick={e => e.stopPropagation()}
                        >
                            <Image src={processedImage} alt="VTO Result Fullscreen" fill className="object-contain rounded-2xl" />
                            <button onClick={() => setIsExpanded(false)}
                                className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all">
                                <FiMinimize2 className="w-5 h-5" />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
